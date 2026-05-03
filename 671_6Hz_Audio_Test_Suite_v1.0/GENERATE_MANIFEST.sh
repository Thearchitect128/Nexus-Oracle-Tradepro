#!/bin/bash
set -euo pipefail

# 671.6 Hz Audio Test Suite - Manifest Generator
# Generates SHA256 checksums for all package files

echo "# 671.6 Hz Audio Test Suite v1.0 - SHA256 Checksums" > checksums.sha256
echo "# Generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> checksums.sha256
echo "# This file serves as the cryptographic anchor for package integrity" >> checksums.sha256
echo "" >> checksums.sha256

# Find all files except checksums.sha256 itself, sort them for determinism
find . -type f -not -name "checksums.sha256" -not -name "GENERATE_MANIFEST.sh" | sort | while read -r file; do
    # Remove leading ./ for cleaner paths
    clean_path="${file#./}"
    checksum=$(sha256sum "$file" | awk '{print $1}')
    echo "$checksum  $clean_path" >> checksums.sha256
done

echo "Manifest generated: checksums.sha256"
echo "To verify: sha256sum -c checksums.sha256"