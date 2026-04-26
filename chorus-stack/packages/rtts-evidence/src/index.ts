import type { RttsSnapshot } from "../../shared-types/src/index.js";

export interface RttsEvidenceProvider {
  latest(): Promise<RttsSnapshot>;
}
