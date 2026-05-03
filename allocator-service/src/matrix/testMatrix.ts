export const ENVS = ["preview", "production"] as const;
export const MODES = ["streaming", "non-streaming"] as const;
export const RISKS = ["low", "medium", "high"] as const;
export const DECISIONS = ["model", "defer", "reject"] as const;
export const AUTHS = ["protected", "bypass"] as const;

export type Env = (typeof ENVS)[number];
export type Mode = (typeof MODES)[number];
export type Risk = (typeof RISKS)[number];
export type Decision = (typeof DECISIONS)[number];
export type Auth = (typeof AUTHS)[number];

export type Vector = {
  env: Env;
  mode: Mode;
  risk: Risk;
  decision: Decision;
  auth: Auth;
};

export type AllocatorResponse = {
  headers: Record<string, string>;
  autoApproved: boolean;
  deferred: boolean;
  externalApiCalls: number;
  latencyMs: number;
};
