export type OracleMode = 'BUILD_COMPRESS' | 'FUSION' | 'ANALYZE' | 'IDLE';

export interface OracleState {
  mode: OracleMode;
}

export interface FacetClassification {
  facet: string;
  label: string;
  M_min: number;
}

export interface EnvelopeInputs {
  W: number;
  inside: boolean;
  margin: number;
  gap: number;
  kink: number | null;
  weights: { C_r: number };
  classification: FacetClassification;
  state: OracleState;
}

export interface EnvelopeReport {
  W: number;
  M_min: number;
  inside: boolean;
  margin: number;
  activeFacet: string;
  facetLabel: string;
  supportGap: number;
  kinkProximity: number;
  dimension: 2 | 3;
  degenerate?: boolean;

  // Law φ-A binding
  inPhiAttractor: boolean;
  attractorId?: 'G_phi';
  lawCompliance?: {
    lawId: 'phi-A';
    nearRecursion: boolean;
    irreversible: boolean;
    inAttractor: boolean;
  };
}

const PHI_FACETS = ['Facet-A', 'Facet-C'];

export class OracleKernelCore {
  constructor(
    private readonly dimension: 2 | 3,
    private readonly degenerate?: boolean,
  ) {}

  evaluate(input: EnvelopeInputs): EnvelopeReport {
    const { W, classification, inside, margin, gap, kink, weights, state } = input;

    const inPhiAttractor = inside && PHI_FACETS.includes(classification.facet);

    const lawCompliance = {
      lawId: 'phi-A' as const,
      nearRecursion: false,
      irreversible: state.mode === 'BUILD_COMPRESS' || state.mode === 'FUSION',
      inAttractor: inPhiAttractor,
    };

    return {
      W,
      M_min: classification.M_min,
      inside,
      margin,
      activeFacet: classification.facet,
      facetLabel: classification.label,
      supportGap: gap,
      kinkProximity: kink !== null ? Math.abs(weights.C_r - kink) : Infinity,
      dimension: this.dimension,
      degenerate: this.degenerate,
      inPhiAttractor,
      attractorId: inPhiAttractor ? 'G_phi' : undefined,
      lawCompliance,
    };
  }
}
