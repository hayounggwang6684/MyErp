---
name: orchestra-packaging
description: Use when the user says 패키징, 패키지, 배포 패키징, packaging, or explicitly approves packaging the ERP app after orchestration and verification have passed. Runs package commands through npm run orchestra and records artifacts/status.
---

# Orchestra Packaging

Use only after the user explicitly approves packaging or says to proceed with packaging.

## Preflight

Before packaging:

```bash
npm run orchestra -- status
npm run orchestra -- events 30
npm run orchestra -- run terminal-d -- npm run build
```

Do not package if:

- A/B/C has a pending `done` review order.
- Any terminal is `blocked`.
- `npm run build` fails.
- There is an unresolved claim conflict.

## Package Commands

For local mac packaging, prefer:

```bash
npm run orchestra -- run terminal-d -- npm run client:dist:mac:local
```

For regular mac packaging when explicitly requested:

```bash
npm run orchestra -- run terminal-d -- npm run client:dist:mac
```

For release publishing, require explicit user confirmation:

```bash
npm run orchestra -- run terminal-d -- npm run client:release:mac
```

## After Packaging

Inspect output:

```bash
ls -la release
```

Record result:

```bash
npm run orchestra -- note terminal-d "Packaging complete: <artifact summary>."
```

If packaging fails:

```bash
npm run orchestra -- block terminal-d "Packaging failed: <short reason>."
```
