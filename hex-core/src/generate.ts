import * as fs from 'fs';
import * as path from 'path';

const payloadPath = path.join(__dirname, 'payload.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

const e = payload.edge_length;
const w = 2 * e;
const h = Math.sqrt(3) * e;
const a = (Math.sqrt(3) / 2) * e;

const points = [
  [e, 0],
  [e/2, a],
  [-e/2, a],
  [-e, 0],
  [-e/2, -a],
  [e/2, -a]
].map(p => `${p[0]},${p[1]}`).join(' ');

const svg = `<svg width="600" height="600" viewBox="-70 -70 140 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
      <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1e3a8a" stroke-width="0.2"/>
    </pattern>
  </defs>

  <rect x="-70" y="-70" width="140" height="140" fill="#0b2a6f"/>
  <rect x="-70" y="-70" width="140" height="140" fill="url(#grid)"/>

  <polygon points="${points}" fill="none" stroke="white" stroke-width="1.2"/>

  <circle cx="0" cy="0" r="1" fill="white"/>

  <line x1="-${e}" y1="0" x2="${e}" y2="0" stroke="white" stroke-width="0.5" stroke-dasharray="2,2"/>
  <line x1="0" y1="-${e}" x2="0" y2="${e}" stroke="white" stroke-width="0.5" stroke-dasharray="2,2"/>
</svg>`;

const outPath = path.join(__dirname, '..', 'out', 'hex.svg');
fs.writeFileSync(outPath, svg);

console.log('SVG generated at', outPath);