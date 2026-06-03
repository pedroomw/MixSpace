import { useState } from 'react';
import './FileSelector.css';

function FileSelector({ selectedFile, onChange, disabled }) {
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      onChange(null);
      setError('');
      return;
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.flp')) {
      setError('Solo se aceptan archivos .flp');
      onChange(null);
      return;
    }

    // Validate file size (500 MB = 500 * 1024 * 1024 bytes)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo excede el límite de 500 MB');
      onChange(null);
      return;
    }

    // File is valid
    setError('');
    onChange(file);
  };

  const truncateFilename = (filename) => {
    if (filename.length <= 50) {
      return filename;
    }
    return filename.substring(0, 47) + '...';
  };

  return (
    <div className="file-selector">
      <label htmlFor="file-input" className="file-selector-label">
        Seleccionar Archivo
      </label>
      
      <div className="file-input-wrapper">
        <input
          id="file-input"
          type="file"
          accept=".flp"
          onChange={handleFileChange}
          disabled={disabled}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-button" tabIndex={disabled ? -1 : 0}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a.75.75 0 01.75.75v5.25H16a.75.75 0 010 1.5h-5.25V16a.75.75 0 01-1.5 0v-5.25H4a.75.75 0 010-1.5h5.25V4.25A.75.75 0 0110 3.5z" />
          </svg>
          Elegir archivo .flp
        </label>
        
        {selectedFile && (
          <div className="file-name">
            📁 {truncateFilename(selectedFile.name)}
          </div>
        )}
      </div>

      {error && (
        <div className="file-selector-error" role="alert">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default FileSelector;
