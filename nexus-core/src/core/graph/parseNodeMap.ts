import { readFileSync } from "node:fs";

export type Node = {
  node_id: string;
  weight: number;
  dormant: boolean;
};

function parseDormant(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function parseNodeMap(filePath: string): Node[] {
  const content = readFileSync(filePath, "utf8").trim();
  if (!content) {
    return [];
  }

  const [headerRow, ...rows] = content.split(/\r?\n/);
  const headers = headerRow.split(",").map((value) => value.trim());

  const nodeIdIndex = headers.indexOf("node_id");
  const weightIndex = headers.indexOf("weight");
  const dormantIndex = headers.indexOf("dormant");

  if (nodeIdIndex < 0 || weightIndex < 0) {
    throw new Error("node_map csv must include node_id and weight columns");
  }

  return rows.filter(Boolean).map((row) => {
    const cols = row.split(",");
    const node_id = cols[nodeIdIndex]?.trim();
    const weightRaw = Number(cols[weightIndex]);

    if (!node_id) {
      throw new Error(`missing node_id in row: ${row}`);
    }
    if (!Number.isFinite(weightRaw)) {
      throw new Error(`invalid weight for node ${node_id}`);
    }

    return {
      node_id,
      weight: weightRaw,
      dormant: parseDormant(cols[dormantIndex])
    };
  });
}
