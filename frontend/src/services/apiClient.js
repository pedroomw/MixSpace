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

export default {
  uploadFile
};
