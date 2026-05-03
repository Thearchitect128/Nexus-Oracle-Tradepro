export type TraceStep = {
  kind: "forward" | "reverse" | "steady";
  phi: boolean;
  value?: number;
};

export type TraceWitness = {
  id: string;
  steps: TraceStep[];
};

export type Classification = {
  pass: boolean;
  invariants: {
    forwardCycleEstablished: boolean;
    noReverseCycle: boolean;
    globalConvergenceToPhi: boolean;
  };
  contract: "≈↻ ∧ ¬(↺) ⇒ Gφ";
};

export const CONTRACT: Classification["contract"] = "≈↻ ∧ ¬(↺) ⇒ Gφ";

export function classifyTrace(trace: TraceWitness): Classification {
  const forwardCycleEstablished = trace.steps.some((step) => step.kind === "forward");
  const noReverseCycle = trace.steps.every((step) => step.kind !== "reverse");
  const globalConvergenceToPhi = trace.steps.every((step) => step.phi);

  return {
    pass: forwardCycleEstablished && noReverseCycle && globalConvergenceToPhi,
    invariants: {
      forwardCycleEstablished,
      noReverseCycle,
      globalConvergenceToPhi,
    },
    contract: CONTRACT,
  };
}
