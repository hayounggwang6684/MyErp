# Multi-Agent Coordination

Multi-Agent is a lightweight local coordination layer for running several Codex terminal windows against one project.

It provides:

- shared local state under `.multi-agent/`
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
scripts/multi-agent.js
skills/multi-agent-conductor/SKILL.md
docs/multi-agent.md
```

Then add this script to the target project's `package.json`:

```json
{
  "scripts": {
    "multi-agent": "node scripts/multi-agent.js"
  }
}
```

Add these entries to `.gitignore`:

```text
.multi-agent
.multi-agent/
```

## Basic Setup

Initialize the default agents:

```bash
npm run multi-agent -- init
```

Default agents:

- `terminal-a`: worker
- `terminal-b`: worker
- `terminal-c`: worker
- `terminal-d`: conductor

You can rename their display names in the dashboard or register extra agents:

```bash
npm run multi-agent -- register terminal-e customers
```

## Core Commands

Check state:

```bash
npm run multi-agent -- status
```

Open dashboard:

```bash
npm run multi-agent -- dashboard 4177
```

Send an order:

```bash
npm run multi-agent -- order terminal-a "Update the order tab. Claim files before editing."
```

Check and acknowledge orders:

```bash
npm run multi-agent -- orders terminal-a
npm run multi-agent -- ack terminal-a
```

Claim files:

```bash
npm run multi-agent -- claim terminal-a "src/modules/orders/**" "client/renderer/app-order*.js"
```

Finish work:

```bash
npm run multi-agent -- done terminal-a "Order tab update complete, build passed"
```

When a worker runs `done`, the conductor receives an automatic review order.

Run commands with event logging:

```bash
npm run multi-agent -- run terminal-d -- npm run build
```

## Recommended Worktree Structure

Keep the main project folder for the conductor and integration. Create separate worktrees for workers:

```bash
mkdir -p ../project-worktrees
git worktree add -b multi-agent/terminal-a ../project-worktrees/terminal-a origin/master
git worktree add -b multi-agent/terminal-b ../project-worktrees/terminal-b origin/master
git worktree add -b multi-agent/terminal-c ../project-worktrees/terminal-c origin/master
```

Install dependencies in each worktree:

```bash
npm install
npm run build
```

To share one dashboard state across worktrees, link the conductor state folder:

```bash
ln -s "/absolute/path/to/main-project/.multi-agent" "/absolute/path/to/worktree/.multi-agent"
```

## Conductor Routine

The conductor should regularly run:

```bash
npm run multi-agent -- orders terminal-d
npm run multi-agent -- ack terminal-d
npm run multi-agent -- status
npm run multi-agent -- events 50
git status --short
git worktree list
npm run multi-agent -- run terminal-d -- npm run build
```

If a worker touched the wrong area or a claim conflict appears, send a targeted order:

```bash
npm run multi-agent -- order terminal-b "Conflict detected with terminal-a. Release or narrow your claim before continuing."
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
