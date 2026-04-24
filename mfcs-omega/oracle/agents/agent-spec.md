# Agent Specification

Agents in MFCS-OMEGA may observe, summarize, classify, or recommend. They do
not replace the oracle kernel and they do not bypass the operator.

## Agent Responsibilities

- prepare trace-derived evidence
- classify peaks and facet candidates
- suggest next actions for review
- populate audit-ready summaries for the console or mirror

## Agent Constraints

- agents must not mutate the formal source of truth
- agents must not hide an override
- agents must emit structured audit events for any recommendation
