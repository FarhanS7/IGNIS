# Module H — Explore Fire Stories (NEW v1.1)

> **Purpose:** Build the Explore Fire experience — guided stories that make microgravity fire science understandable to students, judges, and the public while preserving source traceability.
>
> **Reference:** PRD v1.1 §11 (Explorer), §16.10 (FRs), §12 (NASA Data) | DECISIONS.md D-015
>
> **This module is entirely new in v1.1.**

---

## Why This Exists

The v1.0 concept was technically strong but risked feeling like a specialist research dashboard. Explore Fire adds a playful, educational entry point that connects back to real NASA evidence.

## P0 Stories (required for MVP)

1. **"Why does fire behave differently in microgravity?"** — Teach the central physical intuition and connect to real experiments.
2. **"Fire from Space vs Fire in Space"** — Use Earthdata to contrast Earth remote sensing with microgravity experiment research. Required for NASA Earthdata integration proof.

## Story Components (PRD v1.1 §11.3)
- 20-60 second reading segments
- Simple animation or interactive diagram
- Real NASA experiment image/video
- Evidence card linking to experiment
- Optional narration/audio (P2)
- Suggested Ask IGNIS question
- Source links

---

## Tasks (7)

| Task | File | Summary |
|:---|:---|:---|
| H.1 | `task-H1-story-index.md` | Story index page (/explore) |
| H.2 | `task-H2-story-player.md` | Story player component (/explore/:slug) |
| H.3 | `task-H3-microgravity-story.md` | P0 story: "Why does fire look different?" |
| H.4 | `task-H4-fire-from-space.md` | P0 story: "Fire from Space vs Fire in Space" |
| H.5 | `task-H5-evidence-card.md` | Evidence card component for stories |
| H.6 | `task-H6-story-api.md` | GET /stories and GET /stories/:slug endpoints |
| H.7 | `task-H7-story-ask-ignis.md` | Story-scoped Ask IGNIS integration |

## Exit Condition (Gate 6)
- [ ] Story index page shows available stories
- [ ] At least one complete story works end-to-end
- [ ] "Fire from Space vs Fire in Space" uses Earthdata context
- [ ] Earthdata content labeled separately from microgravity evidence
- [ ] Evidence cards link to real experiment records
- [ ] Suggested Ask IGNIS questions work in story context
