import { safeFetch, API_BASE_URL, getAuthHeaders } from './apiClient.js';

export const rewardService = {
  /**
   * Fetch all reward items in the shop
   */
  async getRewards(token) {
    return safeFetch(`${API_BASE_URL}/rewards`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Failed to fetch shop rewards');
  },

  /**
   * Fetch authenticated user's owned inventory
   */
  async getInventory(token) {
    return safeFetch(`${API_BASE_URL}/rewards/inventory`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Failed to fetch inventory');
  },

  /**
   * Purchase a reward item by ID
   */
  async purchaseReward(id, token) {
    return safeFetch(`${API_BASE_URL}/rewards/${id}/purchase`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    }, 'Failed to purchase reward');
  },
};

