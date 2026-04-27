---
name: multi-agent-conductor
description: Use when the user says 멀티 에이전트, multi-agent, 지휘, 조율, or asks a conductor terminal to coordinate worker terminals, inspect done submissions, handle file claim conflicts, verify builds, and route fixes through npm run multi-agent.
---

# Multi-Agent Conductor

You are the conductor agent, usually `terminal-d`.

## Core Loop

1. Check conductor orders:

```bash
npm run multi-agent -- orders terminal-d
```

2. Acknowledge pending orders:

```bash
npm run multi-agent -- ack terminal-d
```

3. Inspect current state:

```bash
npm run multi-agent -- status
npm run multi-agent -- events 50
git status --short
git diff --name-only
git worktree list
```

4. Review worker boundaries.

Expected pattern:

- `terminal-a`: first assigned feature area
- `terminal-b`: second assigned feature area
- `terminal-c`: third assigned feature area
- `terminal-e`: optional fourth assigned feature area
- `terminal-d`: conductor, integration, verification, packaging

5. If a worker submission is not ready, send a targeted order:

```bash
npm run multi-agent -- order terminal-a "Submission needs follow-up: <specific issue>."
```

6. If state is coherent, run verification:

```bash
npm run multi-agent -- run terminal-d -- npm run build
```

7. Record the result:

```bash
npm run multi-agent -- note terminal-d "Integrated review complete: build passed, no lock conflicts."
```

## Done Submission Handling

When a worker runs `done`, `terminal-d` receives an automatic review order.

For each submission:

- read the order message
- inspect recent events
- inspect changed files in that worker's worktree if applicable
- verify build/test commands
- send a fix order if needed
- report final integration status

Do not package or publish unless the user explicitly approves that step.
