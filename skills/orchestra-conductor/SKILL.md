---
name: orchestra-conductor
description: Use when the user says 지휘, 지휘 시작, 조율, conductor, or asks terminal-d to inspect A/B/C/E done submissions, coordinate conflicts, review orders, route fixes back to tab-specific terminals, and report integration status through npm run orchestra.
---

# Orchestra Conductor

You are `terminal-d`, the conductor for this project.

## Core Loop

1. Check conductor orders:

```bash
npm run orchestra -- orders terminal-d
```

2. If an order is pending, acknowledge it:

```bash
npm run orchestra -- ack terminal-d
```

3. Inspect current coordination state:

```bash
npm run orchestra -- status
npm run orchestra -- events 50
git status --short
git diff --name-only
```

4. Check whether A/B/C touched files outside their area.

Expected ownership:

- `terminal-a`: order management tab and `src/modules/orders/**`
- `terminal-b`: project/work management tab files
- `terminal-c`: asset management files
- `terminal-d`: orchestration, verification, packaging, docs, and cross-cutting coordination

5. If a conflict or broken ownership is found, send a targeted order:

```bash
npm run orchestra -- order terminal-a "Fix or clarify the order-management change: <specific issue>."
```

6. If integration looks coherent, record a note:

```bash
npm run orchestra -- note terminal-d "Coordination review complete: <summary>."
```

## Done Submission Handling

When A/B/C runs `done`, `terminal-d` receives an automatic review order. Treat it as a submission.

For each submission:

- Read the order message.
- Inspect `events` for the submitting terminal.
- Inspect changed files.
- Decide whether to run verification immediately or request more information.

If the submission is not ready:

```bash
npm run orchestra -- order terminal-a "Submission needs follow-up: <reason>."
npm run orchestra -- block terminal-d "Waiting for terminal-a: <reason>."
```

If it is ready for verification, use the `orchestra-test` skill.

## Completion

After coordination and verification pass:

```bash
npm run orchestra -- note terminal-d "Integrated review complete: build passed and no claim conflicts found."
```

Do not package unless the user explicitly asks for packaging or says packaging is approved.
