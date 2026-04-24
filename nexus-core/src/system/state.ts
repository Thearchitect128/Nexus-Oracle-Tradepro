export type SystemState = "HOLD" | "ACTIVE" | "VERIFYING" | "ERROR";

export interface SystemContext {
  anchor: number;
  input: number;
  output: number;
  drift: number;
}

export const initialContext: SystemContext = {
  anchor: 0,
  input: 0,
  output: 1,
  drift: 0,
};
