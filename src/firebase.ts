
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

type FirebaseEnvKey = (typeof requiredFirebaseEnv)[number] | 'VITE_FIREBASE_MEASUREMENT_ID';

type RuntimeFirebaseConfig = Partial<Record<FirebaseEnvKey, string>>;

declare global {
	interface Window {
		__FIREBASE_CONFIG__?: RuntimeFirebaseConfig;
	}
}

const runtimeFirebaseConfig: RuntimeFirebaseConfig =
	typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ ? window.__FIREBASE_CONFIG__ : {};

const readFirebaseValue = (key: FirebaseEnvKey): string => {
	const envValue = import.meta.env[key]?.trim();
	if (envValue) return envValue;

	const runtimeValue = runtimeFirebaseConfig[key]?.trim();
	if (runtimeValue) return runtimeValue;

	return '';
};

const missingFirebaseEnv = requiredFirebaseEnv.filter((key) => !readFirebaseValue(key));

if (missingFirebaseEnv.length > 0) {
	throw new Error(`Missing Firebase env config: ${missingFirebaseEnv.join(', ')}`);
}

const firebaseConfig: FirebaseOptions = {
	apiKey: readFirebaseValue('VITE_FIREBASE_API_KEY'),
	appId: readFirebaseValue('VITE_FIREBASE_APP_ID'),
	messagingSenderId: readFirebaseValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
	projectId: readFirebaseValue('VITE_FIREBASE_PROJECT_ID'),
	authDomain: readFirebaseValue('VITE_FIREBASE_AUTH_DOMAIN'),
	storageBucket: readFirebaseValue('VITE_FIREBASE_STORAGE_BUCKET'),
	measurementId: readFirebaseValue('VITE_FIREBASE_MEASUREMENT_ID') || undefined,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
