#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { verifyAsset, isFailed, summarize } from "./verify";
import { isVerifierError } from "./errors";

/**
 * CLI: Verify an asset against its manifest
 *
 * Usage:
 *   verify-asset <file> <manifest> [options]
 *
 * Options:
 *   --check-signal    Enable signal integrity checks
 *   --verbose         Show detailed error information
 *   --json            Output result as JSON
 */

interface CliOptions {
  checkSignal: boolean;
  verbose: boolean;
  jsonOutput: boolean;
}

function parseArgs(): { filePath?: string; manifestPath?: string; options: CliOptions } {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    checkSignal: false,
    verbose: false,
    jsonOutput: false
  };

  // Parse options
  let fileIdx = args.length;
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i].startsWith("--")) {
      if (args[i] === "--check-signal") options.checkSignal = true;
      if (args[i] === "--verbose") options.verbose = true;
      if (args[i] === "--json") options.jsonOutput = true;
      fileIdx = i;
    } else {
      break;
    }
  }

  const filePath = args[0];
  const manifestPath = args[1];

  return { filePath, manifestPath, options };
}

function printUsage() {
  console.error("Usage: verify-asset <file> <manifest> [options]");
  console.error("\nOptions:");
  console.error("  --check-signal    Enable signal integrity checks");
  console.error("  --verbose         Show detailed error information");
  console.error("  --json            Output result as JSON");
  console.error("\nExample:");
  console.error("  verify-asset video.mp4 manifest.json");
  console.error("  verify-asset audio.wav manifest.json --check-signal --verbose");
}

async function main() {
  const { filePath, manifestPath, options } = parseArgs();

  // Validate arguments
  if (!filePath || !manifestPath) {
    printUsage();
    process.exit(1);
  }

  // Validate files exist
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: Asset file not found: ${filePath}`);
    if (options.verbose) {
      console.error(`   Path: ${path.resolve(filePath)}`);
    }
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Error: Manifest file not found: ${manifestPath}`);
    if (options.verbose) {
      console.error(`   Path: ${path.resolve(manifestPath)}`);
    }
    process.exit(1);
  }

  try {
    let manifestData: unknown;
    try {
      manifestData = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch (error) {
      console.error(`❌ Error: Invalid JSON in manifest file`);
      if (options.verbose) {
        console.error(`   ${(error as Error).message}`);
      }
      process.exit(1);
    }

    if (!options.jsonOutput) {
      console.log(`\n📋 Verifying Asset: ${path.basename(filePath)}`);
      console.log(`📄 Manifest: ${path.basename(manifestPath)}`);
      if (options.checkSignal) {
        console.log(`🔊 Signal checks: ENABLED`);
      }
      console.log("");
    }

    const result = await verifyAsset(filePath, manifestData, {
      checkSignal: options.checkSignal
    });

    if (options.jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Print summary
      console.log(summarize(result));

      // Print detailed output if verbose
      if (options.verbose) {
        console.log("\n--- Full Details ---");
        console.log(JSON.stringify(result, null, 2));
      }
    }

    // Exit code
    if (isFailed(result)) {
      if (!options.jsonOutput) {
        console.log("\n❌ Verification FAILED");
      }
      process.exit(1);
    } else {
      if (!options.jsonOutput) {
        console.log("\n✅ Verification PASSED");
      }
      process.exit(0);
    }
  } catch (error) {
    if (isVerifierError(error)) {
      console.error(`❌ Error: ${error.message}`);
      if (options.verbose) {
        console.error(`   Code: ${error.code}`);
        if (error.context) {
          console.error(`   Context: ${JSON.stringify(error.context)}`);
        }
      }
    } else if (error instanceof Error) {
      console.error(`❌ Unexpected error: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
    } else {
      console.error(`❌ Unexpected error: ${String(error)}`);
    }
    process.exit(1);
  }
}

main();
