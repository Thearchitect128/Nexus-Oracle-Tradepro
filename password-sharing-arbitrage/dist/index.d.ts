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
export interface EnforcementAction {
    action: 'allow' | 'challenge' | 'limit' | 'upgrade_required';
    reason: string;
    confidence: number;
}
declare function determineEnforcement(riskScore: number, confidence: number, config: Config): EnforcementAction;
declare function runArbitrageAnalysis(data: InputData, config: Config): {
    platform: string;
    accounts: number;
    active_viewers: number;
    verified_households: number;
    arbitrage: {
        geo_split: {
            count: number;
            accounts: Record<string, {
                rate: number;
                sessions: number;
            }>;
        };
        device_bloom: {
            count: number;
            accounts: Record<string, {
                density: number;
                devices: number;
            }>;
        };
        concurrency_breach: {
            count: number;
            accounts: Record<string, {
                maxConcurrent: number;
                breaches: number;
            }>;
        };
        session_relay: {
            count: number;
            accounts: Record<string, {
                rate: number;
                sessions: number;
            }>;
        };
    };
    unmonetized_households: number;
    revenue_impact: {
        monthly: number;
        annual: number;
    };
    confidence: number;
    state: string;
    surface: string;
    household_gap: number;
    revenue_leakage: string;
    primary_vectors: string[];
    baselines: {
        geoSplit: number;
        deviceDensity: number;
    };
    accountExplanations: {
        accountId: string;
        flags: string[];
        riskScore: number;
        enforcement: EnforcementAction;
        metrics: {
            geoSplitRate: number;
            deviceDensity: number;
            maxConcurrent: number;
            sessionRelayRate: number;
        };
    }[];
};
export { runArbitrageAnalysis, determineEnforcement };
//# sourceMappingURL=index.d.ts.map