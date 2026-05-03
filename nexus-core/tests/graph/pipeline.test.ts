import { describe, expect, test } from "vitest";
import type { Node } from "../../src/core/parseNodeMap.js";
import { runFullAnalysis } from "../../src/core/graph/pipeline.js";

const nodes: Node[] = [
  {
    id: 1,
    node_id: "C01",
    x: 50,
    y: 50,
    label: "Center",
    number: 1,
    weight: 0.95,
    guardian: "Phoenix",
    triad: "A",
    hexagram: "H1",
    type: "central",
    dormant: false
  },
  {
    id: 2,
    node_id: "P01",
    x: 52,
    y: 50,
    label: "P1",
    number: 2,
    weight: 0.9,
    guardian: "Phoenix",
    triad: "A",
    hexagram: "H2",
    type: "cluster",
    dormant: false
  },
  {
    id: 3,
    node_id: "P02",
    x: 54,
    y: 50,
    label: "P2",
    number: 3,
    weight: 0.88,
    guardian: "Phoenix",
    triad: "A",
    hexagram: "H3",
    type: "cluster",
    dormant: false
  },
  {
    id: 4,
    node_id: "D01",
    x: 56,
    y: 50,
    label: "D1",
    number: 4,
    weight: 0.86,
    guardian: "Dragon",
    triad: "A",
    hexagram: "H4",
    type: "cluster",
    dormant: false
  }
];

describe("runFullAnalysis", () => {
  test("wires simulation + grouping into one result", () => {
    const analysis = runFullAnalysis(nodes);

    expect(analysis.nodes).toHaveLength(nodes.length);
    expect(analysis.edges).toHaveLength(nodes.length);
    expect(analysis.simulations).toHaveLength(nodes.length);
    expect(analysis.basins.length).toBeGreaterThan(0);

    const firstSimulation = analysis.simulations[0];
    expect(firstSimulation.result.state.history.length).toBeGreaterThan(1);
    expect(Object.keys(analysis.adj).length).toBe(nodes.length);
  });
});
