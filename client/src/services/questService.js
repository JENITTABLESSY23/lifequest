import { safeFetch, API_BASE_URL, getAuthHeaders } from './apiClient.js';

export const questService = {
  async getQuests(token) {
    return safeFetch(`${API_BASE_URL}/quests`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Failed to fetch quests');
  },

  async getQuest(id, token) {
    return safeFetch(`${API_BASE_URL}/quests/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Failed to fetch quest');
  },

  async createQuest(questData, token) {
    return safeFetch(`${API_BASE_URL}/quests`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(questData),
    }, 'Failed to create quest');
  },

  async updateQuest(id, questData, token) {
    return safeFetch(`${API_BASE_URL}/quests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(questData),
    }, 'Failed to update quest');
  },

  async deleteQuest(id, token) {
    return safeFetch(`${API_BASE_URL}/quests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    }, 'Failed to delete quest');
  },

  async completeQuest(id, token) {
    return safeFetch(`${API_BASE_URL}/quests/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    }, 'Failed to complete quest');
  },

  async getActivity(token) {
    return safeFetch(`${API_BASE_URL}/quests/activity`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Failed to fetch activity');
  },
};

