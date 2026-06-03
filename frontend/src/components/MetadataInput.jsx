import './MetadataInput.css';

function MetadataInput({ 
  id, 
  label, 
  value, 
  onChange, 
  maxLength, 
  required = false, 
  disabled = false, 
  type = 'text' 
}) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="metadata-input">
      <label htmlFor={id} className="metadata-label">
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>
      
      <InputComponent
        id={id}
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className="metadata-field"
        rows={type === 'textarea' ? 4 : undefined}
      />
      
      <div className="character-count">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}

export default MetadataInput;
