import { z } from "zod";

// Transform schema: any mutation to the asset
export const TransformSchema = z.object({
  type: z.enum([
    "crop",
    "trim",
    "color",
    "overlay",
    "encode",
    "resample",
    "other"
  ]),
  timestamp: z.string().datetime(),
  tool: z.string(),
  operator: z.string(),
  signature: z.string()
});

export type Transform = z.infer<typeof TransformSchema>;

// Creator: who signed the asset
export const CreatorSchema = z.object({
  id: z.string(),
  signature: z.string()
});

export type Creator = z.infer<typeof CreatorSchema>;

// C2PA-style manifest: immutable provenance record
export const ManifestSchema = z.object({
  asset_id: z.string().uuid(),
  hash: z.string().regex(/^[a-f0-9]{64}$/), // SHA-256 hex
  created_at: z.string().datetime(),
  creator: CreatorSchema,
  transforms: z.array(TransformSchema).default([]),
  metadata: z
    .object({
      format: z.string().optional(),
      duration_ms: z.number().optional(),
      sample_rate: z.number().optional()
    })
    .optional()
});

export type Manifest = z.infer<typeof ManifestSchema>;

// Segment: for localized hash + signal verification
export const SegmentSchema = z.object({
  id: z.number(),
  start_ms: z.number(),
  end_ms: z.number(),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  signal_stable: z.boolean().default(true)
});

export type Segment = z.infer<typeof SegmentSchema>;

// Signal metadata: reference frequency + detection parameters
export const SignalMetadataSchema = z.object({
  reference_frequency: z.number().default(167.9),
  tolerance_hz: z.number().default(0.5),
  detection_method: z.enum(["fft", "correlation", "none"]).default("fft")
});

export type SignalMetadata = z.infer<typeof SignalMetadataSchema>;

// Full verification request
export const VerificationRequestSchema = z.object({
  asset_path: z.string(),
  manifest: ManifestSchema,
  segments: z.array(SegmentSchema).optional(),
  signal_metadata: SignalMetadataSchema.optional()
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

// Verification result
export const VerificationStateEnum = z.enum([
  "VERIFIED",
  "TRANSFORMED",
  "BROKEN",
  "UNKNOWN"
]);

export type VerificationState = z.infer<typeof VerificationStateEnum>;

export const VerificationResultSchema = z.object({
  state: VerificationStateEnum,
  asset_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  hash: z.object({
    expected: z.string(),
    computed: z.string(),
    match: z.boolean()
  }),
  signature: z.object({
    valid: z.boolean(),
    algorithm: z.string()
  }),
  transforms: z.object({
    valid: z.boolean(),
    count: z.number()
  }),
  signal: z.object({
    detected: z.boolean().optional(),
    stable: z.boolean().optional(),
    frequency: z.number().optional(),
    frequency_error_hz: z.number().optional()
  }),
  metadata: z.record(z.unknown()).optional()
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;
