import assert from 'node:assert/strict';
import { OracleKernelCore } from './oracleKernelCore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBase() {
  return {
    W: 1,
    inside: true,
    margin: 0.1,
    gap: 0,
    kink: null as number | null,
    weights: { C_r: 1 },
    classification: { facet: 'Facet-A', label: 'A', M_min: 2 },
    state: { mode: 'BUILD_COMPRESS' as const },
  };
}

const core2 = new OracleKernelCore(2);
const core3 = new OracleKernelCore(3);
const coreDegenerate = new OracleKernelCore(2, true);

// ---------------------------------------------------------------------------
// 1. PHI_FACETS membership — Facet-A in attractor
// ---------------------------------------------------------------------------

const facetA_bc = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-A', label: 'A', M_min: 2 }, state: { mode: 'BUILD_COMPRESS' } });
assert.equal(facetA_bc.inPhiAttractor, true, 'Facet-A inside=true should be in phi-attractor');
assert.equal(facetA_bc.attractorId, 'G_phi', 'attractorId should be G_phi for Facet-A in attractor');
assert.equal(facetA_bc.lawCompliance?.lawId, 'phi-A', 'lawCompliance.lawId must always be phi-A');
assert.equal(facetA_bc.lawCompliance?.nearRecursion, false, 'nearRecursion is always false (deferred)');
assert.equal(facetA_bc.lawCompliance?.irreversible, true, 'BUILD_COMPRESS mode is irreversible');
assert.equal(facetA_bc.lawCompliance?.inAttractor, true, 'lawCompliance.inAttractor mirrors inPhiAttractor');

// ---------------------------------------------------------------------------
// 2. PHI_FACETS membership — Facet-C in attractor (new in PR)
// ---------------------------------------------------------------------------

const facetC_bc = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-C', label: 'C', M_min: 5 }, state: { mode: 'BUILD_COMPRESS' } });
assert.equal(facetC_bc.inPhiAttractor, true, 'Facet-C inside=true should be in phi-attractor');
assert.equal(facetC_bc.attractorId, 'G_phi', 'attractorId should be G_phi for Facet-C in attractor');
assert.equal(facetC_bc.lawCompliance?.inAttractor, true, 'Facet-C lawCompliance.inAttractor should be true');
assert.equal(facetC_bc.lawCompliance?.irreversible, true, 'BUILD_COMPRESS is irreversible for Facet-C');

// ---------------------------------------------------------------------------
// 3. Non-PHI facet (Facet-B) — never in attractor
// ---------------------------------------------------------------------------

const facetB = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-B', label: 'B', M_min: 3 }, state: { mode: 'ANALYZE' } });
assert.equal(facetB.inPhiAttractor, false, 'Facet-B should not be in phi-attractor');
assert.equal(facetB.attractorId, undefined, 'attractorId should be undefined for non-PHI facet');
assert.equal(facetB.lawCompliance?.lawId, 'phi-A', 'lawCompliance.lawId is always phi-A regardless of facet');
assert.equal(facetB.lawCompliance?.irreversible, false, 'ANALYZE mode is not irreversible');
assert.equal(facetB.lawCompliance?.nearRecursion, false, 'nearRecursion is always false');
assert.equal(facetB.lawCompliance?.inAttractor, false, 'non-PHI facet lawCompliance.inAttractor is false');

// ---------------------------------------------------------------------------
// 4. inside=false overrides phi-attractor membership
// ---------------------------------------------------------------------------

const phiOutside = core2.evaluate({ ...makeBase(), inside: false, classification: { facet: 'Facet-A', label: 'A', M_min: 2 }, state: { mode: 'BUILD_COMPRESS' } });
assert.equal(phiOutside.inPhiAttractor, false, 'inside=false must suppress phi-attractor even for Facet-A');
assert.equal(phiOutside.attractorId, undefined, 'attractorId must be undefined when outside envelope');
assert.equal(phiOutside.lawCompliance?.inAttractor, false, 'lawCompliance.inAttractor follows inPhiAttractor');
assert.equal(phiOutside.lawCompliance?.irreversible, true, 'irreversible still reflects mode (BUILD_COMPRESS) regardless of inside');

const phiOutsideFacetC = core2.evaluate({ ...makeBase(), inside: false, classification: { facet: 'Facet-C', label: 'C', M_min: 2 }, state: { mode: 'FUSION' } });
assert.equal(phiOutsideFacetC.inPhiAttractor, false, 'inside=false must suppress phi-attractor for Facet-C too');
assert.equal(phiOutsideFacetC.lawCompliance?.inAttractor, false, 'inAttractor false when outside');

