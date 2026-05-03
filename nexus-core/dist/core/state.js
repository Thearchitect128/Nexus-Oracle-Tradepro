export function createInitialState() {
    return {
        id: "core-001",
        identity: "data_dominant",
        energy: 1.0,
        coherence: 0.8,
        recursionDepth: 0,
        mode: "active",
        tick: 0
    };
}
export function createPaths() {
    const raw = Array.from({ length: 96 }, (_, i) => ({
        id: i + 1,
        weight: 1,
        state: i < 52 ? "open" : "dormant"
    }));
    const total = raw.reduce((sum, p) => sum + p.weight, 0);
    return raw.map((p) => ({
        ...p,
        weight: p.weight / total
    }));
}