#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const orchestraDir = path.join(root, ".orchestra");
const agentsDir = path.join(orchestraDir, "agents");
const locksDir = path.join(orchestraDir, "locks");
const ordersDir = path.join(orchestraDir, "orders");
const eventsFile = path.join(orchestraDir, "events.log");
const stateFile = path.join(orchestraDir, "state.json");

const now = () => new Date().toISOString();

function ensureStore() {
  fs.mkdirSync(agentsDir, { recursive: true });
  fs.mkdirSync(locksDir, { recursive: true });
  fs.mkdirSync(ordersDir, { recursive: true });
  if (!fs.existsSync(eventsFile)) fs.writeFileSync(eventsFile, "");
  if (!fs.existsSync(stateFile)) {
    writeJson(stateFile, {
      version: 1,
      createdAt: now(),
      updatedAt: now(),
      conductor: {
        note: "Shared local state for coordinating terminal windows."
      }
    });
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function appendEvent(agent, event, details = {}) {
  ensureStore();
  const entry = { time: now(), agent, event, ...details };
  fs.appendFileSync(eventsFile, `${JSON.stringify(entry)}\n`);
}

function agentFile(agent) {
  return path.join(agentsDir, `${safeName(agent)}.json`);
}

function lockFile(agent) {
  return path.join(locksDir, `${safeName(agent)}.json`);
}

function orderFile(agent) {
  return path.join(ordersDir, `${safeName(agent)}.json`);
}

function safeName(value) {
  const name = String(value || "").trim();
  if (!name) fail("Agent name is required.");
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function getAgent(agent) {
  return readJson(agentFile(agent), {
    agent,
    displayName: agent,
    role: null,
    status: "idle",
    task: null,
    filesTouching: [],
    blockedBy: null,
    lastUpdate: null
  });
}

function saveAgent(agent, patch) {
  ensureStore();
  const current = getAgent(agent);
  const next = {
    ...current,
    ...patch,
    agent,
    displayName: patch.displayName ?? current.displayName ?? agent,
    lastUpdate: now()
  };
  writeJson(agentFile(agent), next);
  return next;
}

function renameAgent(agent, displayName) {
  const nextDisplayName = String(displayName || "").trim();
  if (!nextDisplayName) {
    throw new Error("displayName is required");
  }
  const next = saveAgent(agent, { displayName: nextDisplayName });
  appendEvent(agent, "renamed", { displayName: nextDisplayName });
  updateState();
  return next;
}

function terminalTitleForAgent(agentName) {
  const agent = getAgent(agentName);
  const displayName = agent.displayName || agent.agent;
  const role = agent.role ? ` · ${agent.role}` : "";
  return `${displayName} (${agent.agent}${role})`;
}

function setTerminalTitle(agentName) {
  const title = terminalTitleForAgent(agentName);
  process.stdout.write(`\u001b]0;${title}\u0007`);
  console.log(`Terminal title set: ${title}`);
}

function listJsonFiles(dir) {
  ensureStore();
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => path.join(dir, name));
}

function listAgents() {
  return listJsonFiles(agentsDir).map((file) => readJson(file, null)).filter(Boolean);
}

function listLocks() {
  return listJsonFiles(locksDir).map((file) => readJson(file, null)).filter(Boolean);
}

function listOrders() {
  return listJsonFiles(ordersDir).map((file) => readJson(file, null)).filter(Boolean);
}

function sendOrder(target, message) {
  ensureStore();
  const targets = target === "all" ? listAgents().map((agent) => agent.agent) : [target];
  if (targets.length === 0) fail("No registered agents. Run init first.");

  for (const agent of targets) {
    const current = readJson(orderFile(agent), { agent, history: [] });
    const order = {
      agent,
      message,
      createdAt: now(),
      ackedAt: null,
      history: [
        ...(current.history || []).slice(-20),
        ...(current.message
          ? [{ message: current.message, createdAt: current.createdAt, ackedAt: current.ackedAt }]
          : [])
      ]
    };
    writeJson(orderFile(agent), order);
    appendEvent(agent, "order_sent", { message });
  }

  return targets;
}

function readEvents(count = 60) {
  ensureStore();
  const lines = fs.readFileSync(eventsFile, "utf8").trim().split("\n").filter(Boolean);
  return lines
    .slice(-count)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function patternsConflict(left, right) {
  return left.some((a) => right.some((b) => patternMightOverlap(a, b)));
}

function patternMightOverlap(a, b) {
  const left = normalizePattern(a);
  const right = normalizePattern(b);
  if (left === right) return true;
  if (left === "*" || right === "*") return true;
  return left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function normalizePattern(pattern) {
  return String(pattern || "")
    .replace(/\\/g, "/")
    .replace(/\/\*\*.*$/, "")
    .replace(/\/\*.*$/, "")
    .replace(/\*.*$/, "")
    .replace(/\/$/, "");
}

function printStatus() {
  ensureStore();
  const state = readJson(stateFile, {});
  const agents = listAgents();
  const locks = listLocks();
  const orders = listOrders();
  const conflicts = findConflicts(locks);

  console.log("Orchestra status");
  console.log(`Updated: ${state.updatedAt || "unknown"}`);
  console.log("");

  if (agents.length === 0) {
    console.log("Agents: none");
  } else {
    console.log("Agents:");
    for (const agent of agents) {
      const task = agent.task ? ` - ${agent.task}` : "";
      const role = agent.role ? ` (${agent.role})` : "";
      const blocked = agent.blockedBy ? ` blocked by ${agent.blockedBy}` : "";
      console.log(`- ${agent.agent}${role}: ${agent.status}${task}${blocked}`);
    }
  }

  console.log("");
  if (locks.length === 0) {
    console.log("Locks: none");
  } else {
    console.log("Locks:");
    for (const lock of locks) {
      console.log(`- ${lock.agent}: ${lock.patterns.join(", ")}`);
    }
  }

  console.log("");
  if (orders.length === 0) {
    console.log("Orders: none");
  } else {
    console.log("Orders:");
    for (const order of orders) {
      const state = order.ackedAt ? "acked" : "pending";
      console.log(`- ${order.agent}: ${state} - ${order.message}`);
    }
  }

  console.log("");
  if (conflicts.length === 0) {
    console.log("Conflicts: none");
  } else {
    console.log("Conflicts:");
    for (const conflict of conflicts) {
      console.log(`- ${conflict.left} <-> ${conflict.right}: ${conflict.patterns.join(", ")}`);
    }
  }
}

function findConflicts(locks = listLocks()) {
  const conflicts = [];
  for (let i = 0; i < locks.length; i += 1) {
    for (let j = i + 1; j < locks.length; j += 1) {
      if (patternsConflict(locks[i].patterns, locks[j].patterns)) {
        conflicts.push({
          left: locks[i].agent,
          right: locks[j].agent,
          patterns: [...locks[i].patterns, ...locks[j].patterns]
        });
      }
    }
  }
  return conflicts;
}

function updateState(patch = {}) {
  ensureStore();
  const state = readJson(stateFile, {});
  writeJson(stateFile, { ...state, ...patch, updatedAt: now() });
}

function tailEvents(count = 20) {
  for (const event of readEvents(count)) {
    const agent = event.agent ? `${event.agent} ` : "";
    const details = { ...event };
    delete details.time;
    delete details.agent;
    delete details.event;
    const suffix = Object.keys(details).length ? ` ${JSON.stringify(details)}` : "";
    console.log(`${event.time} ${agent}${event.event}${suffix}`);
  }
}

function getDashboardState() {
  ensureStore();
  const state = readJson(stateFile, {});
  const agents = listAgents();
  const locks = listLocks();
  const orders = listOrders();
  const conflicts = findConflicts(locks);
  const events = readEvents(80).reverse();

  return {
    generatedAt: now(),
    updatedAt: state.updatedAt || null,
    agents,
    locks,
    orders,
    conflicts,
    events,
  };
}

function sendText(response, statusCode, contentType, body) {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  response.end(body);
}

function sendJson(response, value) {
  sendText(response, 200, "application/json; charset=utf-8", JSON.stringify(value));
}

function renderDashboardHtml() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Orchestra Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --ink: #15181e;
      --muted: #687083;
      --line: #dfe3ea;
      --accent: #0b7a75;
      --warn: #b7791f;
      --bad: #b42318;
      --ok: #287d3c;
      --idle: #596579;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html {
      width: 100%;
      min-height: 100%;
      background: var(--bg);
    }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
      width: 100%;
      min-width: 1180px;
      overflow-x: auto;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 22px 28px;
      border-bottom: 1px solid var(--line);
      background: rgba(255,255,255,.92);
      position: sticky;
      top: 0;
      z-index: 2;
      width: 100%;
    }
    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 760;
      letter-spacing: 0;
    }
    .subhead {
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    button {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      min-height: 36px;
      padding: 0 12px;
      border-radius: 7px;
      font-weight: 650;
      cursor: pointer;
    }
    button.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    main {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(320px, .8fr);
      gap: 18px;
      padding: 18px;
      max-width: 1500px;
      margin: 0 auto;
      width: 100%;
    }
    section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
    }
    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 760;
    }
    .agent-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }
    .agent-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      min-height: 180px;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 10px;
    }
    .agent-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }
    .agent-name {
      font-size: 17px;
      font-weight: 760;
    }
    .role {
      color: var(--muted);
      font-size: 12px;
      margin-top: 2px;
    }
    .pill {
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 720;
      background: #eef1f5;
      color: var(--idle);
      white-space: nowrap;
    }
    .pill.running { background: #e9f5f4; color: var(--accent); }
    .pill.blocked, .pill.failed { background: #fff0ee; color: var(--bad); }
    .pill.done { background: #edf7ef; color: var(--ok); }
    .task {
      font-size: 13px;
      line-height: 1.45;
      color: #2d3440;
      min-height: 38px;
    }
    .mini-label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      border: 1px solid #d8dde7;
      background: #f9fafb;
      border-radius: 6px;
      padding: 5px 7px;
      font-size: 12px;
      max-width: 100%;
      overflow-wrap: anywhere;
    }
    .order-box {
      border-top: 1px solid var(--line);
      padding-top: 10px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.45;
    }
    .order-box.pending { color: var(--warn); }
    .stack {
      display: grid;
      gap: 18px;
    }
    .table {
      display: grid;
      gap: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 10px;
      font-size: 13px;
    }
    .row strong { font-weight: 760; }
    .timeline {
      display: grid;
      gap: 8px;
      max-height: 560px;
      overflow: auto;
      padding-right: 4px;
    }
    .event {
      border-left: 3px solid var(--line);
      padding: 7px 8px 8px 10px;
      background: #fbfcfd;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      line-height: 1.45;
    }
    .event-time { color: var(--muted); }
    .event-title { font-weight: 750; margin-top: 2px; }
    .empty {
      color: var(--muted);
      font-size: 13px;
      padding: 8px 0;
    }
    .banner {
      border: 1px solid #f1c8c2;
      background: #fff5f3;
      color: var(--bad);
      border-radius: 7px;
      padding: 10px;
      font-size: 13px;
      margin-bottom: 12px;
      display: none;
    }
    .banner.active { display: block; }
    @media (max-width: 1100px) {
      main { grid-template-columns: 1fr; }
      .agent-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 680px) {
      header { align-items: flex-start; flex-direction: column; }
      main { padding: 12px; }
      .agent-grid { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Orchestra Dashboard</h1>
      <div class="subhead" id="updated">상태를 불러오는 중입니다.</div>
    </div>
    <div class="actions">
      <button id="pause">일시정지</button>
      <button class="primary" id="refresh">새로고침</button>
    </div>
  </header>
  <main>
    <div class="stack">
      <section>
        <div class="section-title">
          <h2>Terminal Players</h2>
          <span class="pill" id="agent-count">0 agents</span>
        </div>
        <div class="banner" id="conflict-banner"></div>
        <div class="agent-grid" id="agents"></div>
      </section>
      <section>
        <div class="section-title">
          <h2>Locks And Orders</h2>
          <span class="pill" id="lock-count">0 locks</span>
        </div>
        <div class="table" id="locks"></div>
      </section>
    </div>
    <section>
      <div class="section-title">
        <h2>Event Timeline</h2>
        <span class="pill" id="event-count">0 events</span>
      </div>
      <div class="timeline" id="events"></div>
    </section>
  </main>
  <script>
    let paused = false;

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char]));
    }

    function formatTime(value) {
      if (!value) return "unknown";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString();
    }

    function statusClass(status) {
      return ["running", "blocked", "failed", "done"].includes(status) ? status : "";
    }

    function renderAgents(data) {
      const ordersByAgent = Object.fromEntries(data.orders.map((order) => [order.agent, order]));
      document.getElementById("agent-count").textContent = data.agents.length + " agents";
      document.getElementById("agents").innerHTML = data.agents.map((agent) => {
        const order = ordersByAgent[agent.agent];
        const files = Array.isArray(agent.filesTouching) ? agent.filesTouching : [];
        const task = agent.blockedBy || agent.task || "대기 중";
        const orderState = order ? (order.ackedAt ? "acked" : "pending") : "no order";
        const orderText = order ? order.message : "지시 없음";
        return '<article class="agent-card">' +
          '<div class="agent-top"><div><div class="agent-name">' + escapeHtml(agent.agent) + '</div><div class="role">' + escapeHtml(agent.role || "unassigned") + '</div></div>' +
          '<span class="pill ' + statusClass(agent.status) + '">' + escapeHtml(agent.status || "idle") + '</span></div>' +
          '<div class="task">' + escapeHtml(task) + '</div>' +
          '<div><div class="mini-label">Claimed files</div><div class="chips">' +
          (files.length ? files.map((file) => '<span class="chip">' + escapeHtml(file) + '</span>').join("") : '<span class="chip">none</span>') +
          '</div></div>' +
          '<div class="order-box ' + (order && !order.ackedAt ? "pending" : "") + '"><strong>Order ' + escapeHtml(orderState) + '</strong><br />' + escapeHtml(orderText) + '</div>' +
          '</article>';
      }).join("");
    }

    function renderLocks(data) {
      document.getElementById("lock-count").textContent = data.locks.length + " locks";
      const banner = document.getElementById("conflict-banner");
      if (data.conflicts.length) {
        banner.classList.add("active");
        banner.textContent = "충돌 감지: " + data.conflicts.map((item) => item.left + " <-> " + item.right).join(", ");
      } else {
        banner.classList.remove("active");
        banner.textContent = "";
      }

      const lockRows = data.locks.map((lock) =>
        '<div class="row"><strong>' + escapeHtml(lock.agent) + '</strong><div>' +
        lock.patterns.map((pattern) => '<span class="chip">' + escapeHtml(pattern) + '</span>').join(" ") +
        '</div></div>'
      );
      const pendingOrders = data.orders
        .filter((order) => !order.ackedAt)
        .map((order) => '<div class="row"><strong>' + escapeHtml(order.agent) + ' order</strong><div>' + escapeHtml(order.message) + '</div></div>');
      document.getElementById("locks").innerHTML = [...lockRows, ...pendingOrders].join("") || '<div class="empty">lock과 pending order가 없습니다.</div>';
    }

    function renderEvents(data) {
      document.getElementById("event-count").textContent = data.events.length + " events";
      document.getElementById("events").innerHTML = data.events.map((event) => {
        const details = { ...event };
        delete details.time;
        delete details.agent;
        delete details.event;
        return '<div class="event"><div class="event-time">' + escapeHtml(formatTime(event.time)) + '</div>' +
          '<div class="event-title">' + escapeHtml((event.agent || "system") + " " + event.event) + '</div>' +
          '<div>' + escapeHtml(JSON.stringify(details)) + '</div></div>';
      }).join("") || '<div class="empty">이벤트가 없습니다.</div>';
    }

    async function refresh() {
      const response = await fetch("/api/state", { cache: "no-store" });
      const data = await response.json();
      document.getElementById("updated").textContent = "Updated " + formatTime(data.updatedAt || data.generatedAt);
      renderAgents(data);
      renderLocks(data);
      renderEvents(data);
    }

    document.getElementById("refresh").addEventListener("click", refresh);
    document.getElementById("pause").addEventListener("click", (event) => {
      paused = !paused;
      event.currentTarget.textContent = paused ? "재개" : "일시정지";
    });

    refresh();
    setInterval(() => {
      if (!paused) refresh();
    }, 2000);
  </script>
