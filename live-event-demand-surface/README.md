# Live Event Demand Surface v0.1

A system for analyzing live event demand, particularly concert tickets, based on artist, venue, and date inputs.

## Installation

```bash
npm install
```

## Usage

Run the demand surface analysis:

```bash
npm run start 'L0_TRACK = "Artist + Venue + Date"'
```

Examples:

```bash
npm run start 'L0_TRACK = "BTS + Tottenham Hotspur Stadium + 2026-07-15"'
npm run start 'L0_TRACK = "Kendrick Lamar + SoFi Stadium + 2026-06-XX"'
npm run start 'L0_TRACK = "Jon Favreau + Comic Con + 2040"'
```

## Output

The system provides a structured analysis including:

- Layer-by-layer processing (L1_SAVE to L5_TICKET_CONVERT)
- Translation summary
- Verdict
- Operator readout
- Playbook classification
- Phoenix-weighted odds
- Drift verdict

## Development

```bash
npm run dev
npm run build
npm test
```