<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3249fd58-8997-4db0-b372-45dca796734b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_API_KEY` in `.env` to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Migration (StudyNow)

The app now reads Firebase config from Vite environment variables.

1. Copy `.env.example` to `.env`.
2. In Firebase Console, open the `StudyNow` project and copy the Web App config values.
3. Fill these keys in `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional)
4. Add your live domain to Firebase Auth authorized domains.
5. Deploy Firestore rules after migration.
