import { createHash } from "crypto";
import fs from "fs";
import { promisify } from "util";
import {
  HashComputationError,
  FileAccessError
} from "./errors";

const readFile = promisify(fs.readFile);

/**
 * Compute SHA-256 hash of a file
 * Streams for memory efficiency on large files
 * Throws: FileAccessError, HashComputationError
 */
export async function sha256File(filePath: string): Promise<string> {
  // Validate file exists and is readable
  if (!filePath || typeof filePath !== "string") {
    throw new FileAccessError(
      filePath || "unknown",
      "File path must be a non-empty string"
    );
  }

  if (!fs.existsSync(filePath)) {
    throw new FileAccessError(filePath, `File not found: ${filePath}`);
  }

  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
      try {
        hash.update(chunk);
      } catch (error) {
        reject(
          new HashComputationError(
            filePath,
            "Failed to update hash",
            error as Error
          )
        );
      }
    });

    stream.on("end", () => {
      try {
        resolve(hash.digest("hex"));
      } catch (error) {
        reject(
          new HashComputationError(
            filePath,
            "Failed to finalize hash",
            error as Error
          )
        );
      }
    });

    stream.on("error", (error) => {
      reject(
        new FileAccessError(
          filePath,
          `Failed to read file: ${error.message}`,
          error
        )
      );
    });
  });
}

/**
 * Compute SHA-256 hash of a buffer
 * Throws: HashComputationError
 */
export function sha256Buffer(buffer: Buffer): string {
  if (!Buffer.isBuffer(buffer)) {
    throw new HashComputationError(
      "buffer",
      "Input must be a valid Buffer"
    );
  }

  try {
    return createHash("sha256").update(buffer).digest("hex");
  } catch (error) {
    throw new HashComputationError(
      "buffer",
      `Failed to hash buffer: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Compute SHA-256 hash of a string
 * Throws: HashComputationError
 */
export function sha256String(text: string): string {
  if (typeof text !== "string") {
    throw new HashComputationError(
      "string",
      "Input must be a valid string"
    );
  }

  try {
    return createHash("sha256").update(text).digest("hex");
  } catch (error) {
    throw new HashComputationError(
      "string",
      `Failed to hash string: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Segment-based hashing for audio/video
 * Divides file into chunks and hashes each
 * Throws: FileAccessError, HashComputationError
 */
export async function segmentHash(
  filePath: string,
  segmentSize: number = 1024 * 1024 // 1MB chunks
): Promise<{
  full_hash: string;
  segment_hashes: Array<{
    id: number;
    start: number;
    end: number;
    hash: string;
  }>;
}> {
  // Validate parameters
  if (!filePath || typeof filePath !== "string") {
    throw new FileAccessError(
      filePath || "unknown",
      "File path must be a non-empty string"
    );
  }

  if (segmentSize <= 0 || !Number.isFinite(segmentSize)) {
    throw new HashComputationError(
      filePath,
      "Segment size must be a positive number"
    );
  }

  if (!fs.existsSync(filePath)) {
    throw new FileAccessError(filePath, `File not found: ${filePath}`);
  }

  try {
    const fileBuffer = await readFile(filePath);

    if (fileBuffer.length === 0) {
      throw new HashComputationError(
        filePath,
        "File is empty, cannot compute segments"
      );
    }

    const segments = [];
    let offset = 0;
    let id = 0;

    while (offset < fileBuffer.length) {
      const end = Math.min(offset + segmentSize, fileBuffer.length);
      const chunk = fileBuffer.subarray(offset, end);
      const hash = sha256Buffer(chunk);

      segments.push({
        id,
        start: offset,
        end,
        hash
      });

      offset = end;
      id++;
    }

    const fullHash = createHash("sha256").update(fileBuffer).digest("hex");

    return {
      full_hash: fullHash,
      segment_hashes: segments
    };
  } catch (error) {
    if (error instanceof FileAccessError || error instanceof HashComputationError) {
      throw error;
    }
    throw new HashComputationError(
      filePath,
      `Segment hashing failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Validate that segments reconstruct to full hash
 * Throws: FileAccessError, HashComputationError
 */
export async function validateSegments(
  segments: Array<{ hash: string }>,
  expectedFullHash: string,
  filePath: string,
  segmentSize: number = 1024 * 1024
): Promise<boolean> {
  // Validate parameters
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new HashComputationError(
      filePath,
      "Segments must be a non-empty array"
    );
  }

  if (typeof expectedFullHash !== "string" || !expectedFullHash.match(/^[a-f0-9]{64}$/)) {
    throw new HashComputationError(
      filePath,
      "Expected full hash must be a valid SHA-256 hex string"
    );
  }

  if (!segments.every((s) => typeof s.hash === "string" && s.hash.match(/^[a-f0-9]{64}$/))) {
    throw new HashComputationError(
      filePath,
      "All segment hashes must be valid SHA-256 hex strings"
    );
  }

  try {
    const result = await segmentHash(filePath, segmentSize);
    const match = result.full_hash === expectedFullHash;

    if (!match) {
      // Validate that segment count matches
      if (result.segment_hashes.length !== segments.length) {
        console.warn(
          `Segment count mismatch: expected ${segments.length}, got ${result.segment_hashes.length}`
        );
      }
    }

    return match;
  } catch (error) {
    throw error;
  }
}
