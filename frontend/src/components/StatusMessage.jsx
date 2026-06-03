import './StatusMessage.css';

function StatusMessage({ status, message }) {
  if (status === 'idle' || !message) {
    return null;
  }

  const getClassName = () => {
    const baseClass = 'status-message';
    if (status === 'success') return `${baseClass} status-success`;
    if (status === 'error') return `${baseClass} status-error`;
    if (status === 'uploading') return `${baseClass} status-uploading`;
    return baseClass;
  };

  const getIcon = () => {
    if (status === 'success') return '✓';
    if (status === 'error') return '✕';
    if (status === 'uploading') return <div className="spinner-small"></div>;
    return null;
  };

  return (
    <div className={getClassName()} role={status === 'error' ? 'alert' : 'status'}>
      <span className="status-icon">{getIcon()}</span>
      <span className="status-text">{message}</span>
    </div>
  );
}

export default StatusMessage;
