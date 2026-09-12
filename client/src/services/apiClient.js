export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * Resilient fetch wrapper:
 * - Catches network connectivity failures gracefully
 * - Safely handles non-JSON (HTML/proxy) responses
 * - Dispatches 'lifequest:unauthorized' on 401 to clear expired sessions
 * - Extracts clean error message with fallback
 */
export async function safeFetch(url, options = {}, defaultErrorMessage = 'Request failed') {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    const error = new Error('Network error: Unable to reach the server. Please check your connection.');
    error.isNetworkError = true;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch (jsonErr) {
    // Response was not JSON (e.g. 502/503 HTML error)
  }

  if (!res.ok) {
    const hasAuthHeader = Boolean(
      options.headers &&
      (options.headers.Authorization || options.headers.authorization)
    );
    if (res.status === 401 && hasAuthHeader && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lifequest:unauthorized'));
    }

    const message = data?.message || data?.error?.message || `${defaultErrorMessage} (Status ${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }


  return data || {};
}
