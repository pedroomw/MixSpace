import axios from 'axios';

// Configure axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 60000, // 60 seconds
  headers: {
    'Accept': 'application/json'
  }
});

/**
 * Resolve a plugin login session by delivering the JWT to the waiting plugin.
 * Called by the web frontend after a successful login when ?sessionId is present.
 * @param {string} sessionId - The session ID the plugin generated
 * @param {string} token     - The JWT obtained from login
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
 * Fetch all projects belonging to the authenticated user
 * @returns {Promise<{ok: boolean, projects?: Array, error?: string}>}
 */
export async function getProjects() {
  try {
    const token = localStorage.getItem('mixspace_token');

    const response = await apiClient.get('/projects', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    // Normalise: accept array at root or inside a `projects` key
    const data = response.data;
    const projects = Array.isArray(data) ? data : (data?.projects ?? []);

    return { ok: true, projects };
  } catch (error) {
    let errorMessage = 'No se pudieron cargar los proyectos';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sesión expirada. Vuelva a iniciar sesión';
    } else if (error.response) {
      errorMessage = error.response.data?.error || errorMessage;
    }

    return { ok: false, error: errorMessage, projects: [] };
  }
}

/**
 * Upload a file with metadata to the backend
 * @param {Object} fileData - The upload payload
 * @param {File} fileData.file - The file to upload
 * @param {string} fileData.description - The project description
 * @param {string} fileData.project_id - The project ID
 * @returns {Promise<{ok: boolean, result?: any, error?: string}>}
 */
export async function uploadFile({ file, description, project_id }) {
  try {
    // Retrieve auth token stored during login
    const token = localStorage.getItem('mixspace_token');

    // Create FormData — field names must match what multer/controller expect
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('project_id', project_id);

    // Send POST request to the correct endpoint with Bearer token
    const response = await apiClient.post('/versions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    // Return success response
    return {
      ok: true,
      result: response.data
    };

  } catch (error) {
    // Handle different error types
    let errorMessage = 'Error desconocido. Intente nuevamente';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en localhost:3000';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'La petición excedió el tiempo de espera. Intente nuevamente';
    } else if (error.response) {
      const status = error.response.status;
      
      if (status === 400) {
        // Use specific error message from API if available
        errorMessage = error.response.data?.error || 'Error de validación (código 400)';
      } else if (status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (status >= 500) {
        errorMessage = `Error del servidor (código ${status}). Intente nuevamente más tarde`;
      } else if (status >= 400) {
        errorMessage = error.response.data?.error || `Error de validación (código ${status})`;
      }
    }

    return {
      ok: false,
      error: errorMessage
    };
  }
}

/**
 * Create a new project for the authenticated user
 * @param {Object} projectData
 * @param {string} projectData.name        - Project name (required)
 * @param {string} [projectData.description] - Optional description
 * @returns {Promise<{ok: boolean, project?: Object, error?: string}>}
 */
export async function createProject({ name, description = '' }) {
  try {
    const token = localStorage.getItem('mixspace_token');

    const response = await apiClient.post(
      '/projects',
      { name, description },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    return { ok: true, project: response.data };
  } catch (error) {
    let errorMessage = 'No se pudo crear el proyecto';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sesión expirada. Volvé a iniciar sesión';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.error || 'Datos inválidos';
    } else if (error.response) {
      errorMessage = error.response.data?.error || errorMessage;
    }

    return { ok: false, error: errorMessage };
  }
}

export default {
  resolvePluginSession,
  getProjects,
  createProject,
  uploadFile
};
