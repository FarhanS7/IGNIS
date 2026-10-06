# Phase 0.5 — Git Repository & Branch Setup

> **Run once per project. Universal setup.**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase 0.5

---

## AI IDE Command

```
Set up the Git repository and branch structure for the IGNIS project at e:/IGNIS.

BRANCH STRUCTURE:
- main        → production only. Direct commits are never allowed.
- dev         → integration branch. All feature branches merge here first.
- feature/[module-name]/[task-name] → one branch per task
- hotfix/[description]              → emergency fixes from main, merged to both main and dev

SETUP COMMANDS TO RUN:
git init
git checkout -b main
# Create initial commit with existing project files
git add .
git commit -m "chore(init): initial project structure with PRD and planning docs"
git checkout -b dev

COMMIT MESSAGE CONVENTION (enforce on every commit):
Format: type(scope): short description

Types:
- feat     → new feature or subtask implementation
- fix      → bug fix (including fixes from AI review)
- test     → adding or updating tests
- refactor → code change with no behavior change
- docs     → documentation only
- chore    → setup, config, tooling

Scope: module name in kebab-case
  Modules: data-foundation, eligibility-filter, matching-engine, web-app,
           ask-ignis, flame-vision, landing-demo, knowledge-graph,
           explore-fire, nasa-sources, behavior

Examples:
- feat(data-foundation): add experiment Pydantic models
- feat(eligibility-filter): implement fuel compatibility check
- feat(behavior): implement Fire Behavior Profile aggregation
- test(matching-engine): add edge case for all-null factors
- fix(web-app): handle empty evidence results state
- feat(explore-fire): create microgravity fire story
- feat(nasa-sources): register NASA Open Data source
- docs(architecture): add REVIEW_CONTEXT.md for matching module
- chore(env): add docker-compose and env contract

WHEN TO COMMIT (non-negotiable):
- After every subtask in Phase 2 → one commit per subtask
- After every fix from Phase 2.5 review → one commit per fix
- Never bundle multiple subtasks into one commit
- Never commit broken or untested code

BRANCH LIFECYCLE:
1. Before starting a task:
   git checkout dev && git checkout -b feature/[module]/[task]
2. After task passes Phase 2.5 review and Phase 3 walkthrough:
   Merge feature branch → dev
3. Delete the feature branch after merge
4. dev → main only at Phase 4 deployment

Also create: e:/IGNIS/CONTRIBUTING.md with the above conventions documented.
Also create: e:/IGNIS/.gitignore with entries for:
  - node_modules/
  - dist/
  - .venv/
  - __pycache__/
  - *.pyc
  - .env
  - .env.local
  - .DS_Store
  - *.log
  - data/processed/  (large generated files)
```

---

## Exit Condition

Phase 0.5 is complete when:
- [ ] Git repo initialized with `main` and `dev` branches
- [ ] Initial commit on `main` with existing project files
- [ ] `dev` branch exists and is checked out
- [ ] `CONTRIBUTING.md` documents commit convention and branch lifecycle
- [ ] `.gitignore` covers all generated/secret files
