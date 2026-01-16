# Hostinger deployment (Full Node app)

This repository can be deployed as a full Node app (Express + socket.io) on Hostinger. Follow these steps and notes.

## Requirements
- Use a Hostinger Node hosting plan (or VPS) that supports persistent Node processes.
- Node.js 24.x (project includes `.nvmrc` and `engines` to pin Node).

## Recommended Setup
1. In Hostinger, create the Node app and set the Node version to **24**.
2. In the app settings, set the install command to:

   npm ci

   Note: Ensure Hostinger does not run `npm ci --production` or `npm install --omit=dev` during deploy, because the build uses Vite (a devDependency).

3. Environment variables
   - NODE_ENV=production
   - PORT (if Hostinger doesn't provide one)
   - VITE_CONVEX_URL (your Convex URL)
   - any other API keys (e.g., GEMINI_API_KEY)

4. Start command:

   npm start

   (Procfile present: `web: npm start` — some platforms respect Procfile.)

## Build behavior
- The project has a `postinstall` script that runs a conditional build only if Vite is installed on the host machine. If Hostinger does not install devDependencies, prebuild locally and upload the `dist/` folder instead.

## Health check
- A simple health endpoint is available at `GET /health` that returns `{ ok: true }`.

## Troubleshooting
- If the build fails due to `vite` missing: either ensure Hostinger installs devDependencies or run `npm run build` locally and deploy the resulting `dist/` folder.
- For socket.io across proxies, ensure WebSocket support is enabled in Hostinger or the reverse proxy is configured correctly.

If you'd like, I can also add an `ecosystem.config.js` for PM2 or a small script to prebuild and upload the `dist/` folder during CI.
