export type Item = {
  id: string;
  risk: number;
  requiredTags?: string[];
  region?: string;
  latencySensitivity?: number;
};

export type Node = {
  id: string;
  capacity: number;
  used: number;
  tags?: string[];
  region?: string;
  load?: number;
};

export type AllocateRequest = {
  items: Item[];
  nodes: Node[];
  timeoutMs?: number;
};

export type AllocateResponse = {
  assignments: Record<string, string>;
  flow: number;
  cost: number;
  deterministic: true;
  requestHash: string;
};
