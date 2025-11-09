/**
 * API utility for communicating with Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	if (config.body && typeof config.body === 'object') {
		config.body = JSON.stringify(config.body);
	}

	try {
		const response = await fetch(url, config);

		// Try to parse JSON, but handle non-JSON responses gracefully
		let data;
		let bodyText;
		try {
			bodyText = await response.text();
			data = bodyText ? JSON.parse(bodyText) : null;
		} catch (parseError) {
			// If JSON parsing fails, use the raw text as the body
			data = null;
		}

		if (!response.ok) {
			// Construct error message from parsed JSON or raw text
			const errorMessage = data?.error || data?.message || bodyText || 'Unknown error';
			const error = new Error(errorMessage);
			error.status = response.status;
			error.statusText = response.statusText;
			error.body = bodyText;
			throw error;
		}

		return data;
	} catch (error) {
		console.error('API request failed:', error);
		throw error;
	}
}

/**
 * Check if user exists by phone number
 */
export async function checkUserExists(phoneNumber) {
	return apiRequest('/api/check-user', {
		method: 'POST',
		body: { phoneNumber },
	});
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
	return apiRequest('/api/register', {
		method: 'POST',
		body: userData,
	});
}

/**
 * Atomically create a new user and record their login history in a single transaction.
 * This ensures both operations succeed or both fail together.
 */
export async function createUserWithLogin(userData) {
	return apiRequest('/api/create-user-with-login', {
		method: 'POST',
		body: userData,
	});
}

/**
 * Record login history
 */
export async function recordLogin(uid, phoneNumber) {
	return apiRequest('/api/login-history', {
		method: 'POST',
		body: { uid, phoneNumber },
	});
}

/**
 * Get login history for a user
 */
export async function getLoginHistory(uid, limit = 50) {
	// Validate and coerce limit to a safe integer
	const safeLimit = Math.max(1, Math.min(Number.parseInt(limit, 10) || 50, 1000));
	
	// Construct URL with encoded path parameter and query string
	const url = new URL(`/api/login-history/${encodeURIComponent(uid)}`, API_BASE_URL);
	url.searchParams.set('limit', safeLimit.toString());
	
	return apiRequest(url.pathname + url.search, {
		method: 'GET',
	});
}

/**
 * Get user profile
 */
export async function getUserProfile(uid) {
	return apiRequest(`/api/user/${encodeURIComponent(uid)}`, {
		method: 'GET',
	});
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid, userData) {
	return apiRequest(`/api/user/${encodeURIComponent(uid)}`, {
		method: 'PUT',
		body: userData,
	});
}

/**
 * Unregister a user (rollback endpoint for cleanup)
 */
export async function unregisterUser(uid) {
	return apiRequest('/api/unregister', {
		method: 'POST',
		body: { uid },
	});
}

/**
 * Health check
 */
export async function healthCheck() {
	return apiRequest('/health', {
		method: 'GET',
	});
}

