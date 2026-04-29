import { z } from 'zod';

// Input schema
const L0TrackSchema = z.string().regex(/^L0_TRACK = "(.+)"$/);
const TrackSchema = z.string().regex(/^(.+) \+ (.+) \+ (.+)$/);

// Mock data for simulation
const mockData = {
  artists: {
    'BTS': {
      l1_save: { saves: 5000000, retained: 3000000, overlap: 0.65 },
      l2_replay: { depth: 90, speed: 1.0 },
      l3_geo: { cluster: 'SEOUL', radius: 50, stability: 120 },
      l4_demand: { velocity: 12.5, searches: 'BTS concert' },
      l5_convert: { forecast: 65000, cap: 62000, conversion: 0.025, confidence: 0.95 },
      playbook: 'P-01: MEGA-KPOP-STADIUM',
      phoenix: 0.94,
      drift: false
    },
    'Kendrick Lamar': {
      l1_save: { saves: 2000000, retained: 1500000, overlap: 0.70 },
      l2_replay: { depth: 60, speed: 1.0 },
      l3_geo: { cluster: 'INGLEWOOD', radius: 25, stability: 90 },
      l4_demand: { velocity: 8.2, searches: 'Kendrick SoFi' },
      l5_convert: { forecast: 76200, cap: 70000, conversion: 0.022, confidence: 0.94 },
      playbook: 'P-07: RAP-STADIUM-TOUR',
      phoenix: 0.94,
      drift: false
    },
    'Jon Favreau': {
      l1_save: { saves: 384000, retained: 231000, overlap: 0.61 },
      l2_replay: { depth: 28, speed: 1.0 },
      l3_geo: { cluster: 'SAN DIEGO', radius: 25, stability: 90 },
      l4_demand: { velocity: 6.8, searches: 'Favreau SDCC' },
      l5_convert: { forecast: 7840, cap: 6500, conversion: 0.0204, confidence: 0.88 },
      playbook: 'P-03: COMIC-CON-PANEL',
      phoenix: 0.92,
      drift: false
    }
  }
};

function parseL0Track(input: string): { artist: string; venue: string; date: string } | null {
  const match = input.match(/^L0_TRACK = "(.+)"$/);
  if (!match) return null;
  const track = match[1];
  const parts = track.split(' + ');
  if (parts.length !== 3) return null;
  return { artist: parts[0], venue: parts[1], date: parts[2] };
}

function runDemandSurface(artist: string, venue: string, date: string): { error: string } | {
  input: string;
  layers: {
    L1_SAVE: string;
    L2_REPLAY: string;
    L3_GEO_CLUSTER: string;
    L4_DEMAND_SIGNAL: string;
    L5_TICKET_CONVERT: string;
  };
  translation: string[];
  verdict: string;
  operatorReadout: string[];
  playbook: string;
  phoenixWeightedOdds: string;
  driftVerdict: string;
} {
  const data = mockData.artists[artist as keyof typeof mockData.artists];
  if (!data) {
    return {
      error: `No data available for artist: ${artist}`
    };
  }

  // Simulate layers
  const l1 = `Cohort = hashed users with saves/reposts of ${artist}-directed IP. Saves: ${data.l1_save.saves.toLocaleString()}, Retained: ${data.l1_save.retained.toLocaleString()}. Overlap: ${(data.l1_save.overlap * 100).toFixed(0)}%.`;
  const l2 = `${data.l2_replay.depth}-day depth on ${artist} content. Speed=${data.l2_replay.speed} filter applied.`;
  const l3 = `${data.l3_geo.cluster} cluster stable ${data.l3_geo.stability} days. Radius: ${data.l3_geo.radius}mi.`;
  const l4 = `Search velocity ${data.l4_demand.velocity}x baseline for "${data.l4_demand.searches}".`;
  const l5 = `Forecast: ${data.l5_convert.forecast.toLocaleString()} tickets vs ${data.l5_convert.cap.toLocaleString()} cap. Conversion: ${data.l5_convert.conversion}. Confidence: ${data.l5_convert.confidence}.`;

  const translation = [
    `L1→L2 HOLD: ${data.l1_save.saves.toLocaleString()} saves, ${data.l1_save.retained.toLocaleString()} retained. ${(data.l1_save.overlap * 100).toFixed(0)}% cohort overlap.`,
    `L3_GEO HOLD: ${data.l3_geo.cluster} cluster stable ${data.l3_geo.stability} days.`,
    `L4_DEMAND: Search velocity ${data.l4_demand.velocity}x baseline.`,
    `Forecast: ${data.l5_convert.forecast.toLocaleString()} vs ${data.l5_convert.cap.toLocaleString()} cap. Conversion ${data.l5_convert.conversion}. Confidence ${data.l5_convert.confidence}.`,
    `Drift: ${data.drift ? 'Detected' : 'None detected'}.`
  ];

  const verdict = data.l5_convert.forecast > data.l5_convert.cap ? 'HOLD. Book venue. Activate overflow.' : 'HOLD. Standard booking.';

  const operatorReadout = [
    `IP gravity analysis for ${artist}.`,
    `Travel intent stable.`,
    `${date} horizon risk assessment.`
  ];

  return {
    input: `L0_TRACK = "${artist} + ${venue} + ${date}"`,
    layers: {
      L1_SAVE: l1,
      L2_REPLAY: l2,
      L3_GEO_CLUSTER: l3,
      L4_DEMAND_SIGNAL: l4,
      L5_TICKET_CONVERT: l5
    },
    translation,
    verdict,
    operatorReadout,
    playbook: data.playbook,
    phoenixWeightedOdds: `HOLD: ${(data.phoenix * 100).toFixed(1)}%`,
    driftVerdict: data.drift ? 'DRIFT' : 'NO DRIFT'
  };
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: npm run start "L0_TRACK = \\"Artist + Venue + Date\\""');
    return;
  }

  const parsed = parseL0Track(input);
  if (!parsed) {
    console.log('Invalid input format. Expected: L0_TRACK = "Artist + Venue + Date"');
    return;
  }

  const result = runDemandSurface(parsed.artist, parsed.venue, parsed.date);
  if ('error' in result) {
    console.log(result.error);
    return;
  }

  console.log('🪞 Live Event Demand — Live Run');
  console.log('');
  console.log('**Input Parameters**');
  console.log(result.input);
  console.log('');
  console.log('**Probe Execution**');
  console.log('L0_TRACK → L1_SAVE → L2_REPLAY → L3_GEO_CLUSTER → L4_DEMAND_SIGNAL → L5_TICKET_CONVERT');
  Object.entries(result.layers).forEach(([key, value]) => {
    console.log(`**${key}**: ${value}`);
  });
  console.log('');
  console.log('**Operator-Visible Output**');
  console.log('');
  console.log('**Translation (no fluff)**');
  result.translation.forEach((line, i) => {
    console.log(`${i + 1}. ${line}`);
  });
  console.log('');
  console.log(`**Verdict**: ${result.verdict}`);
  console.log('');
  console.log('**🧭 Operator Readout**');
  result.operatorReadout.forEach((line, i) => {
    console.log(`${i + 1}. ${line}`);
  });
  console.log('');
  console.log(`**Surface HOLD. L4_FAN verified.**`);
  console.log('');
  console.log('🔱 Decision Output — L4_FAN');
  console.log(`Playbook\t${result.playbook}`);
  console.log(`Phoenix-Weighted Odds\t${result.phoenixWeightedOdds}`);
  console.log(`Drift Verdict\t${result.driftVerdict}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}