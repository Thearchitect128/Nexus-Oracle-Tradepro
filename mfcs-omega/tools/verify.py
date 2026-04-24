#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def resolve_tla_jar():
    direct = os.environ.get("TLA_JAR")
    if direct:
        jar = Path(direct)
        if jar.exists():
            return jar
        raise FileNotFoundError(f"TLA_JAR points to a missing file: {jar}")

    tla_home = os.environ.get("TLA_HOME")
    if tla_home:
        jar = Path(tla_home) / "tla2tools.jar"
        if jar.exists():
            return jar
        raise FileNotFoundError(f"TLA_HOME does not contain tla2tools.jar: {jar}")

    raise FileNotFoundError("Set TLA_JAR or TLA_HOME before running tools/verify.py")


def main():
    subprocess.run([sys.executable, str(ROOT / "tools" / "validate_repo.py")], check=True)

    java = shutil.which("java")
    if not java:
        raise RuntimeError("Java is required to run TLC but was not found on PATH")

    tla_jar = resolve_tla_jar()
    cfg = ROOT / "spec" / "MFCS.cfg"
    spec = ROOT / "spec" / "MFCS.tla"

    subprocess.run(
        [
            java,
            "-XX:+UseParallelGC",
            "-cp",
            str(tla_jar),
            "tlc2.TLC",
            "-config",
            str(cfg),
            str(spec),
        ],
        check=True,
        cwd=ROOT,
    )


if __name__ == "__main__":
    main()