// ---------------------------------------------------------------------------
// 5. irreversible: FUSION mode
// ---------------------------------------------------------------------------

const fusion = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-A', label: 'A', M_min: 2 }, state: { mode: 'FUSION' } });
assert.equal(fusion.lawCompliance?.irreversible, true, 'FUSION mode is irreversible');
assert.equal(fusion.inPhiAttractor, true, 'Facet-A inside=true still in attractor under FUSION');
assert.equal(fusion.lawCompliance?.inAttractor, true, 'lawCompliance.inAttractor true under FUSION');

// ---------------------------------------------------------------------------
// 6. irreversible: ANALYZE mode → false
// ---------------------------------------------------------------------------

const analyze = core2.evaluate({ ...makeBase(), state: { mode: 'ANALYZE' } });
assert.equal(analyze.lawCompliance?.irreversible, false, 'ANALYZE mode is not irreversible');

// ---------------------------------------------------------------------------
// 7. irreversible: IDLE mode → false
// ---------------------------------------------------------------------------

const idle = core2.evaluate({ ...makeBase(), state: { mode: 'IDLE' } });
assert.equal(idle.lawCompliance?.irreversible, false, 'IDLE mode is not irreversible');
assert.equal(idle.lawCompliance?.lawId, 'phi-A', 'lawId is always phi-A in IDLE mode');
assert.equal(idle.lawCompliance?.nearRecursion, false, 'nearRecursion always false in IDLE mode');

// ---------------------------------------------------------------------------
// 8. lawCompliance always present (not undefined)
// ---------------------------------------------------------------------------

const allModes = ['BUILD_COMPRESS', 'FUSION', 'ANALYZE', 'IDLE'] as const;
for (const mode of allModes) {
  const report = core2.evaluate({ ...makeBase(), state: { mode } });
  assert.ok(report.lawCompliance !== undefined, `lawCompliance must always be present in mode ${mode}`);
  assert.equal(report.lawCompliance.lawId, 'phi-A', `lawId must always be phi-A in mode ${mode}`);
  assert.equal(report.lawCompliance.nearRecursion, false, `nearRecursion always false in mode ${mode}`);
}

// ---------------------------------------------------------------------------
// 9. nearRecursion is always false (deferred per TODO in source)
// ---------------------------------------------------------------------------

const nearRecursionCheck = core2.evaluate({ ...makeBase(), inside: true, classification: { facet: 'Facet-A', label: 'A', M_min: 2 }, state: { mode: 'FUSION' } });
assert.equal(nearRecursionCheck.lawCompliance?.nearRecursion, false, 'nearRecursion is always false regardless of attractor state');

// ---------------------------------------------------------------------------
// 10. kinkProximity: kink=null → Infinity
// ---------------------------------------------------------------------------

const kinkNull = core2.evaluate({ ...makeBase(), kink: null });
assert.equal(kinkNull.kinkProximity, Infinity, 'kink=null should yield kinkProximity=Infinity');

// ---------------------------------------------------------------------------
// 11. kinkProximity: kink provided → |C_r - kink|
// ---------------------------------------------------------------------------

const kinkExact = core2.evaluate({ ...makeBase(), kink: 3, weights: { C_r: 5 } });
assert.equal(kinkExact.kinkProximity, 2, 'kinkProximity should be |5 - 3| = 2');

const kinkNegativeDiff = core2.evaluate({ ...makeBase(), kink: 7, weights: { C_r: 2 } });
assert.equal(kinkNegativeDiff.kinkProximity, 5, 'kinkProximity should be |2 - 7| = 5 (absolute value)');

const kinkZero = core2.evaluate({ ...makeBase(), kink: 1, weights: { C_r: 1 } });
assert.equal(kinkZero.kinkProximity, 0, 'kinkProximity should be 0 when C_r equals kink');

// ---------------------------------------------------------------------------
// 12. Field pass-through: W, M_min, inside, margin, activeFacet, facetLabel, supportGap
// ---------------------------------------------------------------------------

