# Account Behavior Intelligence Engine (ABIE) v0.1

A revenue enforcement platform that detects and prevents subscription account abuse through behavioral anomaly detection and automated policy actions.

## Positioning

**Not just analytics** — this is a **revenue recovery and policy enforcement engine** for subscription businesses.

## Key Features

- **Adaptive Anomaly Detection**: Learns normal usage patterns and flags deviations
- **Risk Scoring**: 0-1 scale with confidence intervals and enforcement actions
- **Policy Automation**: Automatic challenge, limit, or upgrade requirements
- **Explainable Enforcement**: Per-account audit trails with risk scores
- **Revenue Recovery**: Direct monetization through abuse prevention

## Usage

### CLI Analysis
```bash
npm run start <platform> <input.json> [config.json] [--json]
```

### API Server
```bash
npm run api
```

#### Analyze Endpoint
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "accounts": [...],
      "sessions": [...],
      "arpu": 8,
      "conversionRate": 0.3
    },
    "config": {
      "geoWindowHours": 6,
      "maxDevices": 5,
      ...
    }
  }'
```

#### Enforcement Endpoint
```bash
curl -X POST http://localhost:3000/enforce \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc1",
    "riskScore": 0.7,
    "confidence": 0.9,
    "config": {...}
  }'
```

## Enforcement Actions

Based on risk scores and confidence:
- **allow**: Low risk, proceed normally
- **challenge**: Moderate risk, additional verification
- **limit**: High risk, usage restrictions applied
- **upgrade_required**: Critical risk, account upgrade mandatory

## Business Model

### Revenue Capture
- **Revenue Share**: 10-15% of recovered revenue
- **Per-Account**: $0.50-1.00 per 1,000 accounts
- **Enterprise License**: $50K-200K annual + performance bonuses

## Target Markets

- Streaming platforms (Netflix, Spotify, Disney+)
- SaaS tools (Adobe, Microsoft 365)
- Gaming services (Steam, EA Play)
- Any subscription business with account sharing risks

## Technical Architecture

- **Normalization**: Per-account metrics reduce false positives
- **Adaptive Baselines**: Learns from population behavior
- **Deterministic Hashing**: Verifiable output consistency
- **Configurable Thresholds**: Client-specific tuning
- **API-First**: Easy integration and scaling

## Development

```bash
npm run dev
npm run build
npm test
```