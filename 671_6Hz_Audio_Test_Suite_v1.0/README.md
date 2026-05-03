# 671.6 Hz Audio Test Suite v1.0

This release package contains a comprehensive audio test suite designed for validating audio systems at the Schumann resonance frequency of 671.6 Hz.

## Package Structure

- `audio/` - Audio test files (WAV format)
  - `clean` - Pure sine wave
  - `harmonics` - Fundamental with 2nd/3rd harmonics
  - `safe` - Harmonics at -12 dB attenuation
  - `sweep` - 100→1000 Hz chirp

- `analysis/` - Spectral analysis visualizations
  - `spectrum_analysis` - Detailed frequency analysis
  - `comparison` - Side-by-side spectral comparison
  - `spectrogram` - Time-frequency visualization

- `docs/` - Documentation
  - `AUDIO_TEST_SUITE_671_6HZ.md` - Technical specifications

## Verification

Run `./GENERATE_MANIFEST.sh` to generate `checksums.sha256` and verify integrity.

## License

[License information]