export default function TitleBar() {
  return (
    <div className="xp-titlebar">
      <div className="xp-titlebar-left">
        <svg className="xp-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <ellipse cx="5.5" cy="6.5" rx="4.2" ry="5.5" fill="#f47920" opacity="0.92" transform="rotate(-18 5.5 6.5)"/>
          <ellipse cx="10.5" cy="6.5" rx="4.2" ry="5.5" fill="#f47920" opacity="0.92" transform="rotate(18 10.5 6.5)"/>
          <ellipse cx="5.5" cy="10.5" rx="3.8" ry="4.5" fill="#fbb040" opacity="0.85" transform="rotate(18 5.5 10.5)"/>
          <ellipse cx="10.5" cy="10.5" rx="3.8" ry="4.5" fill="#fbb040" opacity="0.85" transform="rotate(-18 10.5 10.5)"/>
          <ellipse cx="8" cy="8.5" rx="1.1" ry="4.5" fill="#3a2000"/>
          <circle cx="8" cy="4.5" r="1.6" fill="#4a3010"/>
        </svg>
        <span className="xp-titlebar-text">Anon OpenRouter Chat – Conversation</span>
      </div>
      <div className="xp-window-controls" aria-hidden="true">
        <button className="xp-ctrl xp-ctrl-min" tabIndex={-1}>–</button>
        <button className="xp-ctrl xp-ctrl-max" tabIndex={-1}>□</button>
        <button className="xp-ctrl xp-ctrl-close" tabIndex={-1}>✕</button>
      </div>
    </div>
  );
}
