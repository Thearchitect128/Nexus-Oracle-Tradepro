export type Edge = {
  to: number;
  rev: number;
  cap: number;
  cost: number;
};

export class MinCostMaxFlow {
  readonly graph: Edge[][];

  constructor(n: number) {
    this.graph = Array.from({ length: n }, () => []);
  }

  addEdge(from: number, to: number, cap: number, cost: number): void {
    const fwd: Edge = { to, rev: this.graph[to].length, cap, cost };
    const rev: Edge = { to: from, rev: this.graph[from].length, cap: 0, cost: -cost };
    this.graph[from].push(fwd);
    this.graph[to].push(rev);
  }

  run(source: number, sink: number): { flow: number; cost: number } {
    const n = this.graph.length;
    let flow = 0;
    let cost = 0;
    const potential = Array(n).fill(0);

    while (true) {
      const dist = Array(n).fill(Number.POSITIVE_INFINITY);
      const prevNode = Array(n).fill(-1);
      const prevEdge = Array(n).fill(-1);
      const used = Array(n).fill(false);

      dist[source] = 0;

      for (let iter = 0; iter < n; iter += 1) {
        let v = -1;
        for (let i = 0; i < n; i += 1) {
          if (!used[i] && (v === -1 || dist[i] < dist[v])) v = i;
        }
        if (v === -1 || dist[v] === Number.POSITIVE_INFINITY) break;
        used[v] = true;

        for (let ei = 0; ei < this.graph[v].length; ei += 1) {
          const e = this.graph[v][ei];
          if (e.cap <= 0) continue;
          const nd = dist[v] + e.cost + potential[v] - potential[e.to];
          if (nd < dist[e.to]) {
            dist[e.to] = nd;
            prevNode[e.to] = v;
            prevEdge[e.to] = ei;
          }
        }
      }

      if (dist[sink] === Number.POSITIVE_INFINITY) break;

      for (let i = 0; i < n; i += 1) {
        if (dist[i] < Number.POSITIVE_INFINITY) potential[i] += dist[i];
      }

      let add = Number.POSITIVE_INFINITY;
      for (let v = sink; v !== source; v = prevNode[v]) {
        const e = this.graph[prevNode[v]][prevEdge[v]];
        add = Math.min(add, e.cap);
      }

      for (let v = sink; v !== source; v = prevNode[v]) {
        const e = this.graph[prevNode[v]][prevEdge[v]];
        e.cap -= add;
        this.graph[v][e.rev].cap += add;
      }

      flow += add;
      cost += add * potential[sink];
    }

    return { flow, cost };
  }
}
