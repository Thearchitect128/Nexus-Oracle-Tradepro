import assert from 'node:assert/strict';
import { OracleKernelCore } from './oracleKernelCore';

const core = new OracleKernelCore(2);

const facetA = core.evaluate({
  W: 1,
  inside: true,
  margin: 0.1,
  gap: 0,
  kink: null,
  weights: { C_r: 1 },
  classification: { facet: 'Facet-A', label: 'A', M_min: 2 },
  state: { mode: 'BUILD_COMPRESS' },
});

assert.equal(facetA.inPhiAttractor, true);
assert.equal(facetA.attractorId, 'G_phi');

const facetB = core.evaluate({
  W: 1,
  inside: true,
  margin: 0.1,
  gap: 0,
  kink: null,
  weights: { C_r: 1 },
  classification: { facet: 'Facet-B', label: 'B', M_min: 2 },
  state: { mode: 'ANALYZE' },
});

assert.equal(facetB.inPhiAttractor, false);
assert.equal(facetB.attractorId, undefined);

console.log('oracleKernelCore attractor tests passed');
