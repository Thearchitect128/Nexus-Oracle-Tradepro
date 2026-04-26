export interface Item {
  id: string;
  risk: number;
  latencySensitivity?: number;
  requiredTags?: string[];
  region?: string;
}

export interface Node {
  id: string;
  capacity: number;
  used: number;
  tags?: string[];
  region?: string;
}
