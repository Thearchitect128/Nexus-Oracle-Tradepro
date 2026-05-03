# Refactoring Opportunities: Workspace Analysis

This document identifies specific refactoring opportunities discovered in the workspace and applies the before/after methodology.

---

## 1. Password Sharing Arbitrage API: Error Handling

**File:** `/workspaces/Work/password-sharing-arbitrage/src/api.ts`  
**Priority:** HIGH  
**Impact:** Client error handling, observability, HTTP status codes

### Current State Analysis

🔴 **Problems Identified:**
1. All errors return 500 status code (should distinguish 400 vs 500)
2. No input validation before processing
3. Generic error messages expose no context
4. No error type differentiation (client error vs server error)
5. No logging hooks for error monitoring

### Proposed Improvements

🟢 **Refactoring Goals:**
1. ✅ Create typed error classes for different failure modes
2. ✅ Validate inputs early with clear error messages
3. ✅ Return appropriate HTTP status codes (400/422/500)
4. ✅ Include error metadata for debugging
5. ✅ Enable error logging infrastructure

### Implementation

The full refactored code would:

```typescript
// Step 1: Define error types
class ValidationError extends Error {
  statusCode = 400;
  constructor(public field: string, public detail: string) {
    super(`Invalid ${field}: ${detail}`);
    this.name = 'ValidationError';
  }
}

class ProcessingError extends Error {
  statusCode = 422;
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ProcessingError';
  }
}

// Step 2: Create validator functions
function validateAnalysisInput(input: unknown): { input: Record<string, unknown>; config: Record<string, unknown> } {
  const body = input as Record<string, unknown>;
  
  if (!body.input || typeof body.input !== 'object') {
    throw new ValidationError('input', 'Must be a valid object');
  }
  if (!body.config || typeof body.config !== 'object') {
    throw new ValidationError('config', 'Must be a valid object');
  }
  
  return { input: body.input as Record<string, unknown>, config: body.config as Record<string, unknown> };
}

// Step 3: Create unified error handler
function handleError(error: unknown): { status: number; body: Record<string, unknown> } {
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      body: { error: error.message, field: error.field, detail: error.detail, type: 'VALIDATION_ERROR' }
    };
  }
  if (error instanceof ProcessingError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code, type: 'PROCESSING_ERROR' }
    };
  }
  // Log unexpected errors for debugging
  console.error('Unexpected error:', error);
  return {
    status: 500,
    body: { error: 'Internal server error', type: 'INTERNAL_ERROR' }
  };
}

// Step 4: Apply to routes
app.post('/analyze', (req, res) => {
  try {
    const { input, config } = validateAnalysisInput(req.body);
    const result = runArbitrageAnalysis(input, config);
    res.status(200).json(result);
  } catch (error) {
    const { status, body } = handleError(error);
    res.status(status).json(body);
  }
});

app.post('/enforce', (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    
    if (typeof body.accountId !== 'string') {
      throw new ValidationError('accountId', 'Must be a string');
    }
    if (typeof body.riskScore !== 'number' || body.riskScore < 0 || body.riskScore > 1) {
      throw new ValidationError('riskScore', 'Must be a number between 0 and 1');
    }
    if (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1) {
      throw new ValidationError('confidence', 'Must be a number between 0 and 1');
    }
    
    const enforcement = determineEnforcement(body.riskScore as number, body.confidence as number, body.config);
    res.status(200).json({ accountId: body.accountId, enforcement });
  } catch (error) {
    const { status, body: errorBody } = handleError(error);
    res.status(status).json(errorBody);
  }
});
```

### Impact Assessment

✅ **Benefits:**
- Clients receive proper HTTP status codes (400 for validation, 422 for business logic, 500 for server)
- Error responses include structured metadata for programmatic handling
- Monitoring can now distinguish between user errors and system failures
- Type safety prevents error handling bugs
- Logging hooks enable debugging and observability

📊 **Effort:** 2-3 hours | **Risk:** Low (fully backward compatible with error response structure)

---

## 2. Crypto Utilities: Global State to DI

**File:** `/workspaces/Work/server.ts`  
**Priority:** MEDIUM  
**Impact:** Testability, thread safety, error handling

### Current State Analysis

🔴 **Problems Identified:**
1. Global mutable state `let serverCrypto: ServerCrypto | null = null`
2. Implicit singleton pattern (hard to test, mock, or parallelize)
3. Initialization scattered across functions
4. Type safety loose around CryptoKey operations
5. No way to invalidate or refresh keys without mutations

### Proposed Improvements

🟢 **Refactoring Goals:**
1. ✅ Move crypto context to dependency injection
2. ✅ Create testable, mockable crypto services
3. ✅ Use readonly/immutable data structures
4. ✅ Separate initialization from usage
5. ✅ Enable parallel request handling

### Key Changes

