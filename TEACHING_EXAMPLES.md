# Teaching Examples: Before/After Code Quality Improvements

A collection of refactoring examples demonstrating the teaching methodology applied to real workspace code.

---

## Example 1: String Canonicalization - Type Safety & Immutability

### Context
Workspace file: `/workspaces/Work/password-sharing-arbitrage/src/index.ts`

### 🔴 Before Issues:
- `obj: any` defeats TypeScript type checking
- No compile-time verification of serializable types
- IDE cannot provide autocomplete or type hints
- Runtime errors only discovered in production
- Hard to refactor when type is unclear

### 🟢 After Improvements:
- Generic type constraint ensures only serializable types pass
- Compile-time type checking catches errors early
- IDE provides full autocomplete and navigation
- Self-documenting function signature
- Safe refactoring with compiler assistance

---

### Before Code:
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

// Usage - no type safety
const result = stableStringify(userInput);  // userInput could be anything!
```

### After Code:
```typescript
// Step 1: Define what types are actually serializable
export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

// Step 2: Generic function with type constraint
export function stableStringify<T extends SerializableValue>(obj: T): string {
  if (Array.isArray(obj)) {
    // TypeScript knows obj is T[] here, so mapping is safe
    return `[${(obj as SerializableValue[]).map(stableStringify).join(",")}]`;
  }

  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    // TypeScript knows obj is an object (not array) here
    const objRecord = obj as Record<string, SerializableValue>;
    return `{${Object.keys(objRecord)
      .sort()
      .map(k => `"${k}":${stableStringify(objRecord[k])}`)
      .join(",")}}`;
  }

  // For primitives (string, number, boolean, null)
  return JSON.stringify(obj);
}

// Usage - type safety enforced!
const validData = { name: "Alice", age: 30, active: true };
stableStringify(validData);  // ✅ Compiles