</body>
</html>`;
}

function renderChatDashboardHtml() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Orchestra Room</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #eef1f5;
      --panel: #ffffff;
      --ink: #111827;
      --muted: #667085;
      --line: #d8dee8;
      --conductor: #0b7a75;
      --worker: #315f9f;
      --ok: #287d3c;
      --warn: #b7791f;
      --bad: #b42318;
      --soft: #f7f9fc;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; background: var(--bg); color: var(--ink); }
    body { min-width: 1180px; overflow: hidden; }
    .shell { display: grid; grid-template-columns: 280px minmax(520px, 1fr) 340px; height: 100vh; height: 100dvh; overflow: hidden; }
    aside, .room, .inspector { height: 100vh; height: 100dvh; min-height: 0; overflow: hidden; }
    aside { background: #fbfcfe; border-right: 1px solid var(--line); padding: 18px 16px; }
    .brand h1 { margin: 0; font-size: 22px; letter-spacing: 0; }
    .updated { margin-top: 6px; color: var(--muted); font-size: 12px; line-height: 1.4; }
    .toolbar { display: flex; gap: 8px; margin: 16px 0 18px; }
    button, select, input {
      min-height: 36px;
      border: 1px solid var(--line);
      border-radius: 7px;
      background: #fff;
      color: var(--ink);
      font: inherit;
    }
    button { padding: 0 12px; font-weight: 700; cursor: pointer; }
    button.primary { border-color: var(--conductor); background: var(--conductor); color: #fff; }
    .roster { display: grid; gap: 10px; max-height: calc(100dvh - 144px); overflow: auto; padding-right: 2px; }
    .person {
      display: grid;
      grid-template-columns: 38px minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #e8eef7;
      color: var(--worker);
      font-weight: 800;
    }
    .person.conductor .avatar { background: #e4f3f1; color: var(--conductor); }
    .name { font-weight: 800; font-size: 14px; }
    .role { color: var(--muted); font-size: 12px; margin-top: 2px; }
    .status {
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 800;
      background: #eef1f5;
      color: var(--muted);
      white-space: nowrap;
    }
    .status.running { background: #e4f3f1; color: var(--conductor); }
    .status.done { background: #edf7ef; color: var(--ok); }
    .status.blocked, .status.failed { background: #fff0ee; color: var(--bad); }
    .room { position: relative; display: grid; grid-template-rows: auto minmax(0, 1fr); background: #f7f8fb; padding-bottom: 78px; }
    .room-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--line);
      background: rgba(255,255,255,.88);
      z-index: 2;
    }
    .room-title { font-size: 18px; font-weight: 850; }
    .room-subtitle { color: var(--muted); font-size: 12px; margin-top: 4px; }
    .metrics { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .metric { border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px; background: #fff; color: var(--muted); font-size: 12px; font-weight: 750; }
    .metric.alert { color: var(--bad); border-color: #efc7c1; background: #fff5f3; }
    .chat { min-height: 0; padding: 16px 24px 34px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
    .message { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 10px; max-width: 860px; }
    .message.conductor { align-self: flex-end; grid-template-columns: minmax(0, 1fr) 42px; }
    .message.conductor .bubble { order: 1; background: #e7f4f2; border-color: #b9dcd7; }
    .message.conductor .msg-avatar { order: 2; background: var(--conductor); color: #fff; }
    .msg-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--worker);
      color: #fff;
      font-weight: 850;
    }
    .bubble { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; }
    .bubble-top { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 5px; color: var(--muted); font-size: 12px; }
    .speaker { color: var(--ink); font-weight: 850; }
    .event-name { font-weight: 800; color: var(--conductor); }
    .message.failed .event-name, .message.blocked .event-name { color: var(--bad); }
    .message.done .event-name, .message.command_succeeded .event-name { color: var(--ok); }
    .message.order_sent .event-name, .message.review_requested .event-name { color: var(--warn); }
    .text { font-size: 13px; line-height: 1.48; overflow-wrap: anywhere; white-space: pre-wrap; }
    .composer { position: absolute; left: 0; right: 0; bottom: 0; border-top: 1px solid var(--line); padding: 10px 18px 18px; background: #fff; box-shadow: 0 -8px 18px rgba(17, 24, 39, .05); }
    .composer-form { display: grid; grid-template-columns: 150px minmax(0, 1fr) auto; gap: 8px; }
    select, input { padding: 0 10px; }
    .inspector { background: #fbfcfe; border-left: 1px solid var(--line); padding: 18px 16px; display: grid; align-content: start; gap: 14px; overflow-y: auto; }
    .panel { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
    .panel h2 { margin: 0 0 10px; font-size: 14px; }
    .mini-list { display: grid; gap: 8px; }
    .mini-row { border: 1px solid var(--line); border-radius: 7px; padding: 9px; font-size: 12px; line-height: 1.45; background: var(--soft); overflow-wrap: anywhere; }
    .mini-row strong { display: block; margin-bottom: 3px; font-size: 12px; color: var(--ink); }
    .empty { color: var(--muted); font-size: 12px; }
    @media (max-width: 980px) {
      body { min-width: 0; }
      body { overflow: auto; }
      .shell { grid-template-columns: 1fr; height: auto; min-height: 100vh; overflow: visible; }
      aside, .inspector { height: auto; min-height: auto; overflow: visible; border: 0; border-bottom: 1px solid var(--line); }
      .room { height: calc(100dvh - 24px); min-height: 620px; margin-bottom: 24px; }
      .roster { max-height: none; }
      .composer-form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <div class="brand">
        <h1>Orchestra Room</h1>
        <div class="updated" id="updated">상태를 불러오는 중입니다.</div>
      </div>
      <div class="toolbar">
        <button id="pause">일시정지</button>
        <button class="primary" id="refresh">새로고침</button>
      </div>
      <div class="roster" id="roster"></div>
    </aside>
    <section class="room">
      <div class="room-head">
        <div>
          <div class="room-title">통합 개발 대화방</div>
          <div class="room-subtitle">A/B/C/E 제출과 D 지휘 흐름을 채팅으로 표시합니다.</div>
        </div>
        <div class="metrics" id="metrics"></div>
      </div>
      <div class="chat" id="chat"></div>
      <div class="composer">
        <form class="composer-form" id="composer-form">
          <select id="target"></select>
          <input id="message" placeholder="D가 보낼 지시를 입력하세요" autocomplete="off" />
          <button class="primary" type="submit">지시 보내기</button>
        </form>
      </div>
    </section>
    <aside class="inspector">
      <div class="panel">
        <h2>Locks</h2>
        <div class="mini-list" id="locks"></div>
      </div>
      <div class="panel">
        <h2>Pending Orders</h2>
        <div class="mini-list" id="pending-orders"></div>
      </div>
      <div class="panel">
        <h2>Conflicts</h2>
        <div class="mini-list" id="conflicts"></div>
      </div>
    </aside>
  </div>
  <script>
    let paused = false;
    let latestAgents = [];

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]));
    }

    function formatTime(value) {
      if (!value) return 'unknown';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString();
    }

    function firstLetter(agent) {
      return String(agent || '?').replace('terminal-', '').slice(0, 1).toUpperCase();
    }

    function displayName(agent) {
      return agent?.displayName || agent?.agent || 'unknown';
    }

    function displayNameForEvent(event) {
      const found = latestAgents.find((agent) => agent.agent === event.agent);
      return found ? displayName(found) : (event.agent || 'system');
    }

    function statusClass(status) {
      return ['running', 'blocked', 'failed', 'done'].includes(status) ? status : '';
    }

    function eventText(event) {
      if (event.message) return event.message;
      if (event.task) return event.task;
      if (event.command) return event.command + (event.exitCode ? ' exit ' + event.exitCode : '');
      if (event.patterns) return event.patterns.join(', ');
      const details = { ...event };
      delete details.time;
      delete details.agent;
      delete details.event;
      delete details.role;
      return Object.keys(details).length ? JSON.stringify(details) : '상태 업데이트';
    }

    function renderRoster(data) {
      latestAgents = data.agents;
      const sorted = [...data.agents].sort((a, b) => (a.agent === 'terminal-d' ? -1 : b.agent === 'terminal-d' ? 1 : a.agent.localeCompare(b.agent)));
      document.getElementById('roster').innerHTML = sorted.map((agent) => {
        const conductor = agent.agent === 'terminal-d';
        return '<div class="person ' + (conductor ? 'conductor' : '') + '" data-agent="' + escapeHtml(agent.agent) + '">' +
          '<div class="avatar">' + escapeHtml(firstLetter(agent.agent)) + '</div>' +
          '<div><div class="name">' + escapeHtml(displayName(agent)) + '</div><div class="role">' + escapeHtml(agent.agent + ' · ' + (agent.role || 'unassigned')) + '</div></div>' +
          '<div class="status ' + statusClass(agent.status) + '">' + escapeHtml(agent.status || 'idle') + '</div>' +
        '</div>';
      }).join('');

      const target = document.getElementById('target');
      const current = target.value || 'terminal-d';
      target.innerHTML = data.agents.map((agent) => '<option value="' + escapeHtml(agent.agent) + '">' + escapeHtml(displayName(agent)) + '</option>').join('');
      target.value = data.agents.some((agent) => agent.agent === current) ? current : 'terminal-d';
    }

    function renderChat(data) {
      const events = data.events.slice(0, 45).reverse();
      document.getElementById('chat').innerHTML = events.map((event) => {
        const conductor = event.agent === 'terminal-d';
        const classes = ['message', conductor ? 'conductor' : '', event.event || ''].join(' ');
        return '<article class="' + classes + '">' +
          '<div class="msg-avatar">' + escapeHtml(firstLetter(event.agent)) + '</div>' +
          '<div class="bubble">' +
            '<div class="bubble-top"><span class="speaker">' + escapeHtml(displayNameForEvent(event)) + '</span><span>' + escapeHtml(formatTime(event.time)) + '</span></div>' +
            '<div class="event-name">' + escapeHtml(event.event || 'event') + '</div>' +
            '<div class="text">' + escapeHtml(eventText(event)).slice(0, 520) + '</div>' +
          '</div>' +
        '</article>';
      }).join('') || '<div class="empty">아직 대화 이벤트가 없습니다.</div>';
      const chat = document.getElementById('chat');
      requestAnimationFrame(() => {
        chat.scrollTop = chat.scrollHeight;
      });
    }

    function renderInspector(data) {
      document.getElementById('metrics').innerHTML = [
        '<span class="metric">' + data.agents.length + ' terminals</span>',
        '<span class="metric">' + data.locks.length + ' locks</span>',
        '<span class="metric ' + (data.conflicts.length ? 'alert' : '') + '">' + data.conflicts.length + ' conflicts</span>'
      ].join('');

      document.getElementById('locks').innerHTML = data.locks.map((lock) =>
        '<div class="mini-row"><strong>' + escapeHtml(lock.agent) + '</strong>' + escapeHtml(lock.patterns.join(', ')) + '</div>'
      ).join('') || '<div class="empty">현재 lock 없음</div>';

      document.getElementById('pending-orders').innerHTML = data.orders.filter((order) => !order.ackedAt).map((order) =>
        '<div class="mini-row"><strong>' + escapeHtml(order.agent) + '</strong>' + escapeHtml(order.message) + '</div>'
      ).join('') || '<div class="empty">대기 order 없음</div>';

      document.getElementById('conflicts').innerHTML = data.conflicts.map((conflict) =>
        '<div class="mini-row"><strong>' + escapeHtml(conflict.left + ' vs ' + conflict.right) + '</strong>' + escapeHtml(conflict.patterns.join(', ')) + '</div>'
      ).join('') || '<div class="empty">충돌 없음</div>';
    }

    async function refresh() {
      const response = await fetch('/api/state', { cache: 'no-store' });
      const data = await response.json();
      document.getElementById('updated').textContent = 'Updated ' + new Date(data.updatedAt || data.generatedAt).toLocaleString();
      renderRoster(data);
      renderChat(data);
      renderInspector(data);
    }

    async function sendOrder(event) {
      event.preventDefault();
      const target = document.getElementById('target').value;
      const message = document.getElementById('message').value.trim();
      if (!message) return;
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, message })
      });
      if (response.ok) {
        document.getElementById('message').value = '';
        await refresh();
      }
    }

    async function renameFromRoster(event) {
      const person = event.target.closest('.person[data-agent]');
      if (!person) return;
      event.preventDefault();
      const agentId = person.dataset.agent;
      const agent = latestAgents.find((item) => item.agent === agentId);
      const nextName = window.prompt('표시 이름을 입력하세요', displayName(agent));
      if (nextName === null) return;
      const trimmedName = nextName.trim();
      if (!trimmedName) return;
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentId, displayName: trimmedName })
      });
      if (response.ok) {
        await refresh();
      }
    }

    document.getElementById('refresh').addEventListener('click', refresh);
    document.getElementById('pause').addEventListener('click', (event) => {
      paused = !paused;
      event.currentTarget.textContent = paused ? '재개' : '일시정지';
    });
    document.getElementById('composer-form').addEventListener('submit', sendOrder);
    document.getElementById('roster').addEventListener('contextmenu', renameFromRoster);

    refresh();
    setInterval(() => {
      if (!paused) refresh();
    }, 2000);
  </script>
</body>
</html>`;
}

function readRequestJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 64) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function startDashboard(port = 4177) {
  ensureStore();
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
    if (requestUrl.pathname === "/api/state") {
      sendJson(response, getDashboardState());
      return;
    }

    if (requestUrl.pathname === "/api/order" && request.method === "POST") {
      try {
        const payload = await readRequestJson(request);
        const target = String(payload.target || "").trim();
        const message = String(payload.message || "").trim();
        if (!target || !message) {
          sendText(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "target and message are required" }));
          return;
        }
        const targets = sendOrder(target, message);
        updateState();
        sendJson(response, { ok: true, targets });
      } catch (error) {
        sendText(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: error.message || "invalid request" }));
      }
      return;
    }

    if (requestUrl.pathname === "/api/rename" && request.method === "POST") {
      try {
        const payload = await readRequestJson(request);
        const agent = String(payload.agent || "").trim();
        const displayName = String(payload.displayName || "").trim();
        if (!agent || !displayName) {
          sendText(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "agent and displayName are required" }));
          return;
        }
        const next = renameAgent(agent, displayName);
        sendJson(response, { ok: true, agent: next });
      } catch (error) {
        sendText(response, 400, "application/json; charset=utf-8", JSON.stringify({ error: error.message || "invalid request" }));
      }
      return;
    }

    if (requestUrl.pathname === "/" || requestUrl.pathname === "/dashboard") {
      sendText(response, 200, "text/html; charset=utf-8", renderChatDashboardHtml());
      return;
    }

    if (requestUrl.pathname === "/favicon.ico") {
      response.writeHead(204, { "Cache-Control": "public, max-age=86400" });
      response.end();
      return;
    }

    sendText(response, 404, "text/plain; charset=utf-8", "Not found");
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Orchestra dashboard: http://127.0.0.1:${port}`);
  });
}

