# Contributing to IGNIS

> **Engineering Standards, Branch Lifecycle & Commit Conventions**  
> Reference: `docs/plans/phase-0.5/GIT-SETUP.md` & `PRD_TO_TASKS_FRAMEWORK.md`

---

## 1. Branch Strategy

- **`main`**: Production only. Direct commits are never allowed.
- **`dev`**: Integration branch. All feature branches merge here first.
- **`feature/[module]/[task]`**: One branch per task (e.g. `feature/data-foundation/a1-enums-taxonomies` or `feat/a1-enums-taxonomies`).
- **`hotfix/[description]`**: Emergency fixes from `main`, merged into both `main` and `dev`.

### Branch Lifecycle
1. Before starting a task:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/[module]/[task]
   ```
2. Implement subtasks incrementally with atomic commits and passing tests.
3. Review and verify functionality against acceptance criteria.
4. Merge feature branch into `dev`.
5. Release `dev` to `main` at release milestones (Phase 4).

---

## 2. Commit Message Convention

Format: `type(scope): short description`

### Types:
- `feat`: New feature or subtask implementation
- `fix`: Bug fix (including fixes from review)
- `test`: Adding or updating tests
- `refactor`: Code change with no behavior change
- `docs`: Documentation only
- `chore`: Setup, configuration, tooling

### Scopes:
Use module names in kebab-case:
`data-foundation`, `eligibility-filter`, `matching-engine`, `web-app`, `ask-ignis`, `flame-vision`, `landing-demo`, `knowledge-graph`, `explore-fire`, `nasa-sources`, `behavior`, `env`, `ci`, `architecture`

### Examples:
- `feat(data-foundation): add experiment Pydantic models`
- `feat(eligibility-filter): implement fuel compatibility check`
- `feat(behavior): implement Fire Behavior Profile aggregation`
- `test(matching-engine): add edge case for all-null factors`
- `fix(web-app): handle empty evidence results state`
- `chore(init): initial project structure with PRD and planning docs`

---

## 3. When to Commit

- After every discrete subtask.
- Never bundle multiple subtasks into one commit.
- Never commit broken or untested code.
