import fs from "node:fs";
import path from "node:path";

export type Guardian =
  | "Phoenix"
  | "Dragon"
  | "Lion"
  | "Raven"
  | "Butterfly"
  | "Ouroboros";

export type NodeType = "central" | "cluster" | "generic";

export type Node = {
  id: number;
  node_id: string;
  x: number;
  y: number;
  label: string;
  number: number;
  weight: number;
  guardian: Guardian;
  triad: string;
  hexagram: string;
  type: NodeType;
  dormant: boolean;
};

export function parseNodeMap(csvPath: string): Node[] {
  const raw = fs.readFileSync(path.resolve(csvPath), "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() ?? "";
    });

    return {
      id: Number(record.id),
      node_id: record.node_id,
      x: Number(record.x),
      y: Number(record.y),
      label: record.label,
      number: Number(record.number),
      weight: Number(record.weight),
      guardian: record.guardian as Guardian,
      triad: record.triad,
      hexagram: record.hexagram,
      type: record.type as NodeType,
      dormant: record.dormant === "true"
    };
  });
}
