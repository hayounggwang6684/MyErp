---
name: orchestra-test
description: Use when the user says 테스트, 검증, 빌드 검증, test, or asks terminal-d to verify the integrated ERP project after A/B/C/E submissions: run build checks through npm run orchestra, summarize changes and manual test items, open the real app window for user review when the user says 테스트, inspect failures, record results, and route failures back to the right terminal.
---

# Orchestra Test

You are verifying the integrated state from `terminal-d`.

## Required Checks

Run the TypeScript build through orchestra so the result is logged:

```bash
npm run orchestra -- run terminal-d -- npm run build
```

Before opening the app for user review, summarize what changed and list what the user should manually test.

Use the current coordination and diff context:

```bash
npm run orchestra -- status
npm run orchestra -- events 30
git diff --name-only
```

Then tell the user:

- **변경사항**: 2-5 concise bullets grouped by feature/tab, based on recent done messages and changed files.
- **직접 테스트할 내용**: concrete user-facing checks, such as which tab to open, what button/filter/search to try, what result should be visible, and any regression area to glance at.

Keep this list practical. Do not include implementation-only details unless they affect what the user should verify.

When the user specifically says `테스트` or asks to test the app, also open the real app window for user review after the build passes:

```bash
npm run orchestra -- run terminal-d -- npm run client:start
```

Keep the app process running and tell the user the window is ready for review together with the manual test checklist. Do not send the final answer until the user has inspected the actual app window and gives a result, unless the app fails to start. If the user reports a problem, record it with `note` or `block`, then route the fix to the owner with `order`.

If the build passes:

```bash
npm run orchestra -- note terminal-d "Verification passed: npm run build completed successfully."
```

If the build fails:

1. Read the failure output.
2. Identify the likely owner by file path:

- `client/renderer/app-order*` or `src/modules/orders/**`: `terminal-a`
- `client/renderer/app-project*`: `terminal-b`
- `src/modules/assets/**`: `terminal-c`
- shared files such as `client/renderer/app.js`, `styles.css`, `routes.ts`: conductor decides the owner

3. Mark D blocked and route the fix:

```bash
npm run orchestra -- block terminal-d "Verification failed: <short reason>."
npm run orchestra -- order terminal-a "Build failed in your area: <specific error>. Fix and submit done again."
```

## Optional Smoke Checks

Run app/server smoke checks when the user asks, says `테스트`, or the failure risk is high.

Use logged commands:

```bash
npm run orchestra -- run terminal-d -- npm run start
```

Stop long-running processes before final reporting.

## Completion

End with a concise status note:

```bash
npm run orchestra -- note terminal-d "Test review complete: <passed/failed summary>. Manual checks requested: <short checklist summary>."
```
