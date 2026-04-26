#!/usr/bin/env python3
"""RTTS contamination simulation harness with baseline, overload, and survivor-bias inversion scenarios."""

from dataclasses import dataclass
from typing import Iterable, List


@dataclass
class Scenario:
    name: str
    contamination: float
    load: int
    survivor_bias: float


@dataclass
class Outcome:
    name: str
    measured_contamination: float
    confidence_drift: float
    containment_triggered: bool


def run_scenario(s: Scenario) -> Outcome:
    measured = max(0.0, s.contamination - s.survivor_bias)
    confidence_drift = min(1.0, measured * 1.2 + (s.load / 1000.0))
    containment = measured > 0.30 or confidence_drift > 0.40
    return Outcome(s.name, measured, confidence_drift, containment)


def simulate(scenarios: Iterable[Scenario]) -> List[Outcome]:
    return [run_scenario(s) for s in scenarios]


def main() -> None:
    scenarios = [
        Scenario("baseline", contamination=0.07, load=120, survivor_bias=0.01),
        Scenario("overload", contamination=0.18, load=380, survivor_bias=0.02),
        Scenario("survivor_bias_inversion", contamination=0.42, load=240, survivor_bias=-0.08),
    ]

    outcomes = simulate(scenarios)

    print("name,measured_contamination,confidence_drift,containment_triggered")
    for o in outcomes:
        print(f"{o.name},{o.measured_contamination:.3f},{o.confidence_drift:.3f},{o.containment_triggered}")


if __name__ == "__main__":
    main()
