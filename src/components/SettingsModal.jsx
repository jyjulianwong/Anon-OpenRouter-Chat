import { useState, useEffect } from 'react';
import TitleBar from './TitleBar.jsx';
import { AVAILABLE_MODELS } from '../config.js';

function formatTemp(value) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? value : n.toFixed(1);
}

export default function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({
    ...settings,
    temperature: formatTemp(settings.temperature),
  });
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    if (!modelOpen) return;
    function handleOutside() { setModelOpen(false); }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [modelOpen]);

  function set(key, value) {
    setLocal(prev => ({ ...prev, [key]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    onSave(local);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-window">
        <TitleBar />
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Model</label>
              <div className="xp-dropdown-wrap" onMouseDown={e => e.stopPropagation()}>
                <button
                  type="button"
                  className="xp-toolbar-btn"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={() => setModelOpen(o => !o)}
                >
                  {local.model}
                  <span className="dropdown-arrow">&#9662;</span>
                </button>
                {modelOpen && (
                  <div className="xp-dropdown-menu" style={{ width: '100%' }}>
                    {AVAILABLE_MODELS.map(m => (
                      <button
                        key={m}
                        type="button"
                        className="xp-dropdown-item"
                        onClick={() => { set('model', m); setModelOpen(false); }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-field">
              <label htmlFor="s-temp">Temperature</label>
              <input
                id="s-temp"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={local.temperature}
                onChange={e => {
                  const typed = /^(insert|delete)/.test(e.nativeEvent.inputType || '');
                  set('temperature', typed ? e.target.value : formatTemp(e.target.value));
                }}
                onBlur={e => set('temperature', formatTemp(e.target.value))}
              />
              <p className="field-hint">0.0 – 2.0 (default 1.0)</p>
            </div>
            <div className="modal-field">
              <label htmlFor="s-maxtok">Max tokens</label>
              <input
                id="s-maxtok"
                type="number"
                min="1"
                value={local.maxTokens}
                onChange={e => set('maxTokens', e.target.value)}
                placeholder="Leave blank for model default"
              />
            </div>
            <div className="modal-field">
              <label htmlFor="s-system">System prompt</label>
              <textarea
                id="s-system"
                value={local.systemPrompt}
                onChange={e => set('systemPrompt', e.target.value)}
                placeholder="Optional system prompt…"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="xp-toolbar-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="xp-toolbar-btn send-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
