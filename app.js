
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


async function runScenario() {
  const s = scenarios[selected];
  if (!s) return;

  addMsg("user", s.prompt);
  addMsg("bot", "Running validation...");

  // simulate delay
  await new Promise((r) => setTimeout(r, 800));

  // animate logs
  logBox.textContent = "";
  for (const line of s.activity) {
    logBox.textContent += "• " + line + "\n";
    await new Promise((r) => setTimeout(r, 300));
  }

  // ✅ SPECIAL HANDLING FOR BATCH SCENARIO
  if (selected === "part4") {
    addMsg("bot", "Running batch validation across all servers...");

    // Step 1: show intermediate state (DB01 still checking)
    renderBatch([
      { name: "HXDOM1", state: "✅ Healthy" },
      { name: "APP03", state: "✅ Healthy" },
      { name: "DB01", state: "⏳ Checking..." },
      { name: "APP02", state: "⚠️ Warning" },
      { name: "BOOMI01", state: "❌ Critical" }
    ]);

    await new Promise((r) => setTimeout(r, 1200));
  }

  // ✅ Final state
  renderScenario(selected);

  addMsg("bot", "✅ Validation completed.");
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


document.getElementById("btnReset").addEventListener("click", function () {
  // Clear chat
  chatWindow.innerHTML = "";
  addMsg("sys", "Select a demo part above, then click 'Run Selected Scenario'.");

  // Reset dashboard
  badge.className = "badge";
  badge.textContent = "-";
  headline.textContent = "Ready";
  checklist.innerHTML = "";
  recs.innerHTML = "";
  logBox.textContent = "";
  batchList.innerHTML = "";

  // Clear toast
  toast.className = "toast";
  toast.textContent = "";

  // Reset selection
  selected = "part1";

  console.log("✅ Reset triggered");
});


// ✅ SEND BUTTON
document.getElementById("btnSend").addEventListener("click", sendUser);

// ✅ ENTER KEY SUPPORT
chatText.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendUser();
  }
});

// ✅ USER INPUT FUNCTION
function sendUser() {
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
  } else if (lower.includes("alert")) {
    selected = "part5";
  }

  addMsg("bot", "✅ Request understood. Click 'Run Selected Scenario'.");
}



