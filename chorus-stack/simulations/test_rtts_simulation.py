"""Unit tests for rtts_simulation.py"""

import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from rtts_simulation import Outcome, Scenario, run_scenario, simulate


class TestRunScenario(unittest.TestCase):
    def test_baseline_scenario_no_containment(self):
        s = Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01)
        result = run_scenario(s)
        # measured = max(0, 0.07 - 0.01) = 0.06
        self.assertAlmostEqual(result.measured_contamination, 0.06)
        # confidence_drift = min(1.0, 0.06 * 1.2 + 120/1000) = min(1.0, 0.072 + 0.12) = 0.192
        self.assertAlmostEqual(result.confidence_drift, 0.192)
        self.assertFalse(result.containment_triggered)

    def test_overload_scenario_triggers_containment_via_confidence_drift(self):
        s = Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02)
        result = run_scenario(s)
        # measured = max(0, 0.18 - 0.02) = 0.16
        self.assertAlmostEqual(result.measured_contamination, 0.16)
        # confidence_drift = min(1.0, 0.16 * 1.2 + 380/1000) = min(1.0, 0.192 + 0.38) = 0.572
        self.assertAlmostEqual(result.confidence_drift, 0.572)
        # 0.16 not > 0.30, but 0.572 > 0.40, so containment = True
        self.assertTrue(result.containment_triggered)

    def test_survivor_bias_inversion_triggers_containment(self):
        s = Scenario("survivor_bias_inversion", contamination=0.42, load=240, survivor_bias=-0.08)
        result = run_scenario(s)
        # measured = max(0, 0.42 - (-0.08)) = max(0, 0.50) = 0.50
        self.assertAlmostEqual(result.measured_contamination, 0.50)
        # confidence_drift = min(1.0, 0.50 * 1.2 + 240/1000) = min(1.0, 0.60 + 0.24) = min(1.0, 0.84) = 0.84
        self.assertAlmostEqual(result.confidence_drift, 0.84)
        # 0.50 > 0.30, so containment = True
        self.assertTrue(result.containment_triggered)

    def test_scenario_name_is_preserved_in_outcome(self):
        s = Scenario("my-test-scenario", contamination=0.05, load=50, survivor_bias=0.01)
        result = run_scenario(s)
        self.assertEqual(result.name, "my-test-scenario")

    def test_zero_contamination_no_containment(self):
        s = Scenario("zero", contamination=0.0, load=0, survivor_bias=0.0)
        result = run_scenario(s)
        self.assertAlmostEqual(result.measured_contamination, 0.0)
        self.assertAlmostEqual(result.confidence_drift, 0.0)
        self.assertFalse(result.containment_triggered)

    def test_survivor_bias_clamps_measured_contamination_to_zero(self):
        # survivor_bias > contamination -> measured = max(0, negative) = 0
        s = Scenario("biased", contamination=0.05, load=0, survivor_bias=0.10)
        result = run_scenario(s)
        self.assertAlmostEqual(result.measured_contamination, 0.0)
        self.assertFalse(result.containment_triggered)

    def test_confidence_drift_clamped_to_one(self):
        # Very high contamination and load -> drift would exceed 1.0, should be clamped
        s = Scenario("extreme", contamination=1.0, load=10000, survivor_bias=0.0)
        result = run_scenario(s)
        self.assertAlmostEqual(result.confidence_drift, 1.0)

    def test_high_contamination_triggers_containment_via_measured(self):
        # contamination=0.35 > 0.30 threshold
        s = Scenario("high-contamination", contamination=0.35, load=10, survivor_bias=0.0)
        result = run_scenario(s)
        self.assertGreater(result.measured_contamination, 0.30)
        self.assertTrue(result.containment_triggered)

    def test_moderate_contamination_at_threshold_boundary(self):
        # contamination exactly at 0.30 should NOT trigger (condition is > 0.30)
        s = Scenario("at-threshold", contamination=0.30, load=0, survivor_bias=0.0)
        result = run_scenario(s)
        # measured = 0.30, confidence_drift = min(1.0, 0.30*1.2 + 0/1000) = 0.36
        self.assertAlmostEqual(result.measured_contamination, 0.30)
        self.assertAlmostEqual(result.confidence_drift, 0.36)
        # 0.30 is not > 0.30, and 0.36 is not > 0.40
        self.assertFalse(result.containment_triggered)

    def test_confidence_drift_triggers_containment_at_boundary(self):
        # Need confidence_drift just above 0.40
        # drift = measured * 1.2 + load/1000 > 0.40
        # At measured=0.3 (max non-containment) and load=100: drift = 0.36 + 0.10 = 0.46 > 0.40
        s = Scenario("drift-trigger", contamination=0.30, load=100, survivor_bias=0.0)
        result = run_scenario(s)
        self.assertGreater(result.confidence_drift, 0.40)
        self.assertTrue(result.containment_triggered)

    def test_returns_outcome_dataclass(self):
        s = Scenario("test", contamination=0.1, load=100, survivor_bias=0.0)
        result = run_scenario(s)
        self.assertIsInstance(result, Outcome)
        self.assertIsInstance(result.name, str)
        self.assertIsInstance(result.measured_contamination, float)
        self.assertIsInstance(result.confidence_drift, float)
        self.assertIsInstance(result.containment_triggered, bool)


