import { generateAllVectors } from "../src/matrix/generator";

const args = new Set(process.argv.slice(2));
const vectors = generateAllVectors().map((vector, index) => ({
  id: `v${index + 1}`,
  ...vector,
}));

if (args.has("--json")) {
  process.stdout.write(JSON.stringify(vectors));
  process.exit(0);
}

for (const vector of vectors) {
  console.log(`${vector.id}: ${JSON.stringify(vector)}`);
}

console.log(`total=${vectors.length}`);
