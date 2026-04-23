import json
from typing import Any


def load_analysis(path: str = "analysis.json") -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_simulation_paths(simulations: list[dict[str, Any]]) -> list[list[str]]:
    return [
        sim["result"]["state"]["history"]
        for sim in simulations
        if sim["result"]["type"] == "ATTRACTOR"
    ]


def visualize_basin_mapping(nodes: list[dict[str, Any]], edges: list[dict[str, Any]], basins: list[dict[str, Any]]) -> None:
    print(f"nodes={len(nodes)} edges={len(edges)} basins={len(basins)}")


def animate_simulation_paths(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    basins: list[dict[str, Any]],
    simulation_paths: list[list[str]],
) -> None:
    print(f"animating {len(simulation_paths)} attractor paths")


def visualize_full_system(analysis: dict[str, Any]) -> None:
    nodes = analysis["nodes"]
    edges = analysis["edges"]
    basins = analysis["basins"]
    simulations = analysis["simulations"]
    simulation_paths = build_simulation_paths(simulations)
    visualize_basin_mapping(nodes, edges, basins)
    animate_simulation_paths(nodes, edges, basins, simulation_paths)


if __name__ == "__main__":
    analysis_data = load_analysis()
    visualize_full_system(analysis_data)
