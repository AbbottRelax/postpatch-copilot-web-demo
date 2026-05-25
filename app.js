// Copilot Post-Patch Validation • Web demo (static mock)

console.log("app.js loaded");

let scenarios = {};
let selected = 'part1';

const qs = (id)=>document.getElementById(id);
const chatWindow = qs('chatWindow');
const chatText = qs('chatText');
const badge = qs('badge');
const headline = qs('headline');
const checklist = qs('checklist');
const recs = qs('recs');
const logBox = qs('log');
const batchList = qs('batchList');
const toast = qs('toast');

function addMsg(type, text){
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function clearUI(){
  badge.className = 'badge';
  badge.textContent = '—';
  headline.textContent = 'Ready';
  checklist.innerHTML = '';
  recs.innerHTML = '';
  logBox.textContent = '';
  batchList.innerHTML = '';
  toast.className = 'toast';
  toast.textContent = '';
  toast.classList.remove('show','red','amber');
}

function setBadge(color,label){
  badge.className = `badge ${color}`;
  badge.textContent = label;
}

function setToast(message, color){
  if(!message){
    toast.className='toast';
    toast.textContent='';
    toast.classList.remove('show');
    return;
  }
  toast.textContent = message;
  toast.className = `toast show ${color}`;
}

function renderBatch(items){
  batchList.innerHTML = '';
  items.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'row';
    const left = document.createElement('div');
    left.textContent = it.name;
    const right = document.createElement('div');
    right.textContent = it.state;
    right.className = 'state ' + (it.state.includes('✅') ? 'ok' : it.state.includes('⚠️') ? 'warn' : 'bad');
    row.appendChild(left);
    row.appendChild(right);
    batchList.appendChild(row);
  });
}

function renderScenario(key){
  const s = scenarios[key];
  if(!s) return;
  clearUI();

  // Fill summary
  headline.textContent = s.status.headline;
  setBadge(s.status.color, s.status.label);

  // checklist
  s.checks.forEach(c=>{
    const row = document.createElement('div');
    row.className = 'checkRow';

    const icon = document.createElement('div');
    icon.className = 'checkIcon';
    icon.textContent = c.icon;

    const text = document.createElement('div');
    text.className = 'checkText';

    const lab = document.createElement('div');
    lab.className = 'checkLabel';
    lab.textContent = c.label;

    const val = document.createElement('div');
    val.className = 'checkVal';
    val.textContent = c.value;

    text.appendChild(lab);
    text.appendChild(val);

    row.appendChild(icon);
    row.appendChild(text);
    checklist.appendChild(row);
  });

  // recs
  s.recommendations.forEach(r=>{
    const li = document.createElement('li');
    li.textContent = r;
    recs.appendChild(li);
  });

  // batch
  renderBatch(s.batch);

  // toast
setToast(s.toast, s.status.color === "red" ? "red" : (s.status.color === "amber" ? "amber" : ""));

  // log
  logBox.textContent = s.activity.map(x=>`• ${x}`).join('
');
}

function highlightChip(){
  document.querySelectorAll('.chip').forEach(b=>{
    b.classList.toggle('active', b.dataset.scn===selected);
  });
}

async function load(){
  const res = await fetch('data/scenarios.json');
  scenarios = await res.json();
  renderScenario(selected);
  highlightChip();
}

// Demo run: adds chat turns and simulates thinking
async function runScenario(){
  const s = scenarios[selected];
  if(!s) return;

  addMsg('user', s.prompt);
  addMsg('bot', 'Running post-patch checks...');

  // animate log line by line
  logBox.textContent = '';
  for(const line of s.activity){
    logBox.textContent += `• ${line}
`;
    await new Promise(r=>setTimeout(r, 350));
  }

  renderScenario(selected);
  addMsg('bot', `${s.status.headline} — Summary updated. ${s.toast ? 'Alert triggered.' : ''}`);
}

// user input (demo only): try to match scenario by keywords
function sendUser(){
  const t = chatText.value.trim();
  if(!t) return;
  addMsg('user', t);
  chatText.value='';

  const lower = t.toLowerCase();
  if(lower.includes('hxdom1')) selected='part1';
  else if(lower.includes('boomi01') && lower.startsWith('why')) selected='optional';
  else if(lower.includes('boomi01')) selected='part2';
  else if(lower.includes('app02') && lower.includes('network')) selected='part3';
  else if(lower.includes('overall') || lower.includes('batch')) selected='part4';
  else if(lower.includes('send') && lower.includes('alert')) selected='part5';

  highlightChip();
  addMsg('bot', 'Got it. Click "Run Selected Scenario" to simulate the checks.');
}

// events
window.addEventListener('DOMContentLoaded', load);
qs('btnRun').addEventListener('click', runScenario);
qs('btnSend').addEventListener('click', sendUser);
chatText.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendUser(); });
qs('btnReset').addEventListener('click', ()=>{ chatWindow.innerHTML=''; addMsg('sys','Select a demo part above, then click "Run Selected Scenario".'); renderScenario(selected); });

document.querySelectorAll('.chip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selected = btn.dataset.scn;
    highlightChip();
    renderScenario(selected);
  });
});
