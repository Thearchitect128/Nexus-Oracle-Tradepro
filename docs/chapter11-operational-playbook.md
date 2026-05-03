# Chapter 11 — Operational Playbook (Hardware, Procurement, Lab Build, Regulatory)

Status: CANONICAL v1.0

Overview
--------
This playbook converts the protocol into an operational lab and procurement roadmap 2027–2030.
It is purposefully deterministic: BOM items, vendor alternatives, expected lead times,
lab footprint, safety/regulatory checkpoints.

Phases
------
Phase A — Design & Compliance (Q1–Q4 2027)
- Deliverables: final BOM, regulatory plan, risk assessment, insurance quotes.
- Activities: map each path to required sensor/actuator, produce electrical/mechanical drawings,
  route supply chain for critical long-lead items.

Phase B — Prototyping Lab (Q1–Q4 2028)
- Deliverables: bench prototypes for each channel class, signed acceptance tests.
- Activities: build shielded rooms, optical labs, quantum bench (if relevant), mycology containment.

Phase C — Integration & Harden (2029)
- Deliverables: integrated suite, continuous verification harness, formal SOPs.
- Activities: integrate acquisition network, HSM attestation, policy & training.

Phase D — Operational Certification (2030)
- Deliverables: audited lab, external verification toolkit, published canonical proofs.
- Activities: third-party audit, safety certs, release of sealed artifacts.

Representative BOM (per channel)
-------------------------------
Temporal Bleed (TB)
- Primary: OCXO timebase (shortlist: Microsemi/SiTime), GNSS disciplined receiver (u-blox F9 family)
- Acquisition: FPGA board (Xilinx/Alveo or Intel Stratix for deterministic timestamp), signed timestamp module
- Test gear: 10 MHz rubidium reference (if budget), USB/GPIB DAQ for cross-checks

Quantum Path Correlation (QPC)
- Primary: supplier depends on chosen platform (solid-state NV systems / superconducting)
- NV option: compact NV opto-module, green pump laser, SPAD arrays
- Cryo option: dilution fridge + qubit control stack (very high cost)
- Attestation: quantum challenge-response hardware, signed measurement log

Biofield Modulation (BFM)
- Optical detectors: low-noise SPAD detectors (630 nm), spectrometers, optical filters, integrating sphere
- Biopotential: high CMRR differential amplifiers, active shielding, Faraday cage
- Environmental: light-tight enclosures, temperature control, contamination controls

Mycelial Bridge (MB)
- Lab: biosafety level appropriate to work (BSL-1 or BSL-2 for certain fungi)
- Supplies: incubators, sterile hoods, metabolome LC-MS access (outsourced if needed)
- Controls: environmental logging (temp, humidity, CO₂, air exchange)

Direct Neural Coupling (DNC)
- Primary: MEG/EEG/OPM arrays (OPM being compact), synchronized acquisition, low-latency networks
- Safety: medical oversight, IRB approvals where human data are involved
- Attestation: HSM for signing acquisition records; chain-of-custody for participant data

Vendor & Procurement Strategy
-----------------------------
- Always maintain at least 2 vetted suppliers per critical item.
- For long-lead items (cryogenics, custom optics), place N+1 orders and schedule overlapping delivery windows.
- Compliance: vendor contracts must include export control declarations and traceability for sensitive quantum hardware.

Regulatory & Ethics Checklist
-----------------------------
- Human subjects: IRB approval before any live tests involving humans.
- Biological: institutional biosafety committee (IBC) approvals for mycology work.
- Export Control: classify hardware and tech; consult counsel for EAR/ITAR.
- Data privacy: plan for pseudonymization, encrypted at-rest storage, and retention policy.

Lab Layout & Security
---------------------
- Segregated zones: dirty (assembly), clean (sensitive acquisition), secure (HSM & identity).
- Physical security: keyed access, per-zone logging, tamper-evident seals.
- Network: air-gapped acquisition VLAN, gateway for signed artifact export only.

Budget & Timeline (summary)
---------------------------
- Phase A: $150–250k (design, compliance)
- Phase B: $500–900k (bench prototypes)
- Phase C: $1.5–3M (integration & certification)
- Phase D: $500k–1M (audit, publication)

Risk Registry (examples)
------------------------
- Single-supplier risk for quantum optics → Mitigation: alternate design with NV & cryo options.
- Human safety / ethics risk → Mitigation: pre-IRB mock tests, no live human tests without approvals.
- Supply chain delays → Mitigation: order critical components early; identify local rebuild options.

Appendices
- Shipment checklist
- Template SOW for lab testing
- Template IRB info sheet
