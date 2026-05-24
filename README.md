# Copilot Post-Patch Validation — Web Mock Demo (POC)

This is a **web-based, URL-style mock demo** for your post-patch health-check use case.
It **does not touch any real server/network**. All checks and outputs are simulated.

## What this demo shows
- Post-patch validation (process/service/config/network/web) in a Copilot-style UI
- AI-style interpretation: **service up ≠ application healthy**
- Parallel batch view to shorten patch windows
- Context-rich notification toast for failures

## Run locally
Option A (Python):
```bash
python -m http.server 8000
```
Then open:
- http://localhost:8000/postpatch-copilot-web-demo/

Option B (VS Code):
- Use any static server extension (Live Server)

## Publish as GitHub Pages
1. Create a GitHub repo (e.g. `postpatch-copilot-web-demo`)
2. Upload all files in this folder
3. GitHub → Settings → Pages
4. Source: `main` branch, root folder
5. Your demo becomes a URL like:
   `https://<yourid>.github.io/postpatch-copilot-web-demo/`

## How to demo live
1. Click a scenario chip (Part 1–5 or Optional)
2. Click **Run Selected Scenario**
3. Watch the chat, summary panel, batch panel, and toast alert

## Customize scenarios
Edit:
- `data/scenarios.json`

You can add servers, checks, log lines, and toast alerts.

---
**Note:** This demo is intentionally safe: it is a UX proof-of-concept only.
