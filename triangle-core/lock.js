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

const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

// Generate SVG first
import('./src/generate.js').then(() => {
  const svgPath = path.join(__dirname, 'out', 'triangle.svg');
  const svgContent = fs.readFileSync(svgPath);
  const svgHash = crypto.createHash('sha256').update(svgContent).digest('hex');

  const lockData = {
    payload_hash: payloadHash,
    svg_hash: svgHash
  };

  const lockPath = path.join(__dirname, 'payload.lock');
  fs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2));

  console.log('Lock file generated at', lockPath);
}).catch(console.error);