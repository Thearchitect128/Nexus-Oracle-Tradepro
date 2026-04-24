const PHI_FACETS = ["Facet-A", "Facet-C"];

function evaluateEnvelope(input) {
  const inPhiAttractor = input.inside && PHI_FACETS.includes(input.classification.facet);
  const irreversible = input.state.mode === "BUILD_COMPRESS" || input.state.mode === "FUSION";

  return {
    W: input.W,
    M_min: input.classification.M_min,
    inside: input.inside,
    margin: input.margin,
    activeFacet: input.classification.facet,
    facetLabel: input.classification.label,
    supportGap: input.gap,
    kinkProximity: input.kink === null ? "Infinity" : Math.abs(input.weights.C_r - input.kink),
    dimension: 2,
    inPhiAttractor,
    attractorId: inPhiAttractor ? "G_phi" : "none",
    lawCompliance: {
      lawId: "phi-A",
      nearRecursion: false,
      irreversible,
      inAttractor: inPhiAttractor
    }
  };
}

function getFormState(form) {
  const data = new FormData(form);
  const kinkValue = data.get("kink");

  return {
    W: Number(data.get("W")),
    inside: form.elements.inside.checked,
    margin: Number(data.get("margin")),
    gap: Number(data.get("gap")),
    kink: kinkValue === "" ? null : Number(kinkValue),
    weights: { C_r: Number(data.get("C_r")) },
    classification: {
      facet: String(data.get("facet")),
      label: String(data.get("label")),
      M_min: Number(data.get("M_min"))
    },
    state: {
      mode: String(data.get("mode"))
    }
  };
}

function renderReport(report) {
  const badgeRow = document.getElementById("badge-row");
  const statsGrid = document.getElementById("stats-grid");

  badgeRow.innerHTML = "";
  statsGrid.innerHTML = "";

  const badges = [
    {
      label: report.inPhiAttractor ? `Attractor ${report.attractorId}` : "Outside attractor",
      className: report.inPhiAttractor ? "badge badge-success" : "badge badge-danger"
    },
    {
      label: `${report.lawCompliance.lawId} active`,
      className: "badge badge-signal"
    },
    {
      label: report.lawCompliance.irreversible ? "Irreversible mode" : "Reversible posture",
      className: report.lawCompliance.irreversible ? "badge badge-success" : "badge"
    },
    {
      label: `Facet ${report.activeFacet}`,
      className: "badge"
    }
  ];

  badges.forEach((item) => {
    const badge = document.createElement("div");
    badge.className = item.className;
    badge.textContent = item.label;
    badgeRow.appendChild(badge);
  });

  const stats = [
    ["Facet label", report.facetLabel],
    ["Margin", report.margin],
    ["Support gap", report.supportGap],
    ["Kink proximity", report.kinkProximity],
    ["W", report.W],
    ["M_min", report.M_min],
    ["Inside envelope", report.inside ? "yes" : "no"],
    ["Near recursion", report.lawCompliance.nearRecursion ? "yes" : "no"]
  ];

  stats.forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    statsGrid.appendChild(stat);
  });
}

function renderMirror(mirror) {
  const summary = document.getElementById("mirror-summary");
  const preview = document.getElementById("mirror-preview");

  const peaks = Array.isArray(mirror.peaks) ? mirror.peaks.length : 0;
  const invariants = Array.isArray(mirror.invariants) ? mirror.invariants.join(", ") : "none";
  const views = Array.isArray(mirror.views) ? mirror.views.map((view) => view.title).join(", ") : "none";

  summary.innerHTML = `
    <div class="stat"><span>Version</span><strong>${mirror.version}</strong></div>
    <div class="stat"><span>Generated</span><strong>${mirror.generated_at || "unknown"}</strong></div>
    <div class="stat"><span>Views</span><strong>${views}</strong></div>
    <div class="stat"><span>Invariants</span><strong>${invariants}</strong></div>
    <div class="stat"><span>Peaks</span><strong>${peaks}</strong></div>
    <div class="stat"><span>Kernel state</span><strong>${mirror.oracle_state?.kernel || "unknown"}</strong></div>
  `;

  preview.textContent = JSON.stringify(mirror, null, 2);
}

async function loadMirror() {
  const preview = document.getElementById("mirror-preview");

  try {
    const response = await fetch("digital-mirror/mirror.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const mirror = await response.json();
    renderMirror(mirror);
  } catch (error) {
    preview.textContent = `Failed to load digital-mirror/mirror.json\n${error.message}`;
  }
}

function setupWorkbench() {
  const form = document.getElementById("envelope-form");

  const update = () => {
    const state = getFormState(form);
    renderReport(evaluateEnvelope(state));
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
}

setupWorkbench();
loadMirror();
