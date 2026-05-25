
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

// ---------- UI helpers ----------
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
  hideToast();
}

function setBadge(color, label) {
  badge.className = "badge " + color;
  badge.textContent = label;
}

function showToast(message, color) {
  if (!message) return;
  toast.textContent = message;
  toast.className = "toast show " + (color || "");
}

function hideToast() {
  toast.textContent = "";
  toast.className = "toast";
}

function highlightSelectedChip() {
  document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
  const active = document.querySelector(`.chip[data-scn="${selected}"]`);
  if (active) active.classList.add("active");
}

// ---------- Rendering ----------
function renderBatch(items) {
  batchList.innerHTML = "";
  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "row";

    const left = document.createElement("div");
    left.textContent = it.name;

    const right = document.createElement("div");
    right.textContent = it.state;

    row.appendChild(left);
    row.appendChild(right);
    batchList.appendChild(row);
  });
}

function renderScenario(key) {
  const s = scenarios[key];
  if (!s) return;

  // reset dashboard areas (but do not wipe chat)
  badge.className = "badge";
  badge.textContent = "-";
  checklist.innerHTML = "";
  recs.innerHTML = "";
  logBox.textContent = "";
  hideToast();

  headline.textContent = s.status.headline;
  setBadge(s.status.color, s.status.label);

  // checks list
  s.checks.forEach((c) => {
    const div = document.createElement("div");
    div.textContent = c.icon + " " + c.label + " - " + c.value;
    checklist.appendChild(div);
  });

  // recs
  s.recommendations.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    recs.appendChild(li);
  });

  // batch list
  renderBatch(s.batch);

  // toast
  if (s.toast) {
    const toastColor =
      s.status.color === "red" ? "red" : (s.status.color === "amber" ? "amber" : "");
    showToast(s.toast, toastColor);
  }

  // activity log (static snapshot)
  logBox.textContent = s.activity.map((x) => "• " + x).join("\n");
}

// ---------- Data load ----------
async function load() {
  try {
    const res = await fetch("data/scenarios.json");
    scenarios = await res.json();

    clearUI();
    chatWindow.innerHTML = "";
    addMsg("sys", "Select a demo part above, or type a keyword on the left and press Send.");
    highlightSelectedChip();
  } catch (err) {
    console.error("Error loading scenarios.json:", err);
    addMsg("sys", "ERROR: cannot load scenarios.json. Check path: data/scenarios.json");
  }
}

// ---------- Scenario execution ----------
async function runScenario(options = {}) {
  const s = scenarios[selected];
  if (!s) return;

  // If Send already added the user message, skip duplicating it
  if (!options.skipUserMsg) {
    addMsg("user", s.prompt);
  }

  addMsg("bot", "Analyzing request...");
  await new Promise((r) => setTimeout(r, 500));
  addMsg("bot", "Running validation...");

  // animate logs
  logBox.textContent = "";
  for (const line of s.activity) {
    logBox.textContent += "• " + line + "\n";
    await new Promise((r) => setTimeout(r, 300));
  }

  // Part 4: Overall Summary progress step (visible transition)
  if (selected === "part4") {
    addMsg("bot", "Running overall validation across remaining systems...");

    // Step 1: intermediate view (DB01 checking)
    renderBatch([
      { name: "HXDOM1", state: "✅ Healthy" },
      { name: "APP03", state: "✅ Healthy" },
      { name: "DB01", state: "⏳ Checking..." },
      { name: "APP02", state: "⚠️ Warning" },
      { name: "BOOMI01", state: "❌ Critical" }
    ]);

    await new Promise((r) => setTimeout(r, 2000)); // slower so human can see
    addMsg("bot", "DB01 validation completed.");
  }

  // Final render (authoritative scenario state)
  renderScenario(selected);

  addMsg("bot", "Validation completed.");
}

// ---------- Send behavior (keyword -> scenario -> auto-run) ----------
async function sendUser() {
  const text = chatText.value.trim();
  if (!text) return;

  addMsg("user", text);
  chatText.value = "";

  const lower = text.toLowerCase();

  // Keyword mapping (extend anytime)
  if (lower.includes("hxdom1")) {
    selected = "part1";
  } else if (lower.includes("boomi01") && lower.includes("why")) {
    selected = "optional";
  } else if (lower.includes("boomi01")) {
    selected = "part2";
  } else if (lower.includes("app02") && lower.includes("network")) {
    selected = "part3";
  } else if (lower.includes("overall")) {
    selected = "part4";
  } else if (lower.includes("notify") || lower.includes("alert")) {
    selected = "part5";
  } else {
    addMsg("bot", "Sorry—demo keywords: HXDOM1, BOOMI01, APP02 network, overall, notify/alert, why BOOMI01.");
    return;
  }

  highlightSelectedChip();
  await runScenario({ skipUserMsg: true });
}

// ---------- Event bindings ----------
window.addEventListener("DOMContentLoaded", load);

qs("btnRun").addEventListener("click", () => runScenario());

qs("btnReset").addEventListener("click", () => {
  // reset everything
  selected = "part1";
  clearUI();
  chatWindow.innerHTML = "";
  addMsg("sys", "Reset done. Select a demo part above, or type a keyword and press Send.");
  highlightSelectedChip();
  console.log("Reset triggered");
});

qs("btnSend").addEventListener("click", sendUser);

chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendUser();
});

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    selected = btn.dataset.scn;
    highlightSelectedChip();
    addMsg("sys", "Scenario selected. Click 'Run Selected Scenario' (or type keywords and Send).");
  });
});
