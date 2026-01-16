Convex Auth Integration

This project includes client-side Convex wiring and a template for server-side auth functions.

What was added:
- `utils/convex.ts` with Convex client creation ✅
- `index.tsx` wrapped with `ConvexProvider` ✅
- `components/AuthView.tsx` updated to call `signIn` / `signUp` Convex mutations and persist user to `localStorage` ✅
- `convex/functions/auth.ts` -- template signUp/signIn functions using `bcryptjs` 🔧
- `.env.example` with `VITE_CONVEX_URL` ✅

Quick setup
1. Copy `.env.example` to `.env` and set `VITE_CONVEX_URL` (you provided: `https://blessed-salamander-357.convex.cloud`).
2. Install new dependencies in the app repo:
   npm install
3. Deploy the Convex functions to your Convex project:
   - In your Convex functions package.json add `bcryptjs` as a dependency.
   - Add `convex/functions/auth.ts` to your Convex project and run `npx convex deploy`.

Notes
- The `convex/functions/auth.ts` file is a template and may need small adjustments depending on your Convex runtime version (DB helper APIs differ between versions).
- For better security, consider server-signed tokens and httpOnly cookies instead of storing the user directly in `localStorage`.
