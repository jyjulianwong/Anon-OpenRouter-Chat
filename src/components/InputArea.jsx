import { useState, useRef, useEffect } from 'react';

export default function InputArea({ streaming, pendingImages, onImagesChange, onSubmit }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const canSend = !streaming && (text.trim() !== '' || pendingImages.length > 0);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [text]);

  function handleSend() {
    if (!canSend) return;
    onSubmit(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handlePaste(e) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (!imageItems.length) return;
    e.preventDefault();
    const newImages = [];
    let loaded = 0;
    for (const item of imageItems) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target.result);
        loaded++;
        if (loaded === imageItems.length) {
          onImagesChange(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImages = [];
    let loaded = 0;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target.result);
        loaded++;
        if (loaded === files.length) {
          onImagesChange(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }

  function removeImage(index) {
    onImagesChange(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="format-toolbar" aria-hidden="true">
        <select className="fmt-select fmt-font" tabIndex={-1} disabled>
          <option>Tahoma</option>
          <option>Arial</option>
          <option>Comic Sans MS</option>
          <option>Times New Roman</option>
        </select>
        <select className="fmt-select fmt-size" tabIndex={-1} disabled>
          <option>10</option>
          <option>12</option>
          <option>14</option>
        </select>
        <span className="fmt-sep" />
        <button className="fmt-btn" tabIndex={-1} title="Bold"><b>B</b></button>
        <button className="fmt-btn" tabIndex={-1} title="Italic"><i>I</i></button>
        <button className="fmt-btn" tabIndex={-1} title="Underline"><u>U</u></button>
        <span className="fmt-sep" />
        <button className="fmt-btn fmt-color" tabIndex={-1} title="Text colour">
          <span>A</span>
        </button>
        <button className="fmt-btn fmt-emoji" tabIndex={-1} title="Emoticons">☺</button>
      </div>

      <div className="input-wrapper">
        {pendingImages.length > 0 && (
          <div className="image-preview-bar">
            {pendingImages.map((src, i) => (
              <div key={i} className="image-preview-item">
                <img src={src} alt={`Attached image ${i + 1}`} />
                <button
                  className="remove-image-btn"
                  aria-label="Remove image"
                  onClick={() => removeImage(i)}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="input-row">
          <textarea
            id="message-input"
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type a message..."
            rows={1}
            aria-label="Message input"
          />
        </div>
      </div>

      <div className="input-actions">
        <button
          className="xp-toolbar-btn icon-btn"
          onClick={() => fileInputRef.current.click()}
          aria-label="Attach image"
          title="Attach image"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          Attach
        </button>
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          Send
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </>
  );
}
