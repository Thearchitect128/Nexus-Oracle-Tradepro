#!/usr/bin/env bash
set -euo pipefail

npm run analyze
python3 verify.py --analysis analysis.json --sha analysis.json.sha256

python3 - <<'PY'
import json
from pathlib import Path

manifest_path = Path("manifest.json")
sha_path = Path("analysis.json.sha256")
hash_value = sha_path.read_text(encoding="utf-8").strip().split()[0]

manifest = {}
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

manifest["analysis"] = {
    "path": "analysis.json",
    "sha256": hash_value,
}

manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(f"Updated {manifest_path} with analysis hash {hash_value}")
PY
