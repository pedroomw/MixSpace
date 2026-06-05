import { useState } from 'react';
import FileSelector from './FileSelector';
import MetadataInput from './MetadataInput';
import UploadButton from './UploadButton';
import StatusMessage from './StatusMessage';
import { uploadFile } from '../services/apiClient';
import './FileUploadForm.css';

function FileUploadForm() {
  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [projectID, setProjectID] = useState('');
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadAttempted, setUploadAttempted] = useState(false);

  // Handle file selection
  const handleFileChange = (file) => {
    setSelectedFile(file);
    setUploadStatus('idle');
    setStatusMessage('');
  };

  // Validate form before submission
  const validateForm = () => {
    // Check if file is selected
    if (!selectedFile) {
      setUploadStatus('error');
      setStatusMessage('Debe seleccionar un archivo');
      return false;
    }

    // Check if filename is provided
    if (!filename.trim()) {
      setUploadStatus('error');
      setStatusMessage('El nombre del archivo es obligatorio');
      return false;
    }

    // Check if description is provided
    if (!description.trim()) {
      setUploadStatus('error');
      setStatusMessage('La descripción es obligatoria');
      return false;
    }

    // Check if projectID is provided
    if (!projectID.trim()) {
      setUploadStatus('error');
      setStatusMessage('El ID del proyecto es obligatorio');
      return false;
    }

    // Check file size (100 MB limit for backend)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (selectedFile.size > maxSize) {
      setUploadStatus('error');
      setStatusMessage('El archivo excede el límite de 100 MB');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set uploading state
    setIsUploading(true);
    setUploadAttempted(true);
    setUploadStatus('uploading');
    setStatusMessage('Subiendo archivo...');

    try {
      // Upload file
      const result = await uploadFile({
        file: selectedFile,
        filename: filename.trim(),
        description: description.trim(),
        projectID: projectID.trim()
      });

      if (result.ok) {
        // Success
        setUploadStatus('success');
        setStatusMessage('Archivo subido exitosamente');
        
        // Reset form after short delay
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        // Error from API
        setUploadStatus('error');
        setStatusMessage(result.error || 'Error al subir el archivo');
      }
    } catch (error) {
      // Unexpected error
      setUploadStatus('error');
      setStatusMessage('Error inesperado. Intente nuevamente');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setSelectedFile(null);
    setFilename('');
    setDescription('');
    setProjectID('');
    setUploadStatus('idle');
    setStatusMessage('');
    setUploadAttempted(false);
  };

  // Retry upload (keeps file and metadata)
  const handleRetry = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="upload-form-container">
      <form className="upload-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Subir Proyecto FL Studio</h2>
        
        <FileSelector
          selectedFile={selectedFile}
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <MetadataInput
          id="filename"
          label="Nombre del archivo"
          value={filename}
          onChange={setFilename}
          maxLength={255}
          required={true}
          disabled={isUploading}
        />

        <MetadataInput
          id="description"
          label="Descripción"
          value={description}
          onChange={setDescription}
          maxLength={1000}
          required={true}
          disabled={isUploading}
          type="textarea"
        />

        <MetadataInput
          id="projectID"
          label="ID del proyecto"
          value={projectID}
          onChange={setProjectID}
          maxLength={100}
          required={true}
          disabled={isUploading}
        />

        <div className="form-actions">
          <UploadButton
            onClick={handleSubmit}
            disabled={isUploading}
            isUploading={isUploading}
          />
        </div>

        <StatusMessage status={uploadStatus} message={statusMessage} />
      </form>
    </div>
  );
}

export default FileUploadForm;
