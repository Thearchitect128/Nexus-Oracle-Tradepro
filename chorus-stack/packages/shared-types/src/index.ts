export type ControlMode = "normal" | "degraded" | "containment";

export interface WorkItem {
  id: string;
  risk: number;
  priority: number;
  confidence: number;
}

export interface NodeCapacity {
  nodeId: string;
  capacity: number;
  maxRisk: number;
}

export interface Assignment {
  itemId: string;
  nodeId: string;
}

export interface RttsSnapshot {
  contaminationRate: number;
  throughputDrop: number;
  confidenceDrift: number;
}

export interface EvaluationInput {
  queueDepth: number;
  contaminationRate: number;
  confidenceDrift: number;
}

export interface EvaluationResult {
  mode: ControlMode;
  policy: AssignmentPolicy;
  reasons: string[];
}

export type AssignmentPolicy = "balanced" | "risk_limited" | "priority_first";
