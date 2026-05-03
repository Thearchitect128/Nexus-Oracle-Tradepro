import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const payloadPath = path.join(__dirname, 'src', 'payload.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

// Stringify with no spaces to match canonical
const payloadStr = JSON.stringify(payload);

const computedHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

const storedHash = 'b8c6a1f6f0d9e6e0c3a7a9d4d6c1e5f9a2b4c7d8e9f0a1b2c3d4e5f6a7b8c9d0';

if (computedHash === storedHash) {
  console.log('✅ Verification passed: hash matches');
  process.exit(0);
} else {
  console.log('❌ Verification failed: hash mismatch');
  console.log('Computed:', computedHash);
  console.log('Stored:  ', storedHash);
  process.exit(1);
}