function commandHelp() {
  console.log(`Usage:
  npm run orchestra -- init
  npm run orchestra -- status
  npm run orchestra -- register <agent> [role]
  npm run orchestra -- start <agent> <task>
  npm run orchestra -- claim <agent> <file-or-pattern> [...]
  npm run orchestra -- release <agent>
  npm run orchestra -- order <agent|all> <message>
  npm run orchestra -- orders [agent]
  npm run orchestra -- ack <agent>
  npm run orchestra -- title <agent>
  npm run orchestra -- dashboard [port]
  npm run orchestra -- note <agent> <message>
  npm run orchestra -- block <agent> <reason>
  npm run orchestra -- done <agent> [message]
  npm run orchestra -- events [count]
  npm run orchestra -- run <agent> -- <command> [args...]`);
}

function initFourAgents() {
  ensureStore();
  const defaults = [
    ["terminal-a", "backend"],
    ["terminal-b", "frontend"],
    ["terminal-c", "test"],
    ["terminal-d", "ops"]
  ];
  for (const [agent, role] of defaults) {
    saveAgent(agent, { role, status: "idle", task: null, filesTouching: [], blockedBy: null });
    appendEvent(agent, "registered", { role });
  }
  updateState({ agents: defaults.map(([agent]) => agent) });
  console.log("Initialized 4 agents: terminal-a, terminal-b, terminal-c, terminal-d");
}

