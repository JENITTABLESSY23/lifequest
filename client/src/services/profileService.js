import { safeFetch, API_BASE_URL, getAuthHeaders } from './apiClient.js';

/**
 * Fetch authenticated user's complete character profile
 */
export const getProfile = async (token) => {
  return safeFetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders(token),
  }, 'Failed to fetch character profile');
};

/**
 * Fetch canonical achievements with user unlock status
 */
export const getAchievements = async (token) => {
  return safeFetch(`${API_BASE_URL}/achievements`, {
    headers: getAuthHeaders(token),
  }, 'Failed to fetch achievements');
};

