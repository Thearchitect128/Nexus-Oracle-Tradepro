function interpret(input) {
    return input.value;
}
function actOnData(signalStrength) {
    if (signalStrength >= 0.75) {
        return { action: "advance", rationale: "high signal", confidence: 0.9 };
    }
    if (signalStrength >= 0.45) {
        return { action: "hold", rationale: "moderate signal", confidence: 0.7 };
    }
    return { action: "reject", rationale: "weak signal", confidence: 0.8 };
}
function reactEmotionally(signalStrength) {
    if (signalStrength >= 0.5) {
        return {
            action: "advance",
            rationale: "reactive escalation",
            confidence: 0.5
        };
    }
    return {
        action: "hold",
        rationale: "uncertain reactive state",
        confidence: 0.4
    };
}
export function decide(input, state) {
    const interpreted = interpret(input);
    return state.identity === "data_dominant"
        ? actOnData(interpreted)
        : reactEmotionally(interpreted);
}