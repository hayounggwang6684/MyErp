---
name: orchestra-order-check
description: Use when the user says 오더 확인, 주문 확인, orders 확인, check orders, or asks a terminal-a/b/c/d/e worker to read and act on its orchestra order. The terminal checks its own pending order, acknowledges it, follows the instruction, and records progress through npm run orchestra.
---

# Orchestra Order Check

Use this in any project terminal when the user says `오더 확인`.

## Identify This Terminal

Use the terminal identity already given in the conversation, such as `terminal-a`, `terminal-b`, `terminal-c`, `terminal-d`, or `terminal-e`.

If the identity is not clear, ask the user for the terminal name before running commands.

## Required Flow

1. Check this terminal's order:

```bash
npm run orchestra -- orders <terminal-name>
```

2. If the order is pending, acknowledge it:

```bash
npm run orchestra -- ack <terminal-name>
```

3. Inspect coordination state before acting:

```bash
npm run orchestra -- status
npm run orchestra -- events 30
```

4. Follow the order exactly.

- If file edits are needed, claim the files first.
- Stay inside the terminal's ownership area unless the order explicitly allows a shared file.
- If a shared file is required and not already authorized, ask terminal-d with `order` or record a `block`.
- If the order is only cleanup/acknowledgement, record a `note` after ack.

5. Verify according to the order.

- For renderer changes, run `node --check` on the edited renderer file when applicable.
- For integrated project verification from terminal-d, run:

```bash
npm run orchestra -- run terminal-d -- npm run build
```

- For worker terminal changes, run the specific check requested in the order, usually `npm run build`.

6. Report the result.

```bash
npm run orchestra -- note <terminal-name> "<short progress or verification summary>"
npm run orchestra -- done <terminal-name> "<completion summary>"
```

If blocked:

```bash
npm run orchestra -- block <terminal-name> "<blocker and what is needed>"
```

## Terminal Ownership Guide

- `terminal-a`: order management tab and `src/modules/orders/**`
- `terminal-b`: project/work management tab files
- `terminal-c`: asset management files
- `terminal-d`: orchestration, verification, packaging, docs, and cross-cutting coordination
- `terminal-e`: customer management files

## Response Style

When done, briefly tell the user:

- whether an order was found
- whether it was acknowledged
- what action was taken
- verification result or blocker
