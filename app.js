
console.log("✅ app.js loaded");

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

  clearUI();

  headline.textContent = s.status.headline;
  setBadge(s.status.color, s.status.label);

  s.checks.forEach((c) => {
    const div = document.createElement("div");
    div.textContent = c.icon + " " + c.label + " - " + c.value;
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

  logBox.textContent = s.activity.join("\\n");
}

async function load() {
  try {
    const res = await fetch("data/scenarios.json");
    scenarios = await res.json();
    renderScenario(selected);
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

function runScenario() {
  const s = scenarios[selected];
  if (!s) return;

  addMsg("user", s.prompt);
  addMsg("bot", "Running validation...");

  renderScenario(selected);
}

window.addEventListener("DOMContentLoaded", load);

document.getElementById("btnRun").addEventListener("click", runScenario);

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    selected = btn.dataset.scn;
    
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    selected = btn.dataset.scn;

    // ONLY highlight selection (no dashboard update)
    document.querySelectorAll(".chip").forEach((b) =>
      b.classList.remove("active")
    );
    btn.classList.add("active");

    addMsg("sys", "Scenario selected. Click 'Run Selected Scenario'.");
  });
});

  });
});

