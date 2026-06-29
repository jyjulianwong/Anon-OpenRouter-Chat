import { marked } from 'marked';

export default function Message({ message }) {
  const { role, content, _streaming, _error } = message;

  function renderBubble() {
    if (_error) {
      return (
        <div className="bubble">
          <span className="error-text">Error: {_error}</span>
        </div>
      );
    }

    if (role === 'user') {
      let text = '';
      let images = [];
      if (typeof content === 'string') {
        text = content;
      } else if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === 'text') text = part.text;
          if (part.type === 'image_url') images.push(part.image_url.url);
        }
      }
      return (
        <div className="bubble">
          {images.map((src, i) => (
            <img key={i} src={src} className="attached" alt={`Attached image ${i + 1}`} />
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
