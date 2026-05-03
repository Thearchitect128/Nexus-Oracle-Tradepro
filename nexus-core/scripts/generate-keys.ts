import { generateSigningKeyPair } from "../src/core/signing.js";

const keys = generateSigningKeyPair();

console.log("PUBLIC_KEY_PEM=");
console.log(keys.publicKeyPem.trim());
console.log("\nPRIVATE_KEY_PEM=");
console.log(keys.privateKeyPem.trim());
