import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

// Configure via Vite env or inline constants
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper to ensure reCAPTCHA exists once per session
export function getOrCreateRecaptcha(containerId = 'recaptcha-container') {
	// Clean up existing verifier if it exists
	if (window._rfpwaRecaptchaVerifier) {
		try {
			window._rfpwaRecaptchaVerifier.clear();
		} catch (e) {
			// Ignore errors if already cleared
		}
		window._rfpwaRecaptchaVerifier = null;
	}

	// Ensure container exists
	const container = document.getElementById(containerId);
	if (!container) {
		console.warn(`reCAPTCHA container ${containerId} not found`);
		return null;
	}

	// Create new verifier
	try {
		window._rfpwaRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
			size: 'invisible',
			callback: () => {
				// reCAPTCHA solved
			},
		});
		return window._rfpwaRecaptchaVerifier;
	} catch (error) {
		console.error('Error creating reCAPTCHA verifier:', error);
		return null;
	}
}

// Cleanup function
export function clearRecaptcha() {
	if (window._rfpwaRecaptchaVerifier) {
		try {
			window._rfpwaRecaptchaVerifier.clear();
		} catch (e) {
			// Ignore errors
		}
		window._rfpwaRecaptchaVerifier = null;
	}
}
