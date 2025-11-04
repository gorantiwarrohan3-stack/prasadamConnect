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

// Mutex to prevent concurrent reCAPTCHA initialization
let _isInitializing = false;

// Helper to ensure reCAPTCHA exists once per session
export function getOrCreateRecaptcha(containerId = 'recaptcha-container') {
	// If verifier already exists and is valid, return it immediately
	// This avoids unnecessary cleanup/recreation cycles
	if (window._rfpwaRecaptchaVerifier) {
		try {
			// Verify the verifier is still valid by checking if it has a render method
			if (window._rfpwaRecaptchaVerifier.render) {
				return window._rfpwaRecaptchaVerifier;
			}
		} catch (e) {
			// Verifier is invalid, clear it and continue with initialization
			window._rfpwaRecaptchaVerifier = null;
		}
	}

	// Guard: prevent concurrent initialization
	// If initialization is in progress, return existing verifier or null
	// This prevents race conditions from rapid successive calls
	if (_isInitializing) {
		// Return whatever exists (might be null if init hasn't completed)
		return window._rfpwaRecaptchaVerifier || null;
	}

	// Set mutex flag to prevent concurrent initialization
	_isInitializing = true;

	try {
		// Clean up existing verifier if it exists (only once at start of init)
		// This cleanup is now protected by the mutex, so concurrent calls won't interfere
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

		// Create new verifier (synchronous operation)
		// This is now protected by the mutex, preventing concurrent creation
		window._rfpwaRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
			size: 'invisible',
			callback: () => {
				// reCAPTCHA solved
			},
		});

		return window._rfpwaRecaptchaVerifier;
	} catch (error) {
		console.error('Error creating reCAPTCHA verifier:', error);
		window._rfpwaRecaptchaVerifier = null;
		return null;
	} finally {
		// Always release mutex
		_isInitializing = false;
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
	// Reset mutex flag to ensure clean state
	_isInitializing = false;
}
