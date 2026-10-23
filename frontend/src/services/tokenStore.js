/**
 * tokenStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized token storage abstraction.
 *
 * Currently backed by localStorage (browser environment).
 * If the app is ever migrated to Electron, swap this implementation for
 * `keytar` (https://github.com/atom/node-keytar), which persists credentials
 * in the Windows Credential Manager / macOS Keychain:
 *
 *   const keytar = require('keytar');
 *   const SERVICE = 'MixSpace';
 *   export const getTokens     = () => keytar.findCredentials(SERVICE);
 *   export const setTokens     = (at, rt) => keytar.setPassword(SERVICE, 'access_token', at)
 *                                            .then(() => keytar.setPassword(SERVICE, 'refresh_token', rt));
 *   export const clearTokens   = () => keytar.deletePassword(SERVICE, 'access_token')
 *                                      .then(() => keytar.deletePassword(SERVICE, 'refresh_token'));
 * ─────────────────────────────────────────────────────────────────────────────
 */

const KEYS = {
  ACCESS_TOKEN:  'mixspace_token',
  REFRESH_TOKEN: 'mixspace_refresh_token',
  USER:          'mixspace_user',
};

/**
 * Persist both tokens.
 * @param {string} accessToken
 * @param {string} [refreshToken]
 */
export function setTokens(accessToken, refreshToken) {
  if (accessToken)  localStorage.setItem(KEYS.ACCESS_TOKEN,  accessToken);
  if (refreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
}

/**
 * Read both tokens.
 * @returns {{ accessToken: string|null, refreshToken: string|null }}
 */
export function getTokens() {
  return {
    accessToken:  localStorage.getItem(KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(KEYS.REFRESH_TOKEN),
  };
}

/**
 * Remove all auth-related entries.
 */
export function clearTokens() {
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
}

/**
 * Persist the user profile object.
 * @param {Object} user
 */
export function setUser(user) {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

/**
 * Read the stored user profile.
 * @returns {Object|null}
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove the stored user profile.
 */
export function clearUser() {
  localStorage.removeItem(KEYS.USER);
}

/**
 * Clear everything (tokens + user).
 */
export function clearAll() {
  clearTokens();
  clearUser();
}
