# Orchestra Coordination

This project has a lightweight local coordination layer for four terminal windows.
It stores shared state under `.orchestra/`, which is ignored by git.

## Setup

Initialize the default four windows:

```bash
npm run orchestra -- init
```

Default agents:

- `terminal-a`: backend
- `terminal-b`: frontend
- `terminal-c`: test
- `terminal-d`: ops
- `terminal-e`: customers

0.3.1 이후 작업은 전용 Git worktree에서 진행한다. `terminal-d`는 메인 프로젝트 폴더에서 지휘/검증/패키징만 담당한다.

| Terminal | Area | Worktree |
| --- | --- | --- |
| `terminal-a` | 주문관리 | `/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-a` |
| `terminal-b` | 공사관리 | `/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-b` |
| `terminal-c` | 자산관리 | `/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-c` |
| `terminal-e` | 고객관리 | `/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-e` |

## Basic Commands

Check the shared state:

```bash
npm run orchestra -- status
```

Set the current terminal window title:

```bash
npm run orchestra -- title terminal-a
```

Run this once in each terminal window with its own agent name.

Start a task:

```bash
npm run orchestra -- start terminal-a "auth API update"
```

Claim files before editing:

```bash
npm run orchestra -- claim terminal-a "src/modules/auth/**"
```

Add a note:

```bash
npm run orchestra -- note terminal-a "login flow changed"
```

Mark a task as blocked:

```bash
npm run orchestra -- block terminal-a "waiting for database migration"
```

Finish and release file claims:

```bash
npm run orchestra -- done terminal-a "auth API complete"
```

When `terminal-a`, `terminal-b`, or `terminal-c` runs `done`, the conductor window receives an automatic review order.
`terminal-d` should then run:

```bash
npm run orchestra -- orders terminal-d
npm run orchestra -- ack terminal-d
npm run orchestra -- status
npm run orchestra -- events 30
npm run orchestra -- run terminal-d -- npm run build
```

View recent events:

```bash
npm run orchestra -- events 30
```

Open the visual conductor dashboard:

```bash
npm run orchestra -- dashboard
```

Then open:

```text
http://127.0.0.1:4177
```

Use a custom port if needed:

```bash
npm run orchestra -- dashboard 4188
```

Send an order from the conductor:

```bash
npm run orchestra -- order terminal-b "Claim client/** and fix the invoice UI."
```

Send the same order to all terminals:

```bash
npm run orchestra -- order all "Check your order, ack it, and report blockers."
```

Read orders:

```bash
npm run orchestra -- orders
npm run orchestra -- orders terminal-b
```

Acknowledge an order:

```bash
npm run orchestra -- ack terminal-b
```

Run a command while recording start and finish events:

```bash
npm run orchestra -- run terminal-c -- npm run build
```

## Conductor Routine

Before coordinating or editing, check:

```bash
npm run orchestra -- status
git status --short
git diff --name-only
```

Use claims to avoid overlapping edits. If two terminals need the same files, the conductor should split the task or make one terminal wait.

Each terminal should periodically run:

```bash
npm run orchestra -- orders terminal-a
npm run orchestra -- ack terminal-a
npm run orchestra -- title terminal-a
npm run orchestra -- status
```

Worker terminal startup checklist:

```bash
cd "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-a"
npm run orchestra -- orders terminal-a
npm run orchestra -- ack terminal-a
npm run orchestra -- title terminal-a
git status --short
npm run build
```

After verification:

```bash
npm run orchestra -- done terminal-a "worktree 전환 완료, build 통과"
```

Replace `terminal-a` and the path with the terminal's assigned worktree.
