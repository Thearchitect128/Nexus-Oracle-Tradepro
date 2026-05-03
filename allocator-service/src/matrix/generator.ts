import { isValidVector } from "./constraints";
import {
  AUTHS,
  DECISIONS,
  ENVS,
  MODES,
  RISKS,
  type Vector,
} from "./testMatrix";

export function generateAllVectors(): Vector[] {
  const vectors: Vector[] = [];

  for (const env of ENVS) {
    for (const mode of MODES) {
      for (const risk of RISKS) {
        for (const decision of DECISIONS) {
          for (const auth of AUTHS) {
            const vector: Vector = { env, mode, risk, decision, auth };
            if (isValidVector(vector)) {
              vectors.push(vector);
            }
          }
        }
      }
    }
  }

  return vectors;
}