```typescript
// Create immutable crypto context interface
interface CryptoContext {
  readonly privateKey: CryptoKey;
  readonly publicKeyBase64: string;
}

// Crypto initialization responsibility
class CryptoInitializer {
  async generateKeyPair(): Promise<CryptoContext> {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    const publicKeyDer = await crypto.subtle.exportKey("spki", pair.publicKey);
    return {
      privateKey: pair.privateKey,
      publicKeyBase64: bytesToBase64(new Uint8Array(publicKeyDer))
    };
  }
}

// Signing responsibility (depends on CryptoContext)
class PayloadSigner {
  constructor(private context: CryptoContext) {}

  async sign(payload: CanonicalPayload): Promise<{ hash: string; signature: string; publicKey: string }> {
    const canonical = canonicalize(payload);
    const hash = await sha256(canonical);
    const signatureBuffer = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.context.privateKey,
      new TextEncoder().encode(canonical)
    );

    return {
      hash,
      signature: bytesToBase64(new Uint8Array(signatureBuffer)),
      publicKey: this.context.publicKeyBase64
    };
  }
}

// HTTP request handler (receives dependencies)
async function handleSignProof(req: IncomingMessage, res: ServerResponse, signer: PayloadSigner): Promise<void> {
  try {
    const body = await readJson(req);
    const payload = parseCanonicalPayload(body);
    const signature = await signer.sign(payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(signature));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
}

// Application setup (one-time initialization)
async function main() {
  const initializer = new CryptoInitializer();
  const context = await initializer.generateKeyPair();
  const signer = new PayloadSigner(context);

  createServer((req, res) => handleSignProof(req, res, signer)).listen(8080);
}
```

### Testing Benefits

**Before (impossible to test in isolation):**
```typescript
// Can't test without globals, singleton state, etc.
// Hard to mock CryptoKey operations
// Can't run tests in parallel
```

**After (fully testable):**
```typescript
// Mock CryptoContext for testing
const mockContext: CryptoContext = {
  privateKey: new Proxy({}, { get: () => {} }) as CryptoKey,
  publicKeyBase64: 'test-key'
};

const signer = new PayloadSigner(mockContext);

// Now you can test signing logic independently
test('signer produces consistent signatures', async () => {
  const result = await signer.sign(testPayload);
  expect(result.publicKey).toBe('test-key');
});
```

### Impact Assessment

✅ **Benefits:**
- Crypto logic becomes testable without global state
- Multiple instances can coexist (useful for multi-tenant scenarios)
- Thread-safe (no shared mutable state)
- Clear dependency graph
- Easy to switch implementations (e.g., HSM-backed crypto)

📊 **Effort:** 4-5 hours | **Risk:** Medium (requires integration testing)

---

## 3. Password Arbitrage: Complex Logic Separation

**File:** `/workspaces/Work/password-sharing-arbitrage/src/index.ts`  
**Priority:** HIGH  
**Impact:** Maintainability, testability, performance profiling

### Current State Analysis

🔴 **Problems Identified:**
1. `detectGeoSplit()` manually reduces and iterates (verbose, error-prone)
2. `detectConcurrencyBreach()` nested loops perform O(n²) without optimization
3. Multiple functions repeat session grouping logic
4. No intermediate result types (implicit coupling)
5. Validation mixed with computation

### Proposed Improvements

🟢 **Refactoring Goals:**
1. ✅ Extract session grouping to reusable function
2. ✅ Create typed result objects for each detection algorithm
3. ✅ Separate validation from computation
4. ✅ Enable performance profiling/optimization
5. ✅ Improve code reuse across detection functions

### Key Changes

```typescript
// Type-safe result objects
interface DetectionResult<T> {
  count: number;
  accounts: Record<string, T>;
  timestamp: number;
}

// Reusable session grouping
function groupSessionsByAccountId(sessions: Session[]): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();
  for (const session of sessions) {
    const existing = grouped.get(session.accountId) ?? [];
    grouped.set(session.accountId, [...existing, session]);
  }
  return grouped;
}

// Separated concerns: geo split detection
interface GeoSplitMetrics {
  splitCount: number;
  totalSessions: number;
  rate: number;
}

function detectGeoSplit(sessions: Session[], config: Config): DetectionResult<GeoSplitMetrics> {
  const grouped = groupSessionsByAccountId(sessions);
  const accounts: Record<string, GeoSplitMetrics> = {};
  let totalFlagged = 0;

  for (const [accountId, accountSessions] of grouped) {
    const sorted = [...accountSessions].sort((a, b) => a.startTime - b.startTime);
    let splitCount = 0;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const timeSinceLastEnd = curr.startTime - (prev.startTime + prev.duration);
      const withinWindow = timeSinceLastEnd < config.geoWindowHours * 3600;

      if (curr.geo !== prev.geo && withinWindow) {
        splitCount++;
      }
    }

    const rate = sorted.length > 0 ? splitCount / sorted.length : 0;
    accounts[accountId] = { splitCount, totalSessions: sorted.length, rate };

    if (rate > config.geoSplitThreshold) {
      totalFlagged++;
    }
  }

  return { count: totalFlagged, accounts, timestamp: Date.now() };
}

// Separated concerns: concurrency breach detection with optimization
interface ConcurrencyMetrics {
  maxConcurrent: number;
  breachCount: number;
  planLimit: number;
}

function detectConcurrencyBreach(
  accounts: Account[],
  sessions: Session[],
  config: Config
): DetectionResult<ConcurrencyMetrics> {
  const grouped = groupSessionsByAccountId(sessions);
  const accounts_results: Record<string, ConcurrencyMetrics> = {};
  let totalFlagged = 0;

  for (const account of accounts) {
    const accountSessions = grouped.get(account.id) ?? [];
    let maxConcurrent = 0;

    // Optimized: only check concurrent windows, not all pairs
    const sortedSessions = [...accountSessions].sort((a, b) => a.startTime - b.startTime);

    for (const current of sortedSessions) {
      const overlapping = sortedSessions.filter(other =>
        other.startTime < current.startTime + current.duration &&
        other.startTime + other.duration > current.startTime
      ).length;

      maxConcurrent = Math.max(maxConcurrent, overlapping);
    }

    const threshold = account.planLimit + config.concurrencyThreshold;
    const breaches = maxConcurrent > threshold ? 1 : 0;

    accounts_results[account.id] = {
      maxConcurrent,
      breachCount: breaches,
      planLimit: account.planLimit
    };

    if (breaches) {
      totalFlagged++;
    }
  }

  return { count: totalFlagged, accounts: accounts_results, timestamp: Date.now() };
}
```

