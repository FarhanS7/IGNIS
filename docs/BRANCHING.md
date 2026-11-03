# Branching Strategy — Fire Response Work

> **Project:** IGNIS — NASA Space Apps Challenge 2026  
> **Target:** Fire Response Console & ML Pipeline Integration

---

## 1. Branch Topology & Responsibilities

- **`main`**: Production release branch. **Main stays releasable at all times.** No direct commits, force-pushes, or rebases.
- **`fix/phase0-integrity`**: Corrections to existing content and audit findings only (e.g., stale LOOCV accuracy metrics, UI terminology alignment, missing root `LICENSE`, etc.).
- **`feature/fire-response-console`**: Primary frontend and integration branch for the Fire Response Console. Implements the `/response` route, interactive sensor simulator, multi-sensor detectors, smoke localizer, emergency action sequencer, and incident management UI.
- **`feature/fire-response-ml`**: Dedicated branch for the Python machine learning pipeline (`scripts/ml`), dataset generation, training/validation scripts, and model artifact exports. Merges into `feature/fire-response-console`.

---

## 2. Merge Policy & Quality Gates

- **Merge by pull request only.**
- Every pull request must pass the following checks before merging into `feature/fire-response-console` or `main`:
  1. `npm test` (all test suites passing, zero failures)
  2. `npm run build` (successful compilation and type-check via `tsc -b && vite build`)
- Integration flow:
  $$\text{feature/fire-response-ml} \xrightarrow{\text{PR}} \text{feature/fire-response-console} \xrightarrow{\text{PR}} \text{main}$$
  $$\text{fix/phase0-integrity} \xrightarrow{\text{PR}} \text{main}$$

---

## 3. Commit Convention

Commit messages must follow the structured scopes below:

- `feat(fire): ...` — New fire response console features, components, or UI capabilities
- `fix(integrity): ...` — Corrections to audit findings, labels, or documentation
- `chore(ml): ...` — ML dependencies, cache rules, or pipeline tooling
- `test(fire): ...` — Unit or integration tests for detectors, localizers, or console logic
- `docs: ...` — Documentation updates and specifications

### Workflow Guidelines:
- Make small, frequent, and atomic commits.
- Do not squash commits locally; preserve development history and provenance.
