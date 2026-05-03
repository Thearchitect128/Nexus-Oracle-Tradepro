# Code Refactoring Teaching Template: Before/After Methodology

A systematic, visual approach to demonstrating code quality improvements. This template is designed for code review, documentation, and knowledge transfer.

---

## 1. The Refactoring Framework

### Phase 1: Analyze Original Code
- ❌ Identify syntax errors, unstable patterns, or unclear logic
- ❌ Spot code smells (generic error handling, unclear naming, tight coupling)
- ❌ Note maintenance burden or scalability issues

### Phase 2: Plan Fixes
- ✅ List specific improvements in priority order
- ✅ Define refactoring goals (readability, type safety, maintainability)
- ✅ Break changes into logical chunks

### Phase 3: Refactor & Organize
- ✅ Apply consistent patterns and naming conventions
- ✅ Improve type safety and error handling
- ✅ Enhance clarity through better structure

### Phase 4: Explain Each Improvement
- Describe **why** the change matters
- Show the **impact** on maintainability
- Link to broader coding principles

### Phase 5: Validate & Test
- Verify new code maintains original functionality
- Ensure type safety checks pass
- Document any API changes

---

## 2. Visual Presentation Template

```markdown
## Example: [Feature/Component Name]

### Callouts:

🔴 **Before Issues:**
- Issue 1 with specific detail
- Issue 2 with specific detail
- Issue 3 with specific detail

🟢 **After Improvements:**
- Fix 1: specific improvement
- Fix 2: specific improvement
- Fix 3: specific improvement

### Side-by-Side Comparison

**Before:**
```typescript
// messy, problematic code here
```

**After:**
```typescript
// improved, clean code here
```

### Highlighted Changes:
✅ Change 1 (benefit)
✅ Change 2 (benefit)
✅ Change 3 (benefit)

### Why This Matters:
[Explanation of long-term benefits]
```

---

## 3. Real-World Examples from Codebase

### Example A: Error Handling Pattern (Password Sharing Arbitrage API)

🔴 **Before Issues:**
- Generic `(error as Error).message` error handling masks actual error types
- No distinction between client errors (400) and server errors (500)
- No error logging or monitoring hooks
- Unclear what validation errors are possible

🟢 **After Improvements:**
- Typed error handling with specific error classes
- Proper HTTP status codes for different failure modes
- Error context preserved for debugging
- Clear validation error messages

**Before:**
```typescript
app.post('/analyze', (req, res) => {
  try {
    const { input, config } = req.body;
    const result = runArbitrageAnalysis(input, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
```

**After:**
```typescript
// Define typed errors
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AnalysisError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Handler with proper error mapping
app.post('/analyze', (req, res) => {
  try {
    const { input, config } = req.body;
    
    // Validate inputs early
    if (!input || typeof input !== 'object') {
      throw new ValidationError('input', 'Input must be a valid object');
    }
    if (!config || typeof config !== 'object') {
      throw new ValidationError('config', 'Config must be a valid object');
    }
    
    const result = runArbitrageAnalysis(input, config);
    res.json(result);
  } catch (error) {
    // Map errors to appropriate HTTP status codes
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        error: error.message, 
        field: error.field,
        type: 'VALIDATION_ERROR'
      });
    } else if (error instanceof AnalysisError) {
      res.status(422).json({ 
        error: error.message, 
        code: error.code,
        type: 'ANALYSIS_ERROR'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        type: 'INTERNAL_ERROR'
      });
    }
  }
});
```

✅ **Highlighted Changes:**
- Type-safe error classes distinguish failure modes
- HTTP status codes properly reflect error types (400 for validation, 422 for business logic, 500 for server issues)
- Error responses include structured metadata for client handling
- Early validation prevents cascading failures
- Error logging hooks are now possible

✅ **Why This Matters:**
- Clients can handle different errors appropriately
- Debugging becomes faster with error codes and context
- Monitoring can distinguish between user errors and system failures
- Type safety prevents error handling bugs

---

### Example B: Generic Type Safety (Crypto Utilities)

🔴 **Before Issues:**
- `any` type undermines TypeScript safety
- No validation of input types at runtime
- `reduce` accumulator type is inferred, not explicit
- Sorting/parsing logic is tightly coupled

🟢 **After Improvements:**
- Generic types constrain behavior safely
- Runtime validation ensures type contracts
- Explicit typing prevents logic errors
- Separation of concerns (parsing, hashing, validation)

