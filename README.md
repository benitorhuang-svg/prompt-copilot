# AI_Prompt_Copilot

This repo hosts a small PWA for managing prompt templates and automatically keeps a local `data/` folder updated from the gists of `weihua-studio`.

Usage
- Locally: run `node scripts/fetch_gists.js` (Node 18+)
- The GitHub Action `.github/workflows/update-gists.yml` runs daily and commits updated JSON files into `data/`.

Notes
- The fetch script saves files named like `data/<gist-id>_<filename>.json`.
- If you want more files (non-.json) copied, adjust `scripts/fetch_gists.js`.
