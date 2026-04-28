
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredFirebaseEnv = [
	'VITE_FIREBASE_API_KEY',
	'VITE_FIREBASE_APP_ID',
	'VITE_FIREBASE_MESSAGING_SENDER_ID',
	'VITE_FIREBASE_PROJECT_ID',
	'VITE_FIREBASE_AUTH_DOMAIN',
	'VITE_FIREBASE_STORAGE_BUCKET',
] as const;

const missingFirebaseEnv = requiredFirebaseEnv.filter((key) => !import.meta.env[key]);

if (missingFirebaseEnv.length > 0) {
	throw new Error(`Missing Firebase env config: ${missingFirebaseEnv.join(', ')}`);
}

const firebaseConfig: FirebaseOptions = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