const passThrough = core2.evaluate({
  W: 42,
  inside: false,
  margin: 0.5,
  gap: 7,
  kink: null,
  weights: { C_r: 1 },
  classification: { facet: 'Facet-X', label: 'X-label', M_min: 99 },
  state: { mode: 'IDLE' },
});
assert.equal(passThrough.W, 42, 'W should be passed through');
assert.equal(passThrough.M_min, 99, 'M_min should come from classification.M_min');
assert.equal(passThrough.inside, false, 'inside should be passed through');
assert.equal(passThrough.margin, 0.5, 'margin should be passed through');
assert.equal(passThrough.activeFacet, 'Facet-X', 'activeFacet should come from classification.facet');
assert.equal(passThrough.facetLabel, 'X-label', 'facetLabel should come from classification.label');
assert.equal(passThrough.supportGap, 7, 'supportGap should come from gap input');

// ---------------------------------------------------------------------------
// 13. dimension=2 and dimension=3 from constructor
// ---------------------------------------------------------------------------

const dim2 = core2.evaluate({ ...makeBase() });
assert.equal(dim2.dimension, 2, 'dimension=2 should come from constructor');

const dim3 = core3.evaluate({ ...makeBase() });
assert.equal(dim3.dimension, 3, 'dimension=3 should come from constructor');

// ---------------------------------------------------------------------------
// 14. degenerate flag from constructor
// ---------------------------------------------------------------------------

const degenerateReport = coreDegenerate.evaluate({ ...makeBase() });
assert.equal(degenerateReport.degenerate, true, 'degenerate=true should propagate from constructor');

const nonDegenerateReport = core2.evaluate({ ...makeBase() });
assert.equal(nonDegenerateReport.degenerate, undefined, 'degenerate should be undefined when not set in constructor');

// ---------------------------------------------------------------------------
// 15. PHI_FACETS boundary: unknown facet name is not in attractor
// ---------------------------------------------------------------------------

const unknownFacet = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-D', label: 'D', M_min: 1 } });
assert.equal(unknownFacet.inPhiAttractor, false, 'Unknown facet must not be in phi-attractor');
assert.equal(unknownFacet.attractorId, undefined, 'attractorId must be undefined for unknown facet');
assert.equal(unknownFacet.lawCompliance?.inAttractor, false, 'inAttractor false for unknown facet');

// PHI_FACETS is case-sensitive
const lowerCaseFacet = core2.evaluate({ ...makeBase(), classification: { facet: 'facet-a', label: 'a', M_min: 1 } });
assert.equal(lowerCaseFacet.inPhiAttractor, false, 'PHI_FACETS matching is case-sensitive');

// ---------------------------------------------------------------------------
// 16. Regression: Facet-C inside=false + FUSION → no attractor, but irreversible=true
// ---------------------------------------------------------------------------

const regression_FacetC_outside_fusion = core2.evaluate({
  ...makeBase(),
  inside: false,
  classification: { facet: 'Facet-C', label: 'C', M_min: 4 },
  state: { mode: 'FUSION' },
});
assert.equal(regression_FacetC_outside_fusion.inPhiAttractor, false, 'regression: Facet-C outside envelope is not in attractor');
assert.equal(regression_FacetC_outside_fusion.attractorId, undefined, 'regression: attractorId undefined when outside');
assert.equal(regression_FacetC_outside_fusion.lawCompliance?.irreversible, true, 'regression: FUSION still irreversible even when outside');
assert.equal(regression_FacetC_outside_fusion.lawCompliance?.inAttractor, false, 'regression: inAttractor false when outside despite FUSION mode');

// ---------------------------------------------------------------------------
// 17. lawCompliance.inAttractor is independent of irreversible
// ---------------------------------------------------------------------------

// ANALYZE + Facet-A + inside=true → inAttractor=true, irreversible=false
const analyzeInAttractor = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-A', label: 'A', M_min: 2 }, state: { mode: 'ANALYZE' } });
assert.equal(analyzeInAttractor.lawCompliance?.inAttractor, true, 'inAttractor can be true even when irreversible=false');
assert.equal(analyzeInAttractor.lawCompliance?.irreversible, false, 'irreversible=false under ANALYZE regardless of attractor');

// BUILD_COMPRESS + Facet-B + inside=true → inAttractor=false, irreversible=true
const bcNotInAttractor = core2.evaluate({ ...makeBase(), classification: { facet: 'Facet-B', label: 'B', M_min: 2 }, state: { mode: 'BUILD_COMPRESS' } });
assert.equal(bcNotInAttractor.lawCompliance?.inAttractor, false, 'inAttractor false for Facet-B even in BUILD_COMPRESS');
assert.equal(bcNotInAttractor.lawCompliance?.irreversible, true, 'irreversible=true in BUILD_COMPRESS regardless of facet');

console.log('oracleKernelCore attractor tests passed');