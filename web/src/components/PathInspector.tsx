/**
 * PathInspector.tsx
 *
 * React/TypeScript UI component to render canonical Chapter10 path metadata.
 * Assumes the viz will dispatch `new CustomEvent('path:select', {detail:{pathId}})`
 * or call <PathInspector pathId={...} /> directly.
 */

import React, { useEffect, useState } from "react";

type Thresholds = Record<string, number | string>;
type Verification = { protocol?: string; challenge?: string; falsify_criteria?: string };
type Device = { type?: string; model?: string; specs?: Record<string, any> };

type PathEntry = {
  pathId: number;
  guardian?: string;
  channel?: string;
  hexagrams?: string[];
  notes?: string;
  device?: Device;
  thresholds?: Thresholds;
  verification?: Verification;
};

export default function PathInspector({ pathIdProp }: { pathIdProp?: number }) {
  const [chapter, setChapter] = useState<any | null>(null);
  const [entry, setEntry] = useState<PathEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/artifacts/chapter10.canonical.json");
        const data = await res.json();
        setChapter(data);
      } catch (e) {
        try {
          const res2 = await fetch("/Chapter10_96Path_Extended_Channel_Map.txt");
          const txt = await res2.text();
          setChapter({ raw: txt });
        } catch (er) {
          setChapter(null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();

    const handler = (ev: any) => {
      const id = ev?.detail?.pathId;
      if (typeof id === "number") {
        selectPath(id);
      }
    };
    window.addEventListener("path:select", handler as EventListener);
    return () => window.removeEventListener("path:select", handler as EventListener);
  }, []);

  useEffect(() => {
    if (typeof pathIdProp === "number") {
      selectPath(pathIdProp);
    }
  }, [pathIdProp, chapter]);

  function selectPath(id: number) {
    if (!chapter) {
      setEntry(null);
      return;
    }
    for (const g of chapter.guardians || []) {
      const found = (g.paths || []).find((p: any) => p.pathId === id);
      if (found) {
        setEntry(found);
        return;
      }
    }
    setEntry({ pathId: id, notes: "Path not found in canonical map" });
  }

  if (loading) return <div className="inspector">Loading path data…</div>;
  if (!entry) return <div className="inspector">Select a path to inspect</div>;

  return (
    <div className="inspector p-4 bg-white dark:bg-gray-900 rounded shadow">
      <h3 className="text-lg font-semibold">Path {entry.pathId} — {entry.guardian ?? entry.channel}</h3>
      <p className="text-sm text-gray-600 my-2">{entry.notes}</p>

      <section className="my-2">
        <h4 className="text-sm font-medium">Channel</h4>
        <div>{entry.channel ?? "—"}</div>
      </section>

      <section className="my-2">
        <h4 className="text-sm font-medium">Hexagrams</h4>
        <div>{(entry.hexagrams || []).join(", ") || "—"}</div>
      </section>

      <section className="my-2">
        <h4 className="text-sm font-medium">Device</h4>
        <div>{entry.device?.type ?? "—"} {entry.device?.model ? `• ${entry.device.model}` : ""}</div>
        {entry.device?.specs && <pre className="text-xs bg-gray-100 p-2 rounded mt-2">{JSON.stringify(entry.device.specs, null, 2)}</pre>}
      </section>

      <section className="my-2">
        <h4 className="text-sm font-medium">Thresholds</h4>
        <div>{entry.thresholds ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(entry.thresholds, null, 2)}</pre> : "—"}</div>
      </section>

      <section className="my-2">
        <h4 className="text-sm font-medium">Verification</h4>
        <div>{entry.verification ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(entry.verification, null, 2)}</pre> : "—"}</div>
      </section>

      <div className="flex gap-2 mt-3">
        <a href="/docs/chapter11-adversarial-lattice.md" className="px-3 py-2 bg-red-600 text-white rounded text-xs">Red-Team Notes</a>
        <a href="/docs/chapter11-operational-playbook.md" className="px-3 py-2 bg-blue-600 text-white rounded text-xs">Hardware BOM & Playbook</a>
        <button
          onClick={() => exportProof(entry)}
          className="px-3 py-2 bg-green-600 text-white rounded text-xs"
        >
          Export Proof
        </button>
      </div>
    </div>
  );

  function exportProof(e: PathEntry | null) {
    if (!e) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      path: e
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `path-${e.pathId}-proof.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
