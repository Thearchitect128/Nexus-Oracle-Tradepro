export function selectPath(paths, decision) {
    const eligible = paths.filter((p) => p.state === "open");
    if (eligible.length === 0)
        return undefined;
    const ranked = [...eligible].sort((a, b) => b.weight - a.weight);
    if (decision.action === "reject") {
        return ranked[ranked.length - 1];
    }
    return ranked[0];
}