"""
Tests for tools/build-mirror.py

Covers:
- load_latest_trace(): no traces, one trace, multiple traces (returns lexicographically last)
- build(): output structure, no-trace case, with-trace case, file contents
"""
import importlib.util
import json
import sys
from pathlib import Path

import pytest


# ---------------------------------------------------------------------------
# Module loader helper
# ---------------------------------------------------------------------------

def _load_build_mirror():
    """Load tools/build-mirror.py (hyphen in name prevents normal import)."""
    module_path = Path(__file__).resolve().parents[1] / "tools" / "build-mirror.py"
    spec = importlib.util.spec_from_file_location("build_mirror", module_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# Load once at module level for reuse across tests.
build_mirror = _load_build_mirror()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def patched_paths(tmp_path, monkeypatch):
    """
    Returns a dict of tmp Paths and patches the module-level constants so
    load_latest_trace() and build() operate in a controlled tmp directory.
    """
    trace_dir = tmp_path / "traces" / "classified"
    trace_dir.mkdir(parents=True)
    mirror_dir = tmp_path / "digital-mirror"
    mirror_dir.mkdir()

    mirror_file = mirror_dir / "mirror.json"
    log_file = mirror_dir / "mirror-build-log.md"

    monkeypatch.setattr(build_mirror, "TLC_TRACE", trace_dir)
    monkeypatch.setattr(build_mirror, "MIRROR", mirror_file)
    monkeypatch.setattr(build_mirror, "LOG", log_file)

    return {
        "trace_dir": trace_dir,
        "mirror_file": mirror_file,
        "log_file": log_file,
    }


# ---------------------------------------------------------------------------
# load_latest_trace tests
# ---------------------------------------------------------------------------

class TestLoadLatestTrace:
    def test_returns_none_when_no_traces(self, patched_paths):
        """Empty classified directory → None."""
        result = build_mirror.load_latest_trace()
        assert result is None

    def test_returns_none_when_directory_missing(self, tmp_path, monkeypatch):
        """Non-existent directory → None (glob returns empty iterator)."""
        missing = tmp_path / "nonexistent" / "classified"
        monkeypatch.setattr(build_mirror, "TLC_TRACE", missing)
        # Path.glob on a missing directory doesn't raise; returns empty.
        result = build_mirror.load_latest_trace()
        assert result is None

    def test_returns_single_trace(self, patched_paths):
        """Single JSON file → its parsed contents."""
        trace_data = {"peaks": [1, 2, 3], "label": "test"}
        trace_file = patched_paths["trace_dir"] / "trace_001.json"
        trace_file.write_text(json.dumps(trace_data))

        result = build_mirror.load_latest_trace()
        assert result == trace_data

    def test_returns_lexicographically_last_trace(self, patched_paths):
        """Multiple JSON files → lexicographically last (sorted reverse=True)."""
        trace_dir = patched_paths["trace_dir"]
        (trace_dir / "trace_001.json").write_text(json.dumps({"id": "first"}))
        (trace_dir / "trace_003.json").write_text(json.dumps({"id": "last"}))
        (trace_dir / "trace_002.json").write_text(json.dumps({"id": "middle"}))

        result = build_mirror.load_latest_trace()
        assert result == {"id": "last"}

    def test_ignores_non_json_files(self, patched_paths):
        """Non-.json files are not picked up."""
        trace_dir = patched_paths["trace_dir"]
        (trace_dir / "trace.txt").write_text("not json")
        (trace_dir / "trace.json").write_text(json.dumps({"id": "valid"}))

        result = build_mirror.load_latest_trace()
        assert result == {"id": "valid"}

    def test_only_non_json_files_returns_none(self, patched_paths):
        """Only non-.json files present → None."""
        trace_dir = patched_paths["trace_dir"]
        (trace_dir / "trace.txt").write_text("not json")

        result = build_mirror.load_latest_trace()
        assert result is None

    def test_trace_with_peaks_field(self, patched_paths):
        """Trace containing a peaks list is returned intact."""
        trace_data = {"peaks": [{"id": "p1"}, {"id": "p2"}], "status": "ok"}
        (patched_paths["trace_dir"] / "classified_a.json").write_text(
            json.dumps(trace_data)
        )

        result = build_mirror.load_latest_trace()
        assert result["peaks"] == [{"id": "p1"}, {"id": "p2"}]

    def test_empty_json_object(self, patched_paths):
        """Empty JSON object trace → returned as empty dict."""
        (patched_paths["trace_dir"] / "empty.json").write_text("{}")

        result = build_mirror.load_latest_trace()
        assert result == {}


# ---------------------------------------------------------------------------
# build() tests
# ---------------------------------------------------------------------------

class TestBuild:
    def test_build_creates_mirror_file(self, patched_paths):
        """build() creates mirror.json."""
        build_mirror.build()
        assert patched_paths["mirror_file"].exists()

    def test_build_creates_log_file(self, patched_paths):
        """build() creates mirror-build-log.md."""
        build_mirror.build()
        assert patched_paths["log_file"].exists()

    def test_mirror_structure_no_trace(self, patched_paths):
        """With no trace, mirror.json has expected keys and defaults."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        assert mirror["version"] == "0.1.0"
        assert mirror["last_run"] == {}
        assert mirror["peaks"] == []
        assert isinstance(mirror["invariants"], list)
        assert mirror["oracle_state"]["kernel"] == "stable"
        assert mirror["oracle_state"]["spatial_layer"] == "active"
        assert mirror["oracle_state"]["agents"] == "idle"

    def test_mirror_oracle_state_keys_present(self, patched_paths):
        """oracle_state always has kernel, spatial_layer, agents fields."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        oracle = mirror["oracle_state"]
        assert "kernel" in oracle
        assert "spatial_layer" in oracle
        assert "agents" in oracle

    def test_mirror_version_is_string(self, patched_paths):
        """version field is a non-empty string."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert isinstance(mirror["version"], str)
        assert len(mirror["version"]) > 0

    def test_mirror_with_trace_includes_last_run(self, patched_paths):
        """When a trace file exists, last_run contains trace data."""
        trace_data = {"peaks": [10, 20], "label": "run-1"}
        (patched_paths["trace_dir"] / "run_001.json").write_text(
            json.dumps(trace_data)
        )

        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        assert mirror["last_run"] == trace_data

    def test_mirror_with_trace_includes_peaks(self, patched_paths):
        """When a trace has a peaks field, it is reflected in the mirror."""
        trace_data = {"peaks": [{"x": 1}, {"x": 2}]}
        (patched_paths["trace_dir"] / "run_001.json").write_text(
            json.dumps(trace_data)
        )

        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        assert mirror["peaks"] == [{"x": 1}, {"x": 2}]

    def test_mirror_with_trace_no_peaks_field(self, patched_paths):
        """Trace without a peaks field → peaks defaults to []."""
        trace_data = {"label": "no-peaks-trace"}
        (patched_paths["trace_dir"] / "run_001.json").write_text(
            json.dumps(trace_data)
        )

        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        assert mirror["peaks"] == []

    def test_log_contains_trace_included_true(self, patched_paths):
        """Log mentions 'Trace included: True' when a trace is present."""
        (patched_paths["trace_dir"] / "run_001.json").write_text(
            json.dumps({"peaks": []})
        )

        build_mirror.build()
        log_text = patched_paths["log_file"].read_text()

        assert "True" in log_text

    def test_log_contains_trace_included_false(self, patched_paths):
        """Log mentions 'Trace included: False' when no trace is present."""
        build_mirror.build()
        log_text = patched_paths["log_file"].read_text()

        assert "False" in log_text

    def test_log_has_mirror_build_header(self, patched_paths):
        """Log file begins with a 'Mirror Build Log' heading."""
        build_mirror.build()
        log_text = patched_paths["log_file"].read_text()

        assert "Mirror Build Log" in log_text

    def test_mirror_is_valid_json(self, patched_paths):
        """mirror.json produced by build() is valid JSON."""
        build_mirror.build()
        raw = patched_paths["mirror_file"].read_text()
        parsed = json.loads(raw)
        assert isinstance(parsed, dict)

    def test_mirror_invariants_is_list(self, patched_paths):
        """invariants field is always a list."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert isinstance(mirror["invariants"], list)

    def test_mirror_peaks_is_list(self, patched_paths):
        """peaks field is always a list."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert isinstance(mirror["peaks"], list)

    def test_build_called_twice_overwrites(self, patched_paths):
        """Second call to build() overwrites the first mirror.json."""
        (patched_paths["trace_dir"] / "trace_a.json").write_text(
            json.dumps({"peaks": [1]})
        )
        build_mirror.build()
        first = json.loads(patched_paths["mirror_file"].read_text())

        # Remove trace; second build should have no trace.
        (patched_paths["trace_dir"] / "trace_a.json").unlink()
        build_mirror.build()
        second = json.loads(patched_paths["mirror_file"].read_text())

        assert first["last_run"] != {}
        assert second["last_run"] == {}

    # ------------------------------------------------------------------
    # Boundary / negative cases
    # ------------------------------------------------------------------

    def test_mirror_last_run_empty_dict_when_no_trace(self, patched_paths):
        """Boundary: last_run is explicitly {} (not None or missing) without a trace."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert mirror["last_run"] == {}
        assert "last_run" in mirror

    def test_mirror_peaks_empty_list_when_no_trace(self, patched_paths):
        """Boundary: peaks is explicitly [] (not None or missing) without a trace."""
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert mirror["peaks"] == []
        assert "peaks" in mirror

    def test_trace_with_empty_peaks_list(self, patched_paths):
        """Boundary: trace with peaks=[] yields peaks=[] in mirror."""
        (patched_paths["trace_dir"] / "trace.json").write_text(
            json.dumps({"peaks": []})
        )
        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())
        assert mirror["peaks"] == []

    def test_multiple_trace_files_picks_latest_lexicographically(self, patched_paths):
        """Regression: with many traces, build() uses the lexicographically last file."""
        trace_dir = patched_paths["trace_dir"]
        (trace_dir / "zzz_trace.json").write_text(json.dumps({"peaks": ["last"]}))
        (trace_dir / "aaa_trace.json").write_text(json.dumps({"peaks": ["first"]}))

        build_mirror.build()
        mirror = json.loads(patched_paths["mirror_file"].read_text())

        assert mirror["peaks"] == ["last"]