class TestSimulate(unittest.TestCase):
    def test_simulate_returns_list_of_outcomes(self):
        scenarios = [
            Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01),
            Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02),
        ]
        results = simulate(scenarios)
        self.assertEqual(len(results), 2)
        for r in results:
            self.assertIsInstance(r, Outcome)

    def test_simulate_preserves_order(self):
        scenarios = [
            Scenario("first", contamination=0.05, load=50, survivor_bias=0.0),
            Scenario("second", contamination=0.1, load=100, survivor_bias=0.0),
            Scenario("third", contamination=0.4, load=200, survivor_bias=0.0),
        ]
        results = simulate(scenarios)
        self.assertEqual(results[0].name, "first")
        self.assertEqual(results[1].name, "second")
        self.assertEqual(results[2].name, "third")

    def test_simulate_empty_input_returns_empty_list(self):
        results = simulate([])
        self.assertEqual(results, [])

    def test_simulate_single_scenario(self):
        scenarios = [Scenario("solo", contamination=0.5, load=100, survivor_bias=0.0)]
        results = simulate(scenarios)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].name, "solo")
        self.assertTrue(results[0].containment_triggered)

    def test_simulate_matches_individual_run_scenario(self):
        # simulate() should produce same results as calling run_scenario() individually
        s1 = Scenario("a", contamination=0.07, load=120, survivor_bias=0.01)
        s2 = Scenario("b", contamination=0.18, load=380, survivor_bias=0.02)
        batch = simulate([s1, s2])
        individual_1 = run_scenario(s1)
        individual_2 = run_scenario(s2)
        self.assertAlmostEqual(batch[0].measured_contamination, individual_1.measured_contamination)
        self.assertAlmostEqual(batch[0].confidence_drift, individual_1.confidence_drift)
        self.assertEqual(batch[0].containment_triggered, individual_1.containment_triggered)
        self.assertAlmostEqual(batch[1].measured_contamination, individual_2.measured_contamination)
        self.assertAlmostEqual(batch[1].confidence_drift, individual_2.confidence_drift)
        self.assertEqual(batch[1].containment_triggered, individual_2.containment_triggered)

    def test_simulate_with_all_three_named_scenarios(self):
        """Regression test: verify the three canonical scenarios produce expected outcomes."""
        scenarios = [
            Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01),
            Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02),
            Scenario("survivor_bias_inversion", contamination=0.42, load=240, survivor_bias=-0.08),
        ]
        results = simulate(scenarios)
        self.assertEqual(len(results), 3)

        baseline, overload, inversion = results

        # Baseline should not trigger containment
        self.assertFalse(baseline.containment_triggered)
        # Overload triggers containment via confidence drift
        self.assertTrue(overload.containment_triggered)
        # Inversion triggers containment via high measured contamination
        self.assertTrue(inversion.containment_triggered)


if __name__ == "__main__":
    unittest.main()