**Before:**
```typescript
function stableStringify(obj: any): string {
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(",")}]`;
  }
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj)
      .sort()
      .map(k => `"${k}":${stableStringify(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(obj);
}

function detectGeoSplit(sessions: Session[], config: Config): { count: number; accounts: Record<string, { rate: number; sessions: number }> } {
  const accountSessions = sessions.reduce((acc, session) => {
    if (!acc[session.accountId]) acc[session.accountId] = [];
    acc[session.accountId].push(session);
    return acc;
  }, {} as Record<string, Session[]>);
  // ... rest of logic
}
```

**After:**
```typescript
// Generic serializer with constraint
function stableStringify<T extends string | number | boolean | null | T[] | Record<string, T>>(
  obj: T
): string {
  if (Array.isArray(obj)) {
    return `[${(obj as T[]).map(stableStringify).join(",")}]`;
  }
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj as Record<string, T>)
      .sort()
      .map(k => `"${k}":${stableStringify((obj as Record<string, T>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(obj);
}

// Group sessions with proper typing
function groupSessionsByAccountId(sessions: Session[]): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();
  for (const session of sessions) {
    const existing = grouped.get(session.accountId) ?? [];
    grouped.set(session.accountId, [...existing, session]);
  }
  return grouped;
}

// Compute geo split metrics with clear typing
interface GeoSplitMetrics {
  count: number;
  accounts: Record<string, { rate: number; sessions: number }>;
}

function detectGeoSplit(sessions: Session[], config: Config): GeoSplitMetrics {
  const accountSessions = groupSessionsByAccountId(sessions);
  const accountMetrics: Record<string, { rate: number; sessions: number }> = {};
  let totalCount = 0;

  for (const [accId, sessions] of accountSessions) {
    const sortedSessions = [...sessions].sort((a, b) => a.startTime - b.startTime);
    let splits = 0;

    for (let i = 1; i < sortedSessions.length; i++) {
      const prev = sortedSessions[i - 1];
      const curr = sortedSessions[i];
      const timeBetween = curr.startTime - (prev.startTime + prev.duration);
      const withinWindow = timeBetween < config.geoWindowHours * 60 * 60;
      
      if (curr.geo !== prev.geo && withinWindow) {
        splits++;
      }
    }

    const rate = sortedSessions.length > 0 ? splits / sortedSessions.length : 0;
    accountMetrics[accId] = { rate, sessions: sortedSessions.length };
    
    if (rate > config.geoSplitThreshold) {
      totalCount++;
    }
  }

  return { count: totalCount, accounts: accountMetrics };
}
```

✅ **Highlighted Changes:**
- Generic constraint `<T extends ...>` prevents `any` type errors
- Extract `groupSessionsByAccountId` function improves readability and testability
- Use `Map<K, V>` instead of `Record<string, T[]>` (immutable default, clear intent)
- Variable names like `timeBetween`, `withinWindow` clarify logic
- Interface `GeoSplitMetrics` documents return type explicitly

✅ **Why This Matters:**
- TypeScript catches type errors at compile time, not runtime
- Functions are easier to test in isolation
- New developers understand intent faster
- Bug prevention: logic is explicit, not hidden in type inference

---

### Example C: Server Crypto Operations (Separation of Concerns)

🔴 **Before Issues:**
- Global mutable state (`serverCrypto`) is hard to test
- Initialization logic mixed with signing logic
- No clear error handling for crypto operations
- Type safety loose around key exports

🟢 **After Improvements:**
- Dependency injection replaces globals
- Each operation has single responsibility
- Explicit error types for crypto failures
- Strong typing around CryptoKey operations

**Before:**
```typescript
let serverCrypto: ServerCrypto | null = null

async function initServerCrypto(): Promise<ServerCrypto> {
  if (serverCrypto) {
    return serverCrypto
  }
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  )
  const publicKeyDer = await crypto.subtle.exportKey("spki", pair.publicKey)
  serverCrypto = {
    privateKey: pair.privateKey,
    publicKeyBase64: bytesToBase64(new Uint8Array(publicKeyDer))
  }
  return serverCrypto
}

async function signCanonicalPayload(payload: CanonicalPayload): Promise<{
  hash: string
  signature: string
  publicKey: string
}> {
  const cryptoCtx = await initServerCrypto()
  const canonical = canonicalize(payload)
  const hash = await sha256(canonical)
  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoCtx.privateKey,
    new TextEncoder().encode(canonical)
  )
  return {
    hash,
    signature: bytesToBase64(new Uint8Array(signatureBuffer)),
    publicKey: cryptoCtx.publicKeyBase64
  }
}
```

**After:**
```typescript
// Typed crypto result
interface CryptoSignature {
  hash: string;
  signature: string;
  publicKey: string;
}

