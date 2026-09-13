import { marked } from 'marked';

export default function Message({ message }) {
  const { role, content, _streaming, _error } = message;

  function renderBubble() {
    if (_error) {
      return (
        <div className="bubble">
          <div className="error-box" role="alert">
            <svg className="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="13"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>Request failed</strong>
              <p className="error-text">{_error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (role === 'user') {
      let text = '';
      let images = [];
      let videos = [];
      if (typeof content === 'string') {
        text = content;
      } else if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === 'text') text = part.text;
          if (part.type === 'image_url') images.push(part.image_url.url);
          if (part.type === 'video_url') videos.push(part.video_url.url);
        }
      }
      return (
        <div className="bubble">
          {images.map((src, i) => (
            <img key={i} src={src} className="attached" alt={`Attached image ${i + 1}`} />
          ))}
          {videos.map((src, i) => (
            <video key={i} src={src} className="attached" controls />
          ))}
          {text && <p>{text}</p>}
        </div>
      );
    }

    // Assistant message: render markdown
    const text = typeof content === 'string' ? content : '';
    const html = marked.parse(text) + (_streaming ? '<span class="cursor"></span>' : '');
    if (!text && _streaming) {
      return (
        <div className="bubble">
          <span className="cursor" />
        </div>
      );
    }
    return (
      <div className="bubble" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div className={`message ${role}`}>
      <div className="avatar">{role === 'user' ? 'U' : 'AI'}</div>
      {renderBubble()}
    </div>
  );
}
