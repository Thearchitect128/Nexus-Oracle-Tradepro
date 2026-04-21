# Symbol Registry Signing and Verification

This bundle seals the M.S.Y symbol registry as an auditable artifact set.

## Signed unit

The signed unit is the manifest:

- `artifacts/symbols.manifest.json`

It covers:

- `src/lib/symbols/registry.ts`
- `gen/symbols.py`
- `gen/symbols/symbols.go`

## Why sign the manifest

Signing a single manifest gives one integrity root for the whole registry layer.
That keeps CI simple and makes archival verification straightforward.

## Generate manifest

```bash
python scripts/generate_symbols_manifest.py
```

## Verify hashes

```bash
python scripts/verify_symbols_manifest.py
```

## Sign manifest

```bash
bash scripts/sign_symbols_manifest.sh artifacts/symbols.manifest.json symbols-signing.pem
```

This writes:

- `artifacts/symbols.manifest.json.sig`
- `artifacts/symbols.manifest.json.sha256`

## Verify signature

```bash
bash scripts/verify_symbols_signature.sh artifacts/symbols.manifest.json symbols-signing.pub.pem
```

## Governance rule

If any of the three covered files changes, one of two things must happen:

1. regenerate the manifest and create a new signed release, or
2. reject the change

There is no silent mutation path.