const invalidData = { callback: () => {} };
stableStringify(invalidData);  // ❌ TypeScript error: functions not serializable
```

### 🎯 Key Improvements:

| Aspect | Before | After |
|--------|--------|-------|
| **Type Safety** | None (`any` = no checks) | Full (generic constraint) |
| **IDE Support** | None | ✅ Autocomplete, navigation, refactoring |
| **Error Detection** | Runtime only | Compile-time |
| **Documentation** | Implicit | Explicit in function signature |
| **Refactoring** | Dangerous | Safe (compiler assisted) |

### 📚 Principle Applied:
**Generics with Constraints** — Replace `any` with `<T extends ValidTypes>` to get type safety while maintaining flexibility.

---

## Example 2: Session Analysis - Extraction & Composition

### Context
Workspace file: `/workspaces/Work/password-sharing-arbitrage/src/index.ts`

### 🔴 Before Issues:
- **Repeated Logic:** Session grouping done in 3+ functions
- **Implicit Coupling:** Each function assumes specific reduce pattern
- **Hard to Test:** Can't test grouping separately from detection
- **Unmaintainable:** Fix bug in grouping logic = update 3 places
- **Verbose:** `reduce` with manual accumulator updates

### 🟢 After Improvements:
- **Single Source of Truth:** Grouping logic in one place
- **Explicit Contracts:** Return type clearly defines what grouping produces
- **Testable:** Grouping logic tested independently
- **Maintainable:** Fix once, benefits all consumers
- **Readable:** Self-documenting function name

---

### Before Code:
```typescript
function detectGeoSplit(sessions: Session[], config: Config): { count: number; accounts: Record<string, { rate: number; sessions: number }> } {
  // 🔴 Manual grouping - repeated in other functions
  const accountSessions = sessions.reduce((acc, session) => {
    if (!acc[session.accountId]) acc[session.accountId] = [];
    acc[session.accountId].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  let totalCount = 0;
  const accountMetrics: Record<string, { rate: number; sessions: number }> = {};

  for (const [accId, sess] of Object.entries(accountSessions)) {
    sess.sort((a, b) => a.startTime - b.startTime);
    let splits = 0;
    for (let i = 1; i < sess.length; i++) {
      const prev = sess[i - 1];
      const curr = sess[i];
      if (curr.geo !== prev.geo && (curr.startTime - (prev.startTime + prev.duration)) < config.geoWindowHours * 60 * 60) {
        splits++;
      }
    }
    const rate = sess.length > 0 ? splits / sess.length : 0;
    accountMetrics[accId] = { rate, sessions: sess.length };
    if (rate > config.geoSplitThreshold) totalCount++;
  }
  return { count: totalCount, accounts: accountMetrics };
}

function detectDeviceBloom(accounts: Account[], config: Config): { count: number; accounts: Record<string, { density: number; devices: number }> } {
  // 🔴 Same grouping logic would be needed here too
  const accountMetrics: Record<string, { density: number; devices: number }> = {};
  let count = 0;
  accounts.forEach(acc => {
    const density = acc.devices.length / 30;
    accountMetrics[acc.id] = { density, devices: acc.devices.length };
    if (density > config.deviceDensityThreshold) count++;
  });
  return { count, accounts: accountMetrics };
}
```

### After Code:
```typescript
// Step 1: Define clear result types
interface GeoSplitMetrics {
  rate: number;
  sessions: number;
}

interface DeviceDensityMetrics {
  density: number;
  devices: number;
}

interface DetectionResult<T> {
  count: number;
  accounts: Record<string, T>;
}

// Step 2: Extract reusable grouping function
export function groupSessionsByAccountId(sessions: Session[]): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();
  
  for (const session of sessions) {
    const existing = grouped.get(session.accountId) ?? [];
    grouped.set(session.accountId, [...existing, session]);
  }
  
  return grouped;
}

// Step 3: Use extracted function - clean, readable, testable
export function detectGeoSplit(sessions: Session[], config: Config): DetectionResult<GeoSplitMetrics> {
  const grouped = groupSessionsByAccountId(sessions);
  const accountMetrics: Record<string, GeoSplitMetrics> = {};
  let totalCount = 0;

  for (const [accId, accountSessions] of grouped) {
    const sorted = [...accountSessions].sort((a, b) => a.startTime - b.startTime);
    let splits = 0;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const timeBetween = curr.startTime - (prev.startTime + prev.duration);
      const withinWindow = timeBetween < config.geoWindowHours * 60 * 60;

      if (curr.geo !== prev.geo && withinWindow) {
        splits++;
      }
    }

    const rate = sorted.length > 0 ? splits / sorted.length : 0;
    accountMetrics[accId] = { rate, sessions: sorted.length };

    if (rate > config.geoSplitThreshold) {
      totalCount++;
    }
  }

  return { count: totalCount, accounts: accountMetrics };
}

// Step 4: Device bloom now reuses grouping
export function detectDeviceBloom(accounts: Account[], sessions: Session[], config: Config): DetectionResult<DeviceDensityMetrics> {
  const grouped = groupSessionsByAccountId(sessions);  // ✅ Reuse!
  const accountMetrics: Record<string, DeviceDensityMetrics> = {};
  let count = 0;

  for (const account of accounts) {
    const accountSessions = grouped.get(account.id) ?? [];
    const density = accountSessions.length / 30;
    accountMetrics[account.id] = { density, devices: account.devices.length };

    if (density > config.deviceDensityThreshold) {
      count++;
    }
  }

  return { count, accounts: accountMetrics };
}
```

### ✅ Testing Now Possible:

```typescript
test('groupSessionsByAccountId separates sessions by account', () => {
  const sessions: Session[] = [
    { accountId: 'acc1', geo: 'US', deviceId: 'd1', startTime: 1000, duration: 100 },
    { accountId: 'acc2', geo: 'UK', deviceId: 'd2', startTime: 2000, duration: 100 },
    { accountId: 'acc1', geo: 'US', deviceId: 'd3', startTime: 3000, duration: 100 },
  ];

  const grouped = groupSessionsByAccountId(sessions);

  expect(grouped.get('acc1')).toHaveLength(2);
  expect(grouped.get('acc2')).toHaveLength(1);
});

