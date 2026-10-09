import { useState } from 'react';
import './TagPicker.css';

// Sugerencias predefinidas — el usuario puede usar estas o escribir las suyas
const SUGGESTED_TAGS = [
  'final', 'demo', 'wip', 'AV',
  'remix', 'drumless', 'phonk', 'mix',
  'master', 'vocal', 'beat', 'instrumental',
  'draft', 'v2', 'collab',
];

/**
 * TagPicker — selector de etiquetas reutilizable
 *
 * Props:
 *   tags       – string[], array de etiquetas seleccionadas (controlled)
 *   onChange   – (newTags: string[]) => void
 *   disabled   – boolean
 *   label      – string, label del campo (default: "Etiquetas")
 */
function TagPicker({ tags = [], onChange, disabled = false, label = 'Etiquetas' }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (raw) => {
    const val = raw.trim().toLowerCase();
    if (!val || val.length > 24) return;
    if (tags.map(t => t.toLowerCase()).includes(val)) return;
    if (tags.length >= 8) return; // límite de 8 tags
    onChange([...tags, val]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Filtra sugerencias: solo las que no están ya seleccionadas y coinciden con el input
  const filtered = SUGGESTED_TAGS.filter(s =>
    !tags.map(t => t.toLowerCase()).includes(s.toLowerCase()) &&
    (inputValue === '' || s.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <div className="tagpicker">
      {label && (
        <span className="tagpicker-label">
          {label} <span className="tagpicker-hint">(opcional)</span>
        </span>
      )}

      {/* Input box con chips inline */}
      <div
        className={`tagpicker-field${disabled ? ' tagpicker-field--disabled' : ''}`}
        onClick={() => !disabled && document.getElementById('tagpicker-input')?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="tp-chip">
            {tag}
            {!disabled && (
              <button
                type="button"
                className="tp-chip-remove"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                aria-label={`Quitar etiqueta ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {!disabled && tags.length < 8 && (
          <input
            id="tagpicker-input"
            className="tp-input"
            type="text"
            placeholder={tags.length === 0 ? 'remix, phonk, final…' : ''}
            value={inputValue}
            maxLength={24}
            disabled={disabled}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
        )}
      </div>

      {/* Sugerencias desplegables */}
      {showSuggestions && filtered.length > 0 && !disabled && (
        <div className="tp-suggestions">
          {filtered.slice(0, 8).map(s => (
            <button
              key={s}
              type="button"
              className="tp-suggestion"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <span className="tagpicker-count">{tags.length}/8 etiquetas</span>
      )}
    </div>
  );
}

export default TagPicker;
