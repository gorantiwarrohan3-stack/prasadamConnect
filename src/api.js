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
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
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
	return apiRequest(`/api/login-history/${uid}?limit=${limit}`, {
		method: 'GET',
	});
}

/**
 * Get user profile
 */
export async function getUserProfile(uid) {
	return apiRequest(`/api/user/${uid}`, {
		method: 'GET',
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

