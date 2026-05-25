console.log("app.js loaded");

let scenarios = {};
let selected = "part1";

const qs = (id) => document.getElementById(id);

const chatWindow = qs("chatWindow");
const chatText = qs("chatText");
const badge = qs("badge");
const headline = qs("headline");
const checklist = qs("checklist");
const recs = qs("recs");
const logBox = qs("log");
const batchList = qs("batchList");
const toast = qs("toast");

// ---------------- UI ----------------
function addMsg(type, text) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function clearUI() {
  badge.className = "badge";
  badge.textContent = "-";
  headline.textContent = "Ready";
  checklist.innerHTML = "";
  recs.innerHTML = "";
  logBox.textContent = "";
  batchList.innerHTML = "";
  toast.className = "toast";
  toast.textContent = "";
}

function setBadge(color, label) {
  badge.className = "badge " + color;
  badge.textContent = label;
}

function setToast(message, color) {
  if (!message) return;
  toast.textContent = message;
  toast.className = "toast show " + color;
}

// ---------------- RENDER ----------------
function renderBatch(items) {
  batchList.innerHTML = "";
  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div>${it.name}</div><div>${it.state}</div>`;
    batchList.appendChild(row);
  });
}

function renderScenario(key) {
  const s = scenarios[key];
  if (!s) return;

  clearUI();

  headline.textContent = s.status.headline;
  setBadge(s.status.color, s.status.label);

  s.checks.forEach((c) => {
    const div = document.createElement("div");
    div.textContent = `${c.icon} ${c.label} - ${c.value}`;
    checklist.appendChild(div);
  });

  s.recommendations.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    recs.appendChild(li);
  });

  renderBatch(s.batch);

  if (s.toast) {
    setToast(s.toast, s.status.color === "red" ? "red" : "amber");
  }

  logBox.textContent = s.activity.join("\n");
}

// ---------------- LOAD ----------------
async function load() {
  try {
    const res = await fetch("data/scenarios.json");
    scenarios = await res.json();

    chatWindow.innerHTML = "";
    addMsg("sys", "Select a scenario or type a command.");
  } catch (err) {
    console.error(err);
  }
}

// ---------------- RUN ----------------
async function runScenario(options = {}) {
  const s = scenarios[selected];
  if (!s) return;

  if (!options.skipUserMsg) {
    addMsg("user", s.prompt);
  }

  addMsg("bot", "Analyzing...");
  await new Promise((r) => setTimeout(r, 500));

  addMsg("bot", "Running validation...");

  logBox.textContent = "";
  for (const line of s.activity) {
    logBox.textContent += "• " + line + "\n";
    await new Promise((r) => setTimeout(r, 300));
  }

  if (selected === "part4") {
    addMsg("bot", "Validating remaining systems...");

    renderBatch([
      { name: "HXDOM1", state: "✅ Healthy" },
      { name: "APP03", state: "✅ Healthy" },
      { name: "DB01", state: "⏳ Checking..." },
      { name: "APP02", state: "⚠️ Warning" },
      { name: "BOOMI01", state: "❌ Critical" }
    ]);

    await new Promise((r) => setTimeout(r, 2000));

    addMsg("bot", "DB01 validation complete");
  }

  renderScenario(selected);

  addMsg("bot", "✅ Validation completed.");
}

// ---------------- CHAT INPUT ----------------
async function sendUser() {
  const text = chatText.value.trim();
  if (!text) return;

  addMsg("user", text);
  chatText.value = "";

  const lower = text.toLowerCase();

  if (lower.includes("hxdom1")) {
    selected = "part1";
  } else if (lower.includes("boomi01") && lower.includes("why")) {
    selected = "optional";
  } else if (lower.includes("boomi01")) {
    selected = "part2";
  } else if (lower.includes("app02")) {
    selected = "part3";
  } else if (lower.includes("overall")) {
    selected = "part4";
  } else if (lower.includes("alert") || lower.includes("notify")) {
    selected = "part5";
  } else {
    addMsg("bot", "Command not recognized.");
    return;
  }

  await runScenario({ skipUserMsg: true });
}

// ---------------- EVENTS ----------------
window.addEventListener("DOMContentLoaded", load);

// Run
qs("btnRun").addEventListener("click", () => runScenario());

// Reset
qs("btnReset").addEventListener("click", () => {
  clearUI();
  chatWindow.innerHTML = "";
  addMsg("sys", "Reset done.");

  selected = "part1";
});

// Send
qs("btnSend").addEventListener("click", sendUser);

chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendUser();
});

// Scenario select
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    selected = btn.dataset.scn;

    document.querySelectorAll(".chip").forEach((b) =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    addMsg("sys", "Scenario selected. Click run or type.");
  });
});
