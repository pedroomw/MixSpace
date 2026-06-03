import './UploadButton.css';

function UploadButton({ onClick, disabled, isUploading }) {
  return (
    <button
      className="upload-button"
      onClick={onClick}
      disabled={disabled || isUploading}
      type="button"
    >
      {isUploading ? (
        <>
          <div className="spinner"></div>
          Subiendo...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a.75.75 0 01.75.75v6.5H16a.75.75 0 010 1.5h-5.25v6.5a.75.75 0 01-1.5 0v-6.5H4a.75.75 0 010-1.5h5.25v-6.5A.75.75 0 0110 3z" />
          </svg>
          Subir Archivo
        </>
      )}
    </button>
  );
}

export default UploadButton;
