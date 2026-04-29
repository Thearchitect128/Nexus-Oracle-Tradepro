import { createHash } from "crypto";
import { readFileSync } from "fs";
import { z } from 'zod';

interface Session {
  accountId: string;
  geo: string;
  deviceId: string;
  startTime: number;
  duration: number;
}

interface Account {
  id: string;
  planLimit: number;
  devices: string[];
}

interface Config {
  geoWindowHours: number;
  maxDevices: number;
  sessionJumpSeconds: number;
  geoSplitThreshold: number;
  deviceDensityThreshold: number;
  concurrencyThreshold: number;
  sessionRelayThreshold: number;
}

interface InputData {
  accounts: Account[];
  sessions: Session[];
  arpu: number;
  conversionRate: number;
}

function stableStringify(obj: any): string {
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(",")}]`;
  }
  if (obj && typeof obj === "object") {
    return `{${Object.keys(obj)
      .sort()
      .map(k => `"${k}":${stableStringify(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(obj);
}

function stableHash(obj: any): string {
  return createHash("sha256")
    .update(stableStringify(obj))
    .digest("hex");
}

function detectGeoSplit(sessions: Session[], config: Config): { count: number; accounts: Record<string, { rate: number; sessions: number }> } {
  const accountSessions = sessions.reduce((acc, session) => {
    if (!acc[session.accountId]) acc[session.accountId] = [];
    acc[session.accountId].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  let totalCount = 0;
  const accountMetrics: Record<string, { rate: number; sessions: number }> = {};

  for (const [accId, sess] of Object.entries(accountSessions)) {
    sess.sort((a, b) => a.startTime - b.startTime);
    let splits = 0;
    for (let i = 1; i < sess.length; i++) {
      const prev = sess[i - 1];
      const curr = sess[i];
      if (curr.geo !== prev.geo && (curr.startTime - (prev.startTime + prev.duration)) < config.geoWindowHours * 60 * 60) {
        splits++;
      }
    }
    const rate = sess.length > 0 ? splits / sess.length : 0;
    accountMetrics[accId] = { rate, sessions: sess.length };
    if (rate > config.geoSplitThreshold) totalCount++;
  }
  return { count: totalCount, accounts: accountMetrics };
}

function detectDeviceBloom(accounts: Account[], config: Config): { count: number; accounts: Record<string, { density: number; devices: number }> } {
  const accountMetrics: Record<string, { density: number; devices: number }> = {};
  let count = 0;
  accounts.forEach(acc => {
    // Simplified: assume active days = 30 for density
    const density = acc.devices.length / 30;
    accountMetrics[acc.id] = { density, devices: acc.devices.length };
    if (density > config.deviceDensityThreshold) count++;
  });
  return { count, accounts: accountMetrics };
}

function detectConcurrencyBreach(accounts: Account[], sessions: Session[], config: Config): { count: number; accounts: Record<string, { maxConcurrent: number; breaches: number }> } {
  const accountMetrics: Record<string, { maxConcurrent: number; breaches: number }> = {};
  let count = 0;
  accounts.forEach(acc => {
    const accSessions = sessions.filter(s => s.accountId === acc.id);
    let maxConcurrent = 0;
    accSessions.forEach(s => {
      const overlapping = accSessions.filter(other =>
        other.startTime < s.startTime + s.duration &&
        other.startTime + other.duration > s.startTime
      ).length;
      if (overlapping > maxConcurrent) maxConcurrent = overlapping;
    });
    const breaches = maxConcurrent > acc.planLimit + config.concurrencyThreshold ? 1 : 0;
    accountMetrics[acc.id] = { maxConcurrent, breaches };
    if (breaches) count++;
  });
  return { count, accounts: accountMetrics };
}

function detectSessionRelay(sessions: Session[], config: Config): { count: number; accounts: Record<string, { rate: number; sessions: number }> } {
  const accountSessions = sessions.reduce((acc, session) => {
    if (!acc[session.accountId]) acc[session.accountId] = [];
    acc[session.accountId].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  let totalCount = 0;
  const accountMetrics: Record<string, { rate: number; sessions: number }> = {};

  for (const [accId, sess] of Object.entries(accountSessions)) {
    sess.sort((a, b) => a.startTime - b.startTime);
    let relays = 0;
    for (let i = 1; i < sess.length; i++) {
      const prev = sess[i - 1];
      const curr = sess[i];
      if ((curr.startTime - (prev.startTime + prev.duration)) < config.sessionJumpSeconds && (curr.geo !== prev.geo || curr.deviceId !== prev.deviceId)) {
        relays++;
      }
    }
    const rate = sess.length > 0 ? relays / sess.length : 0;
    accountMetrics[accId] = { rate, sessions: sess.length };
    if (rate > config.sessionRelayThreshold) totalCount++;
  }
  return { count: totalCount, accounts: accountMetrics };
}

function confidenceScore(flags: Record<string, boolean>): number {
  const weights = {
    geo_split: 0.3,
    device_bloom: 0.2,
    concurrency_breach: 0.3,
    session_relay: 0.2
  };
  const score = Object.entries(weights).reduce(
    (acc, [k, w]) => acc + (flags[k] ? w : 0),
    0
  );
  return Math.min(score, 0.95);
}

export interface EnforcementAction {
  action: 'allow' | 'challenge' | 'limit' | 'upgrade_required';
  reason: string;
  confidence: number;
}

function determineEnforcement(riskScore: number, confidence: number, config: Config): EnforcementAction {
  if (riskScore < 0.3 && confidence > 0.8) {
    return { action: 'allow', reason: 'Low risk, high confidence', confidence };
  } else if (riskScore < 0.6) {
    return { action: 'challenge', reason: 'Moderate risk, additional verification needed', confidence };
  } else if (riskScore < 0.8) {
    return { action: 'limit', reason: 'High risk, usage limitations applied', confidence };
  } else {
    return { action: 'upgrade_required', reason: 'Critical risk, account upgrade required', confidence };
  }
}

// Mock data for simulation
const mockData = {
  platforms: {
    'Netflix': {
      accounts: 250000000,
      active_viewers: 410000000,
      verified_households: 262000000,
      arbitrage: {
        geo_split: 62000000,
        device_bloom: 48000000,
        concurrency_breach: 32000000,
        session_relay: 18000000
      },
      unmonetized_households: 148000000,
      arpu: 8,
      confidence: 0.93
    },
    'Disney+': {
      accounts: 150000000,
      active_viewers: 220000000,
      verified_households: 165000000,
      arbitrage: {
        geo_split: 25000000,
        device_bloom: 20000000,
        concurrency_breach: 15000000,
        session_relay: 10000000
      },
      unmonetized_households: 55000000,
      arpu: 10,
      confidence: 0.89
    }
  }
};

function runArbitrageAnalysis(data: InputData, config: Config) {
  const accounts = data.accounts;
  const sessions = data.sessions;
  const arpu = data.arpu;
  const conversionRate = data.conversionRate;

  const geoSplit = detectGeoSplit(sessions, config);
  const deviceBloom = detectDeviceBloom(accounts, config);
  const concurrencyBreach = detectConcurrencyBreach(accounts, sessions, config);
  const sessionRelay = detectSessionRelay(sessions, config);

  // Compute baselines
  const allGeoRates = Object.values(geoSplit.accounts).map(m => m.rate);
  const baselineGeoSplit = allGeoRates.reduce((a, b) => a + b, 0) / allGeoRates.length || 0;

  const allDeviceDensities = Object.values(deviceBloom.accounts).map(m => m.density);
  const baselineDeviceDensity = allDeviceDensities.reduce((a, b) => a + b, 0) / allDeviceDensities.length || 0;

  // Adjust counts based on baseline deviation
  const adjustedGeoSplit = Object.values(geoSplit.accounts).filter(m => m.rate > baselineGeoSplit * 3).length;
  const adjustedDeviceBloom = Object.values(deviceBloom.accounts).filter(m => m.density > baselineDeviceDensity * 3).length;
  const adjustedConcurrency = concurrencyBreach.count; // Keep as is
  const adjustedSessionRelay = sessionRelay.count; // Keep as is

  const totalArbitrage = adjustedGeoSplit + adjustedDeviceBloom + adjustedConcurrency + adjustedSessionRelay;
  const verifiedHouseholds = accounts.length - totalArbitrage;
  const unmonetizedHouseholds = totalArbitrage;
  const activeViewers = sessions.length;

  const monthlyUpside = unmonetizedHouseholds * arpu * conversionRate;
  const annualUpside = monthlyUpside * 12;

  const flags = {
    geo_split: adjustedGeoSplit > 0,
    device_bloom: adjustedDeviceBloom > 0,
    concurrency_breach: adjustedConcurrency > 0,
    session_relay: adjustedSessionRelay > 0
  };
  const confidence = confidenceScore(flags);

  // Per-account explanations with enforcement
  const accountExplanations = accounts.map(acc => {
    const geo = geoSplit.accounts[acc.id];
    const device = deviceBloom.accounts[acc.id];
    const conc = concurrencyBreach.accounts[acc.id];
    const sess = sessionRelay.accounts[acc.id];
    const accFlags = [];
    let riskScore = 0;
    if (geo && geo.rate > baselineGeoSplit * 3) {
      accFlags.push('geo_split');
      riskScore += 0.3;
    }
    if (device && device.density > baselineDeviceDensity * 3) {
      accFlags.push('device_bloom');
      riskScore += 0.2;
    }
    if (conc && conc.breaches) {
      accFlags.push('concurrency_breach');
      riskScore += 0.3;
    }
    if (sess && sess.rate > config.sessionRelayThreshold) {
      accFlags.push('session_relay');
      riskScore += 0.2;
    }
    const enforcement = determineEnforcement(riskScore, confidence, config);
    return {
      accountId: acc.id,
      flags: accFlags,
      riskScore,
      enforcement,
      metrics: {
        geoSplitRate: geo?.rate || 0,
        deviceDensity: device?.density || 0,
        maxConcurrent: conc?.maxConcurrent || 0,
        sessionRelayRate: sess?.rate || 0
      }
    };
  }).filter(exp => exp.flags.length > 0);

  const arbitrage = {
    geo_split: geoSplit,
    device_bloom: deviceBloom,
    concurrency_breach: concurrencyBreach,
    session_relay: sessionRelay
  };

  return {
    platform: 'Dynamic',
    accounts: accounts.length,
    active_viewers: activeViewers,
    verified_households: verifiedHouseholds,
    arbitrage,
    unmonetized_households: unmonetizedHouseholds,
    revenue_impact: {
      monthly: monthlyUpside,
      annual: annualUpside
    },
    confidence,
    state: 'ARBITRAGE_DETECTED',
    surface: 'PASSWORD_SHARING',
    household_gap: unmonetizedHouseholds,
    revenue_leakage: monthlyUpside > 1000000 ? 'HIGH' : 'MEDIUM',
    primary_vectors: Object.keys(arbitrage).filter(key => (arbitrage as any)[key] > 0),
    baselines: {
      geoSplit: baselineGeoSplit,
      deviceDensity: baselineDeviceDensity
    },
    accountExplanations
  };
}

function main() {
  const platform = process.argv[2];
  const inputFilePath = process.argv[3];
  const configFilePath = process.argv[4] || 'config.json';
  const isJson = process.argv.includes('--json');

  if (!platform || !inputFilePath) {
    console.log('Usage: npm run start <platform> <input.json> [config.json] [--json]');
    return;
  }

  const raw = JSON.parse(readFileSync(inputFilePath, 'utf-8')) as InputData;
  const config = JSON.parse(readFileSync(configFilePath, 'utf-8')) as Config;
  const result = runArbitrageAnalysis(raw, config);
  const hash = stableHash(result);

  const output = { ...result, hash };

  if (isJson) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log('🔱 🪞 Password Sharing Arbitrage — "How many real households are watching vs paying?"');
  console.log('');
  console.log('Probe Path');
  console.log('Account → Devices → Sessions → Geo/IP Cohorts → Concurrency → Billing → Retention');
  console.log('');
  console.log('Signal Layer (session-cohort integrity)');
  console.log('');
  console.log('Phase-lock =');
  console.log('same household → stable device graph → consistent geo pattern → bounded concurrency');
  console.log('');
  console.log('🚨 Failure Modes (Drift Events)');
  console.log('E1_GEO_SPLIT');
  console.log('Same account used across distant geos (e.g., NY + LA + EU within hours)');
  console.log('');
  console.log('→ Multiple households on one account');
  console.log('');
  console.log('E2_DEVICE_BLOOM');
  console.log('Device count grows beyond realistic household usage');
  console.log('');
  console.log('→ Credential sharing or resale');
  console.log('');
  console.log('E3_CONCURRENCY_BREACH');
  console.log('Simultaneous streams exceed plan tier');
  console.log('');
  console.log('→ Unauthorized parallel households');
  console.log('');
  console.log('E4_SESSION_RELAY');
  console.log('Sequential sessions hopping geos/devices unnaturally fast');
  console.log('');
  console.log('→ Credential networks / resale rings');
  console.log('');
  console.log('E5_PAYMENT_GAP');
  console.log('Active sessions with no corresponding billing upgrade');
  console.log('');
  console.log('→ Free riders inside paid footprint');
  console.log('');
  console.log('HOLD (truth state)');
  console.log('Stable_devices ∧ Geo_coherent ∧ Concurrency_valid ∧ Billing_aligned');
  console.log('');
  console.log('→ Household = verified');
  console.log('');
  console.log('📊 Analysis Output');
  console.log('');
  console.log(`Platform: ${platform} subscriber base snapshot`);
  console.log('');
  console.log('{');
  console.log(`  "accounts": ${result.accounts},`);
  console.log(`  "active_viewers": ${result.active_viewers},`);
  console.log(`  "verified_households": ${result.verified_households},`);
  console.log('  "arbitrage": {');
  Object.entries(result.arbitrage).forEach(([key, value]) => {
    console.log(`    "${key}": ${value},`);
  });
  console.log('  },');
  console.log(`  "unmonetized_households": ${result.unmonetized_households}`);
  console.log('}');
  console.log('');
  console.log('Translation (no fluff)');
  console.log(`~${result.active_viewers} viewers from ${result.accounts} accounts`);
  console.log(`True households ≈ ${result.verified_households}`);
  console.log(`${result.unmonetized_households} households unmonetized`);
  console.log('');
  console.log('Revenue Impact');
  console.log('');
  console.log(`ARPU: $${raw.arpu}/month, Conversion Rate: ${raw.conversionRate}`);
  console.log('');
  console.log(`${result.unmonetized_households} × ${raw.arpu} × ${raw.conversionRate} = $${result.revenue_impact.monthly.toFixed(2)}/month`);
  console.log('');
  console.log(`→ $${result.revenue_impact.annual.toFixed(2)} annual upside`);
  console.log('');
  console.log('🧭 Operator Readout: Password Sharing');
  console.log('1. Accounts ≠ Households');
  console.log('');
  console.log('Billing units undercount real usage');
  console.log('');
  console.log('2. Geo is truth');
  console.log('');
  console.log('Households don\'t teleport');
  console.log('');
  console.log('3. Concurrency defines boundaries');
  console.log('');
  console.log('Plan limits = enforcement layer');
  console.log('');
  console.log('🔒 System Output');
  console.log('{');
  console.log(`  "state": "${result.state}",`);
  console.log(`  "surface": "${result.surface}",`);
  console.log(`  "confidence": ${result.confidence},`);
  console.log(`  "household_gap": ${result.household_gap},`);
  console.log(`  "revenue_leakage": "${result.revenue_leakage}",`);
  console.log('  "primary_vectors": [');
  result.primary_vectors.forEach((vector, i) => {
    console.log(`    "${vector}"${i < result.primary_vectors.length - 1 ? ',' : ''}`);
  });
  console.log('  ],');
  console.log(`  "hash": "${hash}"`);
  console.log('}');
  console.log('');
  console.log('⚠️ What this solves');
  console.log('Hidden multi-household usage');
  console.log('Subscription underpricing');
  console.log('Credential resale markets');
  console.log('Misleading MAU vs revenue ratios');
}

export { runArbitrageAnalysis, determineEnforcement };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}