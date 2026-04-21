export type IdentityMode = "data_dominant" | "reactive";
export type SystemMode = "active" | "drift" | "locked";
export type PathState = "open" | "closed" | "dormant";

export type InputSignal = {
  id: string;
  kind: "observation" | "threat" | "task" | "noise";
  value: number; // normalized 0..1
  payload?: Record<string, unknown>;
};

export type Decision = {
  action: "advance" | "stabilize" | "hold" | "reject";
  rationale: string;
  confidence: number; // 0..1
};

export type Path = {
  id: number;
  weight: number; // normalized
  state: PathState;
};

export type SystemState = {
  id: string;
  identity: IdentityMode;
  energy: number; // 0..1
  coherence: number; // 0..1
  recursionDepth: number;
  mode: SystemMode;
  tick: number;
  lastDecision?: Decision;
  lastPathId?: number;
};