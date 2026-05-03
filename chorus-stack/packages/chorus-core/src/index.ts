import type { WorkItem } from "../../shared-types/src/index.js";

export interface ChorusCore {
  ingest(items: WorkItem[]): Promise<void>;
  flush(): Promise<void>;
}
