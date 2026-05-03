# 671.6 Hz Audio Test Suite Technical Documentation

## Overview

This test suite provides standardized audio signals for validating audio reproduction systems at the Schumann resonance frequency of 671.6 Hz.

## Technical Specifications

- **Frequency**: 671.6 Hz (E5 + 32.4 cents)
- **Sample Rate**: 44,100 Hz
- **Bit Depth**: 16-bit PCM
- **Channels**: Mono
- **Fade Envelope**: 10 ms linear in/out
- **Headroom**: 20% (80% of full scale)

## Test Files

### Clean Sine
- Pure sinusoidal tone
- RMS Level: -5.0 dBFS
- Duration: 5.0 seconds

### Harmonics
- Fundamental + 2nd/3rd harmonics
- Weighting: 0.6 / 0.25 / 0.15
- RMS Level: -8.5 dBFS
- Duration: 5.0 seconds

### Safe Version
- Harmonics at -12 dB attenuation
- RMS Level: -20.5 dBFS
- Recommended for headphone testing

### Sweep
- Linear chirp 100→1000 Hz
- RMS Level: -5.0 dBFS
- Duration: 3.0 seconds

## Analysis Visualizations

- Spectrum analysis with dB scales
- Comparative spectral plots
- Time-frequency spectrograms

## Usage

1. Unzip the package
2. Run `./GENERATE_MANIFEST.sh` to verify integrity
3. Load audio files in your preferred player
4. Reference analysis images for expected results

## Verification

The package uses SHA256 checksums for integrity verification. All files are tracked in `checksums.sha256`.