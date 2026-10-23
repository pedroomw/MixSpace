import axios from 'axios';
import { getTokens, setTokens, clearAll } from './tokenStore';
import { refreshAccessToken } from '../api/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Request interceptor — attach Bearer token automatically
// ─────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Refresh-token state (shared across concurrent requests)
// ─────────────────────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

/** Notify all queued requests that a new access token is available. */
function onRefreshSuccess(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/** Notify all queued requests that the refresh failed. */
function onRefreshFailure(error) {
  refreshSubscribers.forEach((cb) => cb(null, error));
  refreshSubscribers = [];
}

/**
 * Queue a request until the ongoing refresh resolves.
 * Returns a promise that re-issues the original request once a token is available.
 */
function queueRequest(originalRequest) {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push((newToken, err) => {
      if (err || !newToken) return reject(err || new Error('Refresh failed'));
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(apiClient(originalRequest));
    });
  });
}

/** Callback invoked when all refresh attempts fail — wipe auth and reload. */
function handleAuthExpired() {
  clearAll();
  // Soft redirect: let the React app re-render the Login screen
  window.dispatchEvent(new CustomEvent('mixspace:auth:expired'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Response interceptor — transparent refresh on 401
// ─────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't been retried already
    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh endpoint itself (avoid infinite loop)
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleAuthExpired();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    const { refreshToken } = getTokens();

    if (!refreshToken) {
      handleAuthExpired();
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return queueRequest(originalRequest);
    }

    isRefreshing = true;

    try {
      const data = await refreshAccessToken(refreshToken);
      const newAccessToken  = data.access_token;
      const newRefreshToken = data.refresh_token ?? refreshToken; // rotate if provided

      setTokens(newAccessToken, newRefreshToken);

      onRefreshSuccess(newAccessToken);
      isRefreshing = false;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshFailure(refreshError);
      handleAuthExpired();
      return Promise.reject(refreshError);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a plugin login session by delivering the JWT to the waiting plugin.
 * @param {string} sessionId
 * @param {string} token
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function resolvePluginSession(sessionId, token) {
  try {
    await apiClient.post(`/auth/plugin-session/${sessionId}/resolve`, { token });
    return { ok: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || 'No se pudo resolver la sesión del plugin';
    return { ok: false, error: errorMessage };
  }
}

/**
 * Fetch all projects belonging to the authenticated user.
 * @returns {Promise<{ok: boolean, projects?: Array, error?: string}>}
 */
export async function getProjects() {
  try {
    const response = await apiClient.get('/projects');
    const data = response.data;
    const projects = Array.isArray(data) ? data : (data?.projects ?? []);
    return { ok: true, projects };
  } catch (error) {
    let errorMessage = 'No se pudieron cargar los proyectos';
    if (error.code === 'ECONNREFUSED')         errorMessage = 'No se pudo conectar con el servidor';
    else if (error.response?.status === 401)   errorMessage = 'Sesión expirada. Volvé a iniciar sesión';
    else if (error.response)                   errorMessage = error.response.data?.error || errorMessage;
    return { ok: false, error: errorMessage, projects: [] };
  }
}

/**
 * Upload a file with metadata.
 * @param {{ file: File, description: string, project_id: string, tags?: string[] }} fileData
 * @returns {Promise<{ok: boolean, result?: any, error?: string}>}
 */
export async function uploadFile({ file, description, project_id, tags = [] }) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('project_id', project_id);
    formData.append('tags', JSON.stringify(tags));

    const response = await apiClient.post('/versions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { ok: true, result: response.data };
  } catch (error) {
    let errorMessage = 'Error desconocido. Intente nuevamente';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en localhost:3000';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'La petición excedió el tiempo de espera. Intente nuevamente';
    } else if (error.response) {
      const status = error.response.status;
      if (status === 400)       errorMessage = error.response.data?.error || 'Error de validación (código 400)';
      else if (status === 413)  errorMessage = 'El archivo es demasiado grande';
      else if (status >= 500)   errorMessage = `Error del servidor (código ${status}). Intente nuevamente más tarde`;
      else if (status >= 400)   errorMessage = error.response.data?.error || `Error de validación (código ${status})`;
    }

    return { ok: false, error: errorMessage };
  }
}

/**
 * Create a new project.
 * @param {{ name: string, description?: string, tags?: string[] }} projectData
 * @returns {Promise<{ok: boolean, project?: Object, error?: string}>}
 */
export async function createProject({ name, description = '', tags = [] }) {
  try {
    const response = await apiClient.post('/projects', { name, description, tags });
    return { ok: true, project: response.data };
  } catch (error) {
    let errorMessage = 'No se pudo crear el proyecto';
    if (error.code === 'ECONNREFUSED')         errorMessage = 'No se pudo conectar con el servidor';
    else if (error.response?.status === 401)   errorMessage = 'Sesión expirada. Volvé a iniciar sesión';
    else if (error.response?.status === 400)   errorMessage = error.response.data?.error || 'Datos inválidos';
    else if (error.response)                   errorMessage = error.response.data?.error || errorMessage;
    return { ok: false, error: errorMessage };
  }
}

/**
 * Download a version file by ID and trigger a browser download.
 * @param {string|number} id
 * @param {string} filename
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function downloadVersion(id, filename) {
  try {
    const { accessToken } = getTokens();

    const response = await fetch(`http://localhost:3000/versions/download/${id}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body.error || `Error ${response.status}` };
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename || `version_${id}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || 'Error al descargar' };
  }
}

/**
 * Update tags on a specific version.
 * @param {string|number} id
 * @param {string[]} tags
 * @returns {Promise<{ok: boolean, result?: any, error?: string}>}
 */
export async function updateVersionTags(id, tags) {
  try {
    const response = await apiClient.patch(`/versions/${id}/tags`, { tags });
    return { ok: true, result: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar etiquetas';
    return { ok: false, error: errorMessage };
  }
}

/**
 * Fetch the authenticated user's profile.
 * @returns {Promise<{ok: boolean, user?: Object, error?: string}>}
 */
export async function getMe() {
  try {
    const response = await apiClient.get('/auth/me');
    return { ok: true, user: response.data };
  } catch (error) {
    let errorMessage = 'No se pudo cargar el perfil';
    if (error.code === 'ECONNREFUSED')         errorMessage = 'No se pudo conectar con el servidor';
    else if (error.response?.status === 401)   errorMessage = 'Sesión expirada. Volvé a iniciar sesión';
    else if (error.response)                   errorMessage = error.response.data?.error || errorMessage;
    return { ok: false, error: errorMessage };
  }
}

/**
 * Update the visibility (public/private) of a project.
 * @param {string|number} id
 * @param {boolean} isPublic
 * @returns {Promise<{ok: boolean, project?: Object, error?: string}>}
 */
export async function setProjectVisibility(id, isPublic) {
  try {
    const response = await apiClient.patch(`/projects/${id}/visibility`, { public: isPublic });
    return { ok: true, project: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'No se pudo cambiar la visibilidad';
    return { ok: false, error: errorMessage };
  }
}

export default {
  resolvePluginSession,
  getMe,
  getProjects,
  createProject,
  setProjectVisibility,
  uploadFile,
  downloadVersion,
  updateVersionTags,
};
