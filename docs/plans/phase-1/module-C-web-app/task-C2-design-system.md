# Task C.2 — Design System

> **Module:** C — Web App | **Branch:** `feat/c2-design-system`
> **Blocked by:** C.1 | **References:** PRD v1.1 §17, §13

## Objective
Build the design system with theme tokens, shared components, and evidence hierarchy visual language.

## Key Components
- Color palette: dark space theme with evidence-level colors (A→E gradient)
- Typography: Space Grotesk for headings, Inter for body
- Shared components: Button, Card, Badge, Tooltip, Skeleton, ErrorBoundary
- Evidence hierarchy badges: Level A (strongest green) → Level E (subdued blue)
- `EvidenceBadge` component showing evidence level with appropriate styling
- `ConfidenceBadge` component for High/Medium/Low

## Subtasks
1. Define `@theme` tokens in index.css
2. Create shared component library
3. Create evidence hierarchy components
4. Commit: `feat(web): build design system with evidence hierarchy`
