# Phase -1 — PRD Sanity Check

> **Run once. Before any architecture work begins. Never skip.**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase -1
> **Updated for v1.1 PRD and Project Concept.**

---

## AI IDE Command

```
You are doing a PRD Sanity Check for the IGNIS project before any architecture work begins.

Read the following files:
- e:/IGNIS/IGNIS_PRD_v1.1.md (full product requirements — v1.1)
- e:/IGNIS/IGNIS_Project_Concept_v1.1.md (vision and concept — v1.1)
- e:/IGNIS/docs/plans/DECISIONS.md (locked architectural decisions — D-001 through D-019)

Then produce the following three sections:

1. AMBIGUITY & GAP SCAN
   - List every underspecified behavior (features named but edge cases missing)
   - List every contradiction (two sections implying incompatible things)
   - List every missing non-functional requirement (scale, latency, user count)
   - Format each as a numbered question, not a guess. Do not silently assume answers.
   
   Pay special attention to:
   - PRD v1.1 §35 lists 11 open questions. Surface each one verbatim.
   - The PRD says Next.js but DECISIONS.md locks React+Vite. Flag any PRD sections that assume SSR or server components.
   - PRD v1.1 §14 eligibility filter: what exact rules are hard blockers vs warnings?
   - PRD v1.1 §15 matching: what tolerance ranges for oxygen, pressure, airflow?
   - PRD v1.1 §10.4 Fire Behavior Profile: what minimum coverage/confidence suppresses a behavior label?
   - PRD v1.1 §20 CV spec: which specific NASA video is being used?
   - PRD v1.1 §18 data model: embedding dimension must match text-embedding-004 (768).
   - PRD v1.1 §12.3 Earthdata: which exact product/layer will be used?
   - PRD v1.1 §21.3 /experiments/{experimentId}/related — what defines "related"?
   - PRD v1.1 §11.2 Stories: are story sections stored in JSONB or separate table?

2. SCOPE LINE (v1 vs later)
   - Define exactly what is IN scope for v1 (hackathon MVP — 48 hours, solo developer):
     All P0 requirements including Build-a-Habitat, Explore Fire, eligibility filter,
     Fire Behavior Profile, NASA source registry, at least 2 stories
   - Define what is EXPLICITLY DEFERRED:
     All P2 requirements, knowledge graph (Module G), experiment comparison matrix,
     shareable reports, natural-language scenario construction, user auth, audio narration
   - P1 requirements: classify each as "include if time" or "defer to post-hackathon"
   - One sentence explaining why this line was drawn

3. RISKIEST ASSUMPTION
   - Name the single assumption most likely to be wrong and most expensive if it is
   - Likely candidates:
     a) "Curated NASA experiment metadata will have consistent, comparable fields across experiment families"
     b) "One NASA experiment video can be reliably flame-segmented with classical CV"
     c) "30+ experiment records can be normalized to the schema in the time budget"
     d) "Earthdata integration can be completed without specialized credentials or data pipeline" (NEW v1.1)
     e) "Fire Behavior Profile aggregation rules can be defined without domain expert review" (NEW v1.1)
   - State what in Phase 0 would need to change if this assumption breaks

Output format:
- Numbered list of open questions (aim for 20-30 questions given v1.1 scope increase)
- A scope table with three columns: Feature | Status (IN / P1-IF-TIME / DEFERRED) | Reason
- One named risk with its mitigation strategy

Save the output to: e:/IGNIS/docs/plans/phase-neg1/PRD-SANITY-CHECK.md

Do not proceed to Phase 0 until the developer has reviewed and either answered or explicitly deferred each question.
```

---

## Expected Output

A markdown file containing:

1. **20-30 numbered open questions** covering gaps, contradictions, and underspecified behaviors
2. **Scope table** with every feature classified as IN / P1-IF-TIME / DEFERRED
3. **One named risk** with Phase 0 mitigation

## PRD v1.1 §35 Open Questions (Surface These Verbatim)

These 11 questions from the PRD v1.1 must appear in the gap scan:

1. Which exact combustion experiment families have the cleanest metadata for the normalized schema?
2. Which single video is best for robust flame segmentation?
3. Which Earthdata product/layer will be used for the required fire-from-space educational comparison?
4. Which NASA API will provide the most useful visible enrichment for the demo?
5. Which NASA Open Data record(s) will anchor dataset provenance?
6. Which fields are consistently available across selected experiments?
7. What exact eligibility rules should be hard blockers vs warnings?
8. What tolerance ranges should be used for oxygen, pressure, and airflow similarity?
9. What minimum coverage/confidence suppresses a behavior label?
10. Which destination preset will be the canonical demo? Recommended: orbital/deep-space microgravity.
11. What exact scientific statements will be used in the demo, and have they been manually verified against source evidence?

---

## Exit Condition

Phase -1 is complete when:
- [ ] All questions are answered OR explicitly marked "defer — will resolve during [specific module/task]"
- [ ] Scope table is approved by the developer
- [ ] Riskiest assumption is acknowledged and mitigation is noted in DECISIONS.md
