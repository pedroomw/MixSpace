import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const registerUser = async (email, password, country, username) => {
  const response = await axios.post(`${API_URL}/auth/register`, { email, password, country, username });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

/**
 * Exchange a refresh token for a new access token (and optionally a new refresh token).
 * The backend should return: { access_token: string, refresh_token?: string }
 *
 * @param {string} refreshToken
 * @returns {Promise<{ access_token: string, refresh_token?: string }>}
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
  return response.data;
};
