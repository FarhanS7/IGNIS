# Module C — Web App (Frontend) — REWRITTEN for v1.1

> **Purpose:** Build all frontend pages and components for the IGNIS v1.1 experience.
>
> **Reference:** PRD v1.1 §8 (IA), §9 (Journeys), §10 (Build-a-Habitat), §16-17 (FRs/UX)
> **Decisions:** D-001, D-002, D-018

---

## v1.1 Page Structure (React Router)

| Route | Component | v1.0 equivalent |
|:---|:---|:---|
| `/` | Landing (two-mode selection) | Landing (single mode) |
| `/build` | Habitat Builder (destination + controls) | Mission Builder (form only) |
| `/evidence` | Fire Behavior Profile + results | Evidence Results |
| `/experiment/:id` | Experiment Explorer | Same |
| `/explore` | Story index (Explore Fire) | **NEW** |
| `/explore/:slug` | Story player | **NEW** |
| `/ask` | Ask IGNIS standalone | Same |
| `/about` | Method + disclaimers | Same |

---

## Tasks (11)

| Task | File | Summary |
|:---|:---|:---|
| C.1 | `task-C1-scaffold.md` | Scaffold React+Vite+TS+Tailwind v4+Framer Motion+routing |
| C.2 | `task-C2-design-system.md` | Theme tokens, shared components, evidence hierarchy colors |
| C.3 | `task-C3-landing.md` | Two-mode landing: "Build a Habitat" / "Explore Fire" |
| C.4 | `task-C4-habitat-builder.md` | Destination selector + environment/habitat panels + controls |
| C.5 | `task-C5-evidence-results.md` | Fire Behavior Profile + ranked evidence cards + coverage |
| C.6 | `task-C6-why-panel-visualization.md` | Why? panel + evidence-guided habitat visualization (NEW) |
| C.7 | `task-C7-experiment-explorer.md` | Experiment detail page with media, conditions, findings |
| C.8 | `task-C8-ask-ignis.md` | Ask IGNIS chat page |
| C.9 | `task-C9-about.md` | About page with method, source policy, disclaimers |
| C.10 | `task-C10-error-states.md` | Loading skeletons, empty states, error boundaries |
| C.11 | `task-C11-api-client.md` | Typed API client wrapper |

## Exit Condition (Gate 3)
- [ ] User can navigate Landing → Build → Evidence → Experiment
- [ ] Fire Behavior Profile shows evidence dimensions, not risk scores
- [ ] Evidence-guided visualization has persistent non-simulation label
- [ ] Why? panel exposes factor explanations and source links
