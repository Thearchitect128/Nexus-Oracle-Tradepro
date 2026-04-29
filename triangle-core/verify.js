import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import stringify from 'json-stable-stringify';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payloadPath = path.join(__dirname, 'src', 'payload.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

const payloadStr = stringify(payload);
const computedPayloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

// Recompute SVG
const e = payload.edge_length;
const q = (n) => Number(n.toFixed(6));
const r = q(e / Math.sqrt(3));
const sin60 = q(Math.sqrt(3) / 2);
const cos60 = q(0.5);

const points = [
  [0, r],
  [q(-r * sin60), q(-r * cos60)],
  [q(r * sin60), q(-r * cos60)]
].map(p => `${p[0]},${p[1]}`).join(' ');

const generatedSvg = `<svg width="600" height="600" viewBox="-70 -70 140 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
      <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1e3a8a" stroke-width="0.2"/>
    </pattern>
  </defs>

  <rect x="-70" y="-70" width="140" height="140" fill="#0b2a6f"/>
  <rect x="-70" y="-70" width="140" height="140" fill="url(#grid)"/>

  <polygon points="${points}" fill="none" stroke="white" stroke-width="1.2"/>

  <circle cx="0" cy="0" r="1" fill="white"/>

  <line x1="-${q(e/2)}" y1="0" x2="${q(e/2)}" y2="0" stroke="white" stroke-width="0.5" stroke-dasharray="2,2"/>
  <line x1="0" y1="-${q(e/2)}" x2="0" y2="${q(e/2)}" stroke="white" stroke-width="0.5" stroke-dasharray="2,2"/>
</svg>`;

const actualSvgPath = path.join(__dirname, 'out', 'triangle.svg');
const actualSvg = fs.readFileSync(actualSvgPath, 'utf-8');

if (generatedSvg !== actualSvg) {
  console.log('❌ Verification failed: SVG not derived from payload');
  process.exit(1);
}

const computedSvgHash = crypto.createHash('sha256').update(actualSvg).digest('hex');

const lockPath = path.join(__dirname, 'payload.lock');
const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));

const payloadMatch = computedPayloadHash === lockData.payload_hash;
const svgMatch = computedSvgHash === lockData.svg_hash;

if (payloadMatch && svgMatch) {
  console.log('✅ Verification passed: all hashes match');
  process.exit(0);
} else {
  console.log('❌ Verification failed');
  if (!payloadMatch) {
    console.log('Payload hash mismatch');
    console.log('Computed:', computedPayloadHash);
    console.log('Stored:  ', lockData.payload_hash);
  }
  if (!svgMatch) {
    console.log('SVG hash mismatch');
    console.log('Computed:', computedSvgHash);
    console.log('Stored:  ', lockData.svg_hash);
  }
  process.exit(1);
}