// Immutable crypto context
interface CryptoContext {
  readonly privateKey: CryptoKey;
  readonly publicKeyBase64: string;
}

// Crypto initialization class (testable, injectable)
class CryptoInitializer {
  async generateKeyPair(): Promise<CryptoContext> {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    if (!pair.publicKey) {
      throw new Error("Public key generation failed");
    }

    const publicKeyDer = await crypto.subtle.exportKey("spki", pair.publicKey);
    const publicKeyBase64 = bytesToBase64(new Uint8Array(publicKeyDer));

    return {
      privateKey: pair.privateKey,
      publicKeyBase64
    };
  }
}

// Signing logic (pure function of context)
class PayloadSigner {
  constructor(private cryptoContext: CryptoContext) {}

  async sign(payload: CanonicalPayload): Promise<CryptoSignature> {
    const canonical = canonicalize(payload);
    const hash = await sha256(canonical);
    
    const signatureBuffer = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.cryptoContext.privateKey,
      new TextEncoder().encode(canonical)
    );

    return {
      hash,
      signature: bytesToBase64(new Uint8Array(signatureBuffer)),
      publicKey: this.cryptoContext.publicKeyBase64
    };
  }
}

// Usage: dependency injection, no globals
async function handleSignProof(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    // Initialize once, inject into handler
    const initializer = new CryptoInitializer();
    const cryptoContext = await initializer.generateKeyPair();
    const signer = new PayloadSigner(cryptoContext);

    const body = await readJson(req);
    const payload = parseCanonicalPayload(body);
    const signature = await signer.sign(payload);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(signature));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Signing failed" }));
  }
}
```

✅ **Highlighted Changes:**
- Remove global mutable state (`let serverCrypto`)
- Separate concerns: `CryptoInitializer` vs `PayloadSigner`
- Dependency injection makes testing trivial (mock CryptoContext)
- Readonly fields prevent accidental mutations
- Each class has single responsibility

✅ **Why This Matters:**
- Global state is a testing nightmare (hidden dependencies)
- Classes are easier to mock and test independently
- Immutable fields prevent entire categories of bugs
- New team members understand architecture faster
- Side effects are explicit, not hidden

---

## 4. Checklist for Applying This Methodology

Before submitting refactored code:

- [ ] **Analyzed** original code and identified 3+ specific issues
- [ ] **Planned** fixes with clear rationale for each change
- [ ] **Refactored** code maintains original functionality
- [ ] **Explained** why each change improves the codebase
- [ ] **Validated** with TypeScript compiler (strict mode)
- [ ] **Documented** any API changes or new patterns
- [ ] **Tested** both before and after implementations work identically
- [ ] **Reviewed** for any unintended consequences

---

## 5. Anti-Patterns to Watch For

| ❌ Anti-Pattern | ✅ Correct Approach |
|---|---|
| Global mutable state | Dependency injection |
| `any` type | Generics with constraints |
| Generic error catching | Typed error classes |
| Tightly coupled logic | Small, focused functions |
| No type hints | Full type annotations |
| Unclear variable names | Self-documenting names |

---

## 6. Quick Reference: Common Refactorings

### Error Handling
```typescript
// ❌ Before
catch (error) { res.status(500).json({ error: (error as Error).message }); }

// ✅ After
catch (error) {
  if (error instanceof ValidationError) res.status(400).json(...);
  else if (error instanceof BusinessLogicError) res.status(422).json(...);
  else res.status(500).json(...);
}
```

### Type Safety
```typescript
// ❌ Before
function process(obj: any): any { ... }

// ✅ After
function process<T extends ValidType>(obj: T): Result<T> { ... }
```

### Globals to DI
```typescript
// ❌ Before
let globalState: State | null = null;

// ✅ After
class Component {
  constructor(private state: State) {}
}
```

### Tight Coupling
```typescript
// ❌ Before
function doEverything() { init(); compute(); save(); }

// ✅ After
class Service {
  constructor(private init: Initializer, private compute: Computer, private save: Saver) {}
}
```

---

## 7. Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Design Patterns: Dependency Injection
- SOLID Principles: Single Responsibility, Open/Closed
- Error Handling Best Practices: https://nodejs.org/en/docs/guides/nodejs-error-handling/
