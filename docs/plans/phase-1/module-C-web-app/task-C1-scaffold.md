# Task C.1 — Scaffold React+Vite App

> **Module:** C — Web App | **Branch:** `feat/c1-scaffold`
> **Blocked by:** Nothing | **References:** DECISIONS.md D-001, D-002, D-018

## Objective
Scaffold the frontend app with React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + React Router v7 + Framer Motion.

## Commands
`bash
cd apps/web
npx -y create-vite@latest ./ --template react-ts
npm install react-router tailwindcss @tailwindcss/vite recharts lucide-react framer-motion
npm install -D @types/react @types/react-dom
`

## Routes to Configure
`/` → Landing | `/build` → HabitatBuilder | `/evidence` → EvidenceResults | `/experiment/:id` → ExperimentExplorer | `/explore` → StoryIndex | `/explore/:slug` → StoryPlayer | `/ask` → AskIgnis | `/about` → About

## Subtasks
1. Run create-vite, install deps
2. Configure Tailwind v4 via Vite plugin
3. Set up React Router with all v1.1 routes
4. Configure Framer Motion AnimatePresence for page transitions
5. Commit: `feat(web): scaffold React+Vite app with v1.1 routing`