function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help") {
    commandHelp();
    return;
  }

  if (command === "init") {
    initFourAgents();
    return;
  }

  if (command === "status") {
    printStatus();
    return;
  }

  if (command === "events") {
    tailEvents(Number(args[0] || 20));
    return;
  }

  if (command === "dashboard") {
    startDashboard(Number(args[0] || 4177));
    return;
  }

  if (command === "order") {
    const [target, ...messageParts] = args;
    const message = messageParts.join(" ").trim();
    if (!target || !message) fail("Use: npm run orchestra -- order <agent|all> <message>");
    const targets = sendOrder(target, message);
    updateState();
    console.log(`Order sent to ${targets.join(", ")}`);
    return;
  }

  if (command === "orders") {
    const [agent] = args;
    const orders = agent ? [readJson(orderFile(agent), null)].filter(Boolean) : listOrders();
    if (orders.length === 0) {
      console.log("No orders.");
      return;
    }
    for (const order of orders) {
      const state = order.ackedAt ? `acked ${order.ackedAt}` : "pending";
      console.log(`${order.agent}: ${state}`);
      console.log(order.message);
      console.log("");
    }
    return;
  }

  if (command === "ack") {
    const [agent] = args;
    if (!agent) fail("Use: npm run orchestra -- ack <agent>");
    const file = orderFile(agent);
    const order = readJson(file, null);
    if (!order) fail(`No order for ${agent}.`);
    order.ackedAt = now();
    writeJson(file, order);
    appendEvent(agent, "order_acked", { message: order.message });
    updateState();
    console.log(`${agent} acknowledged order`);
    return;
  }

  if (command === "title") {
    const [agent] = args;
    if (!agent) fail("Use: npm run orchestra -- title <agent>");
    setTerminalTitle(agent);
    return;
  }

  if (command === "register") {
    const [agent, role = null] = args;
    saveAgent(agent, { role, status: "idle" });
    appendEvent(agent, "registered", { role });
    updateState();
    console.log(`Registered ${agent}`);
    return;
  }

  if (command === "start") {
    const [agent, ...taskParts] = args;
    const task = taskParts.join(" ").trim();
    if (!task) fail("Task is required.");
    saveAgent(agent, { status: "running", task, blockedBy: null });
    appendEvent(agent, "task_started", { task });
    updateState();
    console.log(`${agent} started: ${task}`);
    return;
  }

  if (command === "claim") {
    const [agent, ...patterns] = args;
    if (patterns.length === 0) fail("At least one file or pattern is required.");
    const existing = listLocks().filter((lock) => lock.agent !== agent);
    const conflicts = existing.filter((lock) => patternsConflict(patterns, lock.patterns));
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        console.error(`Conflict with ${conflict.agent}: ${conflict.patterns.join(", ")}`);
      }
      process.exit(2);
    }

    writeJson(lockFile(agent), { agent, patterns, claimedAt: now() });
    saveAgent(agent, { filesTouching: patterns });
    appendEvent(agent, "files_claimed", { patterns });
    updateState();
    console.log(`${agent} claimed: ${patterns.join(", ")}`);
    return;
  }

  if (command === "release") {
    const [agent] = args;
    const file = lockFile(agent);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    saveAgent(agent, { filesTouching: [] });
    appendEvent(agent, "files_released");
    updateState();
    console.log(`${agent} released locks`);
    return;
  }

  if (command === "note") {
    const [agent, ...messageParts] = args;
    const message = messageParts.join(" ").trim();
    if (!message) fail("Message is required.");
    saveAgent(agent, { status: "noted" });
    appendEvent(agent, "note", { message });
    updateState();
    console.log(`${agent} noted: ${message}`);
    return;
  }

  if (command === "block") {
    const [agent, ...reasonParts] = args;
    const reason = reasonParts.join(" ").trim();
    if (!reason) fail("Reason is required.");
    saveAgent(agent, { status: "blocked", blockedBy: reason });
    appendEvent(agent, "blocked", { reason });
    updateState();
    console.log(`${agent} blocked: ${reason}`);
    return;
  }

  if (command === "done") {
    const [agent, ...messageParts] = args;
    const message = messageParts.join(" ").trim() || null;
    const file = lockFile(agent);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    saveAgent(agent, { status: "done", task: null, filesTouching: [], blockedBy: null });
    appendEvent(agent, "task_done", { message });
    if (agent !== "terminal-d") {
      const reviewMessage = `${agent} 완료 제출: ${message || "완료 내용 없음"}. status/events와 변경사항을 확인하고 npm run orchestra -- run terminal-d -- npm run build 로 검증해. 문제가 있으면 해당 터미널에 order로 되돌려.`;
      sendOrder("terminal-d", reviewMessage);
      appendEvent("terminal-d", "review_requested", { from: agent, message: reviewMessage });
    }
    updateState();
    console.log(`${agent} done`);
    if (agent !== "terminal-d") {
      console.log("Review order sent to terminal-d");
    }
    return;
  }

  if (command === "run") {
    const separator = args.indexOf("--");
    if (separator < 1) fail("Use: npm run orchestra -- run <agent> -- <command> [args...]");
    const agent = args[0];
    const commandArgs = args.slice(separator + 1);
    if (commandArgs.length === 0) fail("Command is required.");
    const display = commandArgs.join(" ");
    saveAgent(agent, { status: "running", task: display, blockedBy: null });
    appendEvent(agent, "command_started", { command: display });
    updateState();
    const result = spawnSync(commandArgs[0], commandArgs.slice(1), {
      cwd: root,
      stdio: "inherit",
      shell: false
    });
    const exitCode = result.status || 0;
    saveAgent(agent, { status: exitCode === 0 ? "idle" : "failed", task: null });
    appendEvent(agent, exitCode === 0 ? "command_succeeded" : "command_failed", {
      command: display,
      exitCode
    });
    updateState();
    process.exit(exitCode);
  }

  fail(`Unknown command: ${command}`);
}

main();
