import { expect, test } from "vitest";
import { parseNodeMap } from "../src/core/parseNodeMap.js";
import { validateGraph } from "../src/core/validateGraph.js";

test("node_map passes all invariants", () => {
  const nodes = parseNodeMap("./data/node_map.csv");
  expect(() => validateGraph(nodes)).not.toThrow();
});