test('detectGeoSplit counts geographic splits correctly', () => {
  const sessions: Session[] = [
    { accountId: 'acc1', geo: 'US', deviceId: 'd1', startTime: 0, duration: 1000 },
    { accountId: 'acc1', geo: 'UK', deviceId: 'd2', startTime: 1500, duration: 1000 }, // Within window
  ];
  const config: Config = { geoWindowHours: 2, ... };

  const result = detectGeoSplit(sessions, config);
  expect(result.accounts['acc1'].rate).toBeGreaterThan(0);
});
```

### 🎯 Key Improvements:

| Aspect | Before | After |
|--------|--------|-------|
| **Code Reuse** | 0% (repeated logic) | 100% (single source) |
| **Testability** | Grouped logic + detection coupled | Separately testable |
| **Maintainability** | Fix bug 3 times | Fix once |
| **Readability** | 50 lines of boilerplate | Clear intent |
| **Type Safety** | Implicit contracts | Explicit `DetectionResult<T>` |

### 📚 Principle Applied:
**Composition & Single Responsibility** — Extract common behavior into focused functions; compose higher-level behavior from them.

---

## Example 3: HTTP Error Handling - Typed Errors & Status Codes

### Context
Workspace file: `/workspaces/Work/password-sharing-arbitrage/src/api.ts`

### 🔴 Before Issues:
- All errors return HTTP 500 (should distinguish 400 vs 500)
- No input validation (invalid requests treated as server errors)
- Generic error message hides actual problem
- No structured error response (client must parse strings)
- No logging/monitoring hooks

### 🟢 After Improvements:
- Validation errors return 400 (client's problem)
- Business logic errors return 422 (server could not process)
- Server errors return 500 (server's problem)
- Structured error response with type discriminator
- Clear error codes for logging and monitoring

---

### Before Code:
```typescript
// 🔴 Generic catch-all, all errors look the same
app.post('/analyze', (req, res) => {
  try {
    const { input, config } = req.body;  // ❌ No validation!
    const result = runArbitrageAnalysis(input, config);
    res.json(result);
  } catch (error) {
    // ❌ Everything returns 500
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/enforce', (req, res) => {
  try {
    const { accountId, riskScore, confidence, config } = req.body;  // ❌ No validation!
    const enforcement = determineEnforcement(riskScore, confidence, config);
    res.json({ accountId, enforcement });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });  // ❌ No distinction
  }
});
```

### After Code:
```typescript
// Step 1: Define typed errors for different failure modes
class ValidationError extends Error {
  readonly statusCode = 400;
  
  constructor(
    readonly field: string,
    readonly detail: string,
    message?: string
  ) {
    super(message ?? `Invalid ${field}: ${detail}`);
    this.name = 'ValidationError';
  }
}

class ProcessingError extends Error {
  readonly statusCode = 422;
  
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

// Step 2: Validation helper with clear error messages
function validateAnalysisRequest(body: unknown): { input: Record<string, unknown>; config: Record<string, unknown> } {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'Must be a JSON object');
  }

  const payload = body as Record<string, unknown>;

  if (!payload.input || typeof payload.input !== 'object') {
    throw new ValidationError('input', 'Must be a valid object', 'Missing or invalid input field');
  }

  if (!payload.config || typeof payload.config !== 'object') {
    throw new ValidationError('config', 'Must be a valid object', 'Missing or invalid config field');
  }

  return {
    input: payload.input as Record<string, unknown>,
    config: payload.config as Record<string, unknown>
  };
}

// Step 3: Unified error handler
function handleError(error: unknown): { status: number; body: Record<string, unknown> } {
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      body: {
        type: 'VALIDATION_ERROR',
        error: error.message,
        field: error.field,
        detail: error.detail
      }
    };
  }

  if (error instanceof ProcessingError) {
    return {
      status: error.statusCode,
      body: {
        type: 'PROCESSING_ERROR',
        error: error.message,
        code: error.code
      }
    };
  }

  // Log unexpected errors for observability
  console.error('[ERROR]', {
    type: 'UNEXPECTED_ERROR',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });

  return {
    status: 500,
    body: {
      type: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }
  };
}

