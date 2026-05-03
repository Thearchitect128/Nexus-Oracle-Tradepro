"""Tests for rtts_simulation.py - run with: python -m pytest simulations/test_rtts_simulation.py"""

import pytest
from rtts_simulation import Outcome, Scenario, run_scenario, simulate


class TestRunScenario:
    def test_baseline_scenario_no_containment(self) -> None:
        s = Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01)
        outcome = run_scenario(s)
        assert outcome.name == "baseline"
        assert not outcome.containment_triggered

    def test_measured_contamination_subtracts_survivor_bias(self) -> None:
        s = Scenario("test", contamination=0.20, load=0, survivor_bias=0.05)
        outcome = run_scenario(s)
        assert abs(outcome.measured_contamination - 0.15) < 1e-9

    def test_measured_contamination_clamped_at_zero(self) -> None:
        """Survivor bias larger than contamination must not produce negative measured value."""
        s = Scenario("bias_inversion", contamination=0.10, load=0, survivor_bias=0.50)
        outcome = run_scenario(s)
        assert outcome.measured_contamination == 0.0

    def test_negative_survivor_bias_increases_measured_contamination(self) -> None:
        """Negative survivor bias (inversion) should increase measured contamination."""
        s = Scenario("inversion", contamination=0.30, load=0, survivor_bias=-0.10)
        outcome = run_scenario(s)
        assert abs(outcome.measured_contamination - 0.40) < 1e-9

    def test_confidence_drift_formula(self) -> None:
        """confidence_drift = min(1.0, measured * 1.2 + load / 1000)."""
        s = Scenario("formula", contamination=0.10, load=200, survivor_bias=0.0)
        outcome = run_scenario(s)
        expected = min(1.0, 0.10 * 1.2 + 200 / 1000.0)
        assert abs(outcome.confidence_drift - expected) < 1e-9

    def test_confidence_drift_clamped_at_one(self) -> None:
        s = Scenario("high_load", contamination=0.9, load=9000, survivor_bias=0.0)
        outcome = run_scenario(s)
        assert outcome.confidence_drift == 1.0

    def test_containment_triggered_by_high_contamination(self) -> None:
        s = Scenario("high_cont", contamination=0.35, load=0, survivor_bias=0.0)
        outcome = run_scenario(s)
        assert outcome.containment_triggered is True

    def test_containment_not_triggered_at_exactly_0_30(self) -> None:
        """Threshold is > 0.30, so exactly 0.30 should NOT trigger containment by contamination alone."""
        s = Scenario("boundary", contamination=0.30, load=0, survivor_bias=0.0)
        outcome = run_scenario(s)
        # confidence_drift = 0.30 * 1.2 + 0 = 0.36, which is <= 0.40
        assert not outcome.containment_triggered

    def test_containment_triggered_by_high_confidence_drift(self) -> None:
        """High load alone can push confidence_drift above 0.40 and trigger containment."""
        # measured = 0.0 (contamination=0, bias=0), drift = 0 + 500/1000 = 0.5 > 0.40
        s = Scenario("high_drift", contamination=0.0, load=500, survivor_bias=0.0)
        outcome = run_scenario(s)
        assert outcome.containment_triggered is True

    def test_outcome_name_matches_scenario_name(self) -> None:
        s = Scenario("my_scenario", contamination=0.05, load=100, survivor_bias=0.0)
        outcome = run_scenario(s)
        assert outcome.name == "my_scenario"

    def test_zero_load_zero_contamination_no_containment(self) -> None:
        s = Scenario("idle", contamination=0.0, load=0, survivor_bias=0.0)
        outcome = run_scenario(s)
        assert outcome.measured_contamination == 0.0
        assert outcome.confidence_drift == 0.0
        assert not outcome.containment_triggered

    def test_overload_scenario_triggers_containment_via_drift(self) -> None:
        """Overload scenario from main(): contamination=0.18, load=380, bias=0.02."""
        s = Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02)
        outcome = run_scenario(s)
        # measured = 0.18 - 0.02 = 0.16
        # drift = min(1.0, 0.16 * 1.2 + 0.38) = min(1.0, 0.192 + 0.38) = 0.572 > 0.40
        assert outcome.containment_triggered is True
        assert abs(outcome.measured_contamination - 0.16) < 1e-9

    def test_survivor_bias_inversion_scenario(self) -> None:
        """Negative survivor bias (inversion scenario from main()): contamination=0.42, bias=-0.08."""
        s = Scenario("survivor_bias_inversion", contamination=0.42, load=240, survivor_bias=-0.08)
        outcome = run_scenario(s)
        # measured = max(0, 0.42 - (-0.08)) = 0.50
        assert abs(outcome.measured_contamination - 0.50) < 1e-9
        assert outcome.containment_triggered is True


class TestSimulate:
    def test_simulate_returns_one_outcome_per_scenario(self) -> None:
        scenarios = [
            Scenario("a", contamination=0.05, load=100, survivor_bias=0.0),
            Scenario("b", contamination=0.20, load=200, survivor_bias=0.0),
        ]
        outcomes = simulate(scenarios)
        assert len(outcomes) == 2

    def test_simulate_preserves_scenario_order(self) -> None:
        scenarios = [
            Scenario("first", contamination=0.05, load=50, survivor_bias=0.0),
            Scenario("second", contamination=0.35, load=50, survivor_bias=0.0),
        ]
        outcomes = simulate(scenarios)
        assert outcomes[0].name == "first"
        assert outcomes[1].name == "second"

    def test_simulate_with_empty_list(self) -> None:
        outcomes = simulate([])
        assert outcomes == []

    def test_simulate_returns_correct_outcome_types(self) -> None:
        scenarios = [Scenario("x", contamination=0.1, load=100, survivor_bias=0.01)]
        outcomes = simulate(scenarios)
        assert isinstance(outcomes[0], Outcome)

    def test_simulate_matches_individual_run_scenario_calls(self) -> None:
        scenarios = [
            Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01),
            Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02),
        ]
        outcomes = simulate(scenarios)
        for s, o in zip(scenarios, outcomes):
            expected = run_scenario(s)
            assert o == expected