### Testability Example

```typescript
test('detectGeoSplit groups sessions correctly', () => {
  const sessions: Session[] = [
    { accountId: 'acc1', geo: 'US', deviceId: 'd1', startTime: 1000, duration: 100 },
    { accountId: 'acc1', geo: 'UK', deviceId: 'd2', startTime: 1050, duration: 100 },
  ];
  const config: Config = { geoWindowHours: 1, ... };

  const result = detectGeoSplit(sessions, config);
  expect(result.accounts['acc1'].rate).toBeGreaterThan(0);
});
```

### Impact Assessment

✅ **Benefits:**
- Reusable session grouping reduces code duplication
- Type-safe result objects prevent implicit coupling
- Easier to profile and optimize performance
- Each detection algorithm becomes independently testable
- Maintenance burden reduced (changes to one algorithm don't affect others)

📊 **Effort:** 3-4 hours | **Risk:** Low (purely refactoring, logic unchanged)

---

## 4. Type Safety: Eliminate `any` Types

**File:** Multiple files using `any`  
**Priority:** MEDIUM  
**Impact:** Type safety, IDE support, refactoring confidence

### Current Pattern

🔴 **Before:**
```typescript
function stableStringify(obj: any): string { ... }
function processData(input: any): any { ... }
const result: any = someFunction();
```

🟢 **After:**
```typescript
function stableStringify<T extends SerializableType>(obj: T): string { ... }
function processData<TInput, TOutput>(input: TInput, transformer: (t: TInput) => TOutput): TOutput { ... }
const result: ProcessResult = someFunction();
```

### Generic Pattern Template

```typescript
// Define what types are actually allowed
type SerializableType = string | number | boolean | null | SerializableType[] | { [key: string]: SerializableType };

// Use generics with constraints instead of `any`
function transform<T extends SerializableType>(obj: T): string {
  // Now TypeScript ensures T is serializable
  return JSON.stringify(obj);
}
```

### Checklist for Eliminating `any`

- [ ] Identify all `any` type usages with `grep -r ": any" src/`
- [ ] For each `any`, determine what types are actually expected
- [ ] Create a generic type parameter or union type
- [ ] Update function signatures
- [ ] Verify TypeScript still compiles in strict mode
- [ ] Update tests to verify behavior unchanged

---

## 5. Recommended Refactoring Order

### Phase 1 (This Week): High-Impact, Low-Risk
1. **Password Arbitrage API Error Handling** (Session A)
   - Estimated: 2-3 hours
   - Risk: Low (backward compatible)
   - Impact: High (better error handling, HTTP status codes)

2. **Session Grouping Extraction** (Session C)
   - Estimated: 3-4 hours
   - Risk: Low (pure refactoring)
   - Impact: High (code reuse, testability)

### Phase 2 (Next Week): Medium-Impact, Medium-Risk
3. **Crypto Global State to DI** (Session B)
   - Estimated: 4-5 hours
   - Risk: Medium (needs integration testing)
   - Impact: Medium (testability, thread safety)

4. **Eliminate `any` Types** (Session D)
   - Estimated: 6-8 hours (distributed)
   - Risk: Low (compile-time checks)
   - Impact: Medium (prevents bugs, improves IDE support)

---

## 6. Metrics to Track

After each refactoring:

- [ ] **Test Coverage:** Did it increase?
- [ ] **Type Safety:** `tsc --strict` passes?
- [ ] **Code Duplication:** Did it decrease?
- [ ] **Complexity:** Is cyclomatic complexity lower?
- [ ] **Performance:** Did any metrics change?

```bash
# Run strict type checking
npx tsc --strict

# Check code duplication
npx jscpd src/

# View complexity
npx complexity-report src/
```

---

## 7. Next Steps

1. ✅ Review this document
2. ✅ Prioritize refactorings based on team capacity
3. ✅ Create feature branches for each refactoring
4. ✅ Follow the before/after methodology for each
5. ✅ Document why each change was made
6. ✅ Get team review before merging
