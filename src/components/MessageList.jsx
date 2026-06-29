import Message from './Message.jsx';

export default function MessageList({ messages, containerRef }) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <ellipse cx="19" cy="22" rx="14" ry="18" fill="#f47920" opacity="0.55" transform="rotate(-18 19 22)"/>
            <ellipse cx="37" cy="22" rx="14" ry="18" fill="#f47920" opacity="0.55" transform="rotate(18 37 22)"/>
            <ellipse cx="19" cy="36" rx="12" ry="15" fill="#fbb040" opacity="0.55" transform="rotate(18 19 36)"/>
            <ellipse cx="37" cy="36" rx="12" ry="15" fill="#fbb040" opacity="0.55" transform="rotate(-18 37 36)"/>
            <ellipse cx="28" cy="29" rx="3.5" ry="14" fill="#3a2000" opacity="0.7"/>
            <circle cx="28" cy="15" r="5" fill="#4a3010" opacity="0.7"/>
          </svg>
        </div>
        <p className="empty-title">No messages yet</p>
        <p className="empty-sub">Type a message below and click Send to start chatting.</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, i) => (
        <Message key={i} message={msg} />
      ))}
    </>
  );
}