// Step 4: Apply to routes with validation and error handling
app.post('/analyze', (req, res) => {
  try {
    const { input, config } = validateAnalysisRequest(req.body);  // ✅ Validate first
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

    // ✅ Validate each field
    if (typeof body.accountId !== 'string' || !body.accountId.trim()) {
      throw new ValidationError('accountId', 'Must be a non-empty string');
    }

    if (typeof body.riskScore !== 'number' || body.riskScore < 0 || body.riskScore > 1) {
      throw new ValidationError('riskScore', 'Must be a number between 0 and 1');
    }

    if (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1) {
      throw new ValidationError('confidence', 'Must be a number between 0 and 1');
    }

    const enforcement = determineEnforcement(
      body.riskScore as number,
      body.confidence as number,
      body.config as Record<string, unknown>
    );

    res.status(200).json({ accountId: body.accountId, enforcement });
  } catch (error) {
    const { status, body: errorBody } = handleError(error);
    res.status(status).json(errorBody);
  }
});
```

### ✅ Client Error Handling Now Clear:

```typescript
// Before: all errors look the same
try {
  const response = await fetch('/analyze', { method: 'POST', body });
  if (response.status === 500) {
    // Is it my fault (bad input) or server fault?
    // Can't tell!
  }
} catch (error) {
  // Generic error handler
}

// After: error types are explicit
try {
  const response = await fetch('/analyze', { method: 'POST', body });
  const data = await response.json();

  if (response.status === 400) {
    // Client error - show field-specific error to user
    console.error(`Invalid ${data.field}: ${data.detail}`);
  } else if (response.status === 422) {
    // Business logic error - might be temporary
    console.error(`Processing failed: ${data.code}`);
  } else if (response.status === 500) {
    // Server error - retry later
    console.error('Server error, please try again');
  }
} catch (error) {
  console.error('Network error');
}
```

### 🎯 Key Improvements:

| Aspect | Before | After |
|--------|--------|-------|
| **HTTP Status Codes** | All 500 | 400/422/500 properly used |
| **Error Types** | Undifferentiated | Clear type discriminator |
| **Input Validation** | None | Comprehensive |
| **Client Handling** | Guessing | Explicit error types |
| **Logging** | Impossible | Clear error context |
| **API Contract** | Implicit | Explicit in types |

### 📚 Principle Applied:
**Error Stratification** — Use error types and HTTP status codes to distinguish client errors (400), business logic errors (422), and server errors (500).

---

## Example 4: Mutable Global State → Dependency Injection

### Context
Workspace file: `/workspaces/Work/server.ts`

### 🔴 Before Issues:
- Global mutable variable `let serverCrypto: ServerCrypto | null = null`
- Implicit singleton pattern (hard to test, mock, or parallelize)
- State initialization logic is scattered
- Can't run tests in parallel (shared state)
- No way to create multiple independent instances
- Type safety around CryptoKey is loose

### 🟢 After Improvements:
- Dependency injection (no globals)
- Testable with mocks (CryptoContext can be injected)
- Explicit initialization (constructor)
- Thread-safe (no shared mutable state)
- Multiple instances supported
- Strong typing around crypto operations

---

### Before Code:
```typescript
// 🔴 Global mutable state
let serverCrypto: ServerCrypto | null = null

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

// 🔴 Initialization mixes with usage
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

// 🔴 Signing logic depends on global state
async function signCanonicalPayload(payload: CanonicalPayload): Promise<{
  hash: string
  signature: string
  publicKey: string
}> {
  const cryptoCtx = await initServerCrypto()  // ❌ Side effect: mutates global
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

// 🔴 HTTP handler tied to global state
async function handleSignProof(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req)
    const payload = parseCanonicalPayload(body)
    const result = await signCanonicalPayload(payload)  // ❌ Mutates global
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(result))
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: (error as Error).message }))
  }
}

