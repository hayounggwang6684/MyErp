# Orchestra Worktree Coordination

Orchestra is a lightweight local coordination layer for running several Codex terminal windows against one project.

It provides:

- shared local state under `.orchestra/`
- agent registration and status
- file claim locks to reduce edit conflicts
- conductor orders and done submissions
- event logs
- a local visual dashboard
- optional Git worktree based isolation

## Files To Copy To Another Project

Copy these files into the target project:

```text
scripts/orchestra.js
skills/orchestra-conductor/SKILL.md
skills/orchestra-order-check/SKILL.md
skills/orchestra-packaging/SKILL.md
skills/orchestra-test/SKILL.md
docs/multi-agent.md
```

Then add this script to the target project's `package.json`:

```json
{
  "scripts": {
    "orchestra": "node scripts/orchestra.js"
  }
}
```

Add these entries to `.gitignore`:

```text
.orchestra
.orchestra/
```

## Basic Setup

Initialize the default agents:

```bash
npm run orchestra -- init
```

Default agents:

- `terminal-a`: orders
- `terminal-b`: projects
- `terminal-c`: assets
- `terminal-d`: conductor, verification, packaging
- `terminal-e`: customers

## Core Commands

Check state:

```bash
npm run orchestra -- status
```

Open dashboard:

```bash
npm run orchestra -- dashboard 4177
```

Send an order:

```bash
npm run orchestra -- order terminal-a "Update the order tab. Claim files before editing."
```

Check and acknowledge orders:

```bash
npm run orchestra -- orders terminal-a
npm run orchestra -- ack terminal-a
```

Claim files:

```bash
npm run orchestra -- claim terminal-a "src/modules/orders/**" "client/renderer/app-order*.js"
```

Finish work:

```bash
npm run orchestra -- done terminal-a "Order tab update complete, build passed"
```

When a worker runs `done`, the conductor receives an automatic review order.

Run commands with event logging:

```bash
npm run orchestra -- run terminal-d -- npm run build
```

## Recommended Worktree Structure

Keep the main project folder for the conductor and integration. Create separate worktrees for workers:

```bash
mkdir -p "/Users/glory_ai_sever/Desktop/erp-worktrees"
git worktree add -b orchestra/terminal-a "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-a" origin/master
git worktree add -b orchestra/terminal-b "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-b" origin/master
git worktree add -b orchestra/terminal-c "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-c" origin/master
git worktree add -b orchestra/terminal-e "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-e" origin/master
```

Install dependencies in each worktree:

```bash
npm install
npm run build
```

Each worktree should use the shared `.orchestra` state from the main project. If the folder is not shared, link it:

```bash
ln -s "/Users/glory_ai_sever/Desktop/erp porject/.orchestra" "/Users/glory_ai_sever/Desktop/erp-worktrees/terminal-a/.orchestra"
```

## Conductor Routine

The conductor should regularly run:

```bash
npm run orchestra -- orders terminal-d
npm run orchestra -- ack terminal-d
npm run orchestra -- status
npm run orchestra -- events 50
git status --short
git worktree list
npm run orchestra -- run terminal-d -- npm run build
```

If a worker touched the wrong area or a claim conflict appears, send a targeted order:

```bash
npm run orchestra -- order terminal-b "Conflict detected with terminal-a. Release or narrow your claim before continuing."
```

## Korean Short Prompts

Use this in the conductor terminal:

```text
지휘. A/B/C/E의 done 제출, lock, conflict, git status, build 상태를 확인하고 문제가 있으면 해당 터미널에 order로 되돌려. 통과하면 완료 보고해.
```

Use this in a worker terminal:

```text
오더 확인. 내 주문을 확인하고 ack 처리한 뒤, 수정 전 claim을 걸고 작업해. build 통과 후 done으로 제출해.
```
