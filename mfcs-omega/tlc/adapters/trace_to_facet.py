#!/usr/bin/env python3
import json
import sys

def trace_to_facets(trace_path: str):
    # TODO: Implement trace → facet mapping.
    with open(trace_path) as f:
        trace = f.read()
    return {"facets": [], "raw": trace}

if __name__ == "__main__":
    path = sys.argv[1]
    facets = trace_to_facets(path)
    print(json.dumps(facets, indent=2))