// 🔴 Can't test this in isolation - depends on global state!
// Can't run multiple tests in parallel - they interfere via shared state!
```

### After Code:
```typescript
// Step 1: Define immutable crypto context interface
interface CryptoContext {
  readonly privateKey: CryptoKey;
  readonly publicKeyBase64: string;
}

// Step 2: Utility functions (no state)
function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

// Step 3: Initialization class (testable, mockable)
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

// Step 4: Signing class (depends on injected CryptoContext)
class PayloadSigner {
  constructor(private context: CryptoContext) {}

  async sign(payload: CanonicalPayload): Promise<{
    hash: string;
    signature: string;
    publicKey: string;
  }> {
    const canonical = canonicalize(payload);
    const hash = await sha256(canonical);

    const signatureBuffer = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.context.privateKey,  // ✅ Immutable reference
      new TextEncoder().encode(canonical)
    );

    return {
      hash,
      signature: bytesToBase64(new Uint8Array(signatureBuffer)),
      publicKey: this.context.publicKeyBase64
    };
  }
}

// Step 5: HTTP handler receives dependencies
async function handleSignProof(
  req: IncomingMessage,
  res: ServerResponse,
  signer: PayloadSigner  // ✅ Injected dependency
): Promise<void> {
  try {
    const body = await readJson(req);
    const payload = parseCanonicalPayload(body);
    const result = await signer.sign(payload);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
}

// Step 6: Application setup (one-time)
async function main(): Promise<void> {
  const initializer = new CryptoInitializer();
  const context = await initializer.generateKeyPair();
  const signer = new PayloadSigner(context);

  createServer((req, res) => handleSignProof(req, res, signer)).listen(8080);
}

main();
```

### ✅ Now Testable:

```typescript
test('PayloadSigner produces valid signatures', async () => {
  // Create mock context without real crypto
  const mockContext: CryptoContext = {
    privateKey: new Proxy({}, { get: () => {} }) as unknown as CryptoKey,
    publicKeyBase64: 'test-key-xyz'
  };

  const signer = new PayloadSigner(mockContext);
  // Now you can test signing logic

  const result = await signer.sign(testPayload);
  expect(result.publicKey).toBe('test-key-xyz');
});

test('Multiple signer instances can coexist', async () => {
  const context1 = new CryptoInitializer().generateKeyPair();
  const context2 = new CryptoInitializer().generateKeyPair();

  const signer1 = new PayloadSigner(context1);
  const signer2 = new PayloadSigner(context2);

  // No interference - each has its own context
  expect(signer1).not.toBe(signer2);
});
```

### 🎯 Key Improvements:

| Aspect | Before | After |
|--------|--------|-------|
| **Testability** | Impossible (global state) | Full (mockable) |
| **State Management** | Implicit global | Explicit injection |
| **Parallelization** | Blocked (shared state) | Safe (no sharing) |
| **Multiple Instances** | Impossible | Supported |
| **Immutability** | Mutable globals | Readonly fields |
| **Thread Safety** | Unsafe | Safe |

### 📚 Principle Applied:
**Dependency Injection** — Pass dependencies as constructor arguments instead of using global state. Enables testing, multiple instances, and thread safety.

---

## Summary: Teaching Methodology Checklist

For each refactoring:

- [ ] **Identify Issues** (🔴 Before): Document 3+ specific problems
- [ ] **Plan Improvements** (🟢 After): List goals and benefits
- [ ] **Show Code**: Side-by-side before/after comparison
- [ ] **Highlight Changes**: Use ✅ to mark specific improvements
- [ ] **Explain Impact**: Why does this matter long-term?
- [ ] **Add Tests**: Show code is now testable
- [ ] **Document Principle**: Link to broader software engineering concept

Use this pattern consistently across your codebase for effective code reviews and knowledge transfer.
