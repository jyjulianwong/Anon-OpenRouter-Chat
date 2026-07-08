import { useState, useRef, useEffect, useCallback } from 'react';
import TitleBar from './components/TitleBar.jsx';
import Header from './components/Header.jsx';
import MessageList from './components/MessageList.jsx';
import InputArea from './components/InputArea.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { streamChat } from './utils/openrouter.js';
import { DEFAULT_SETTINGS } from './config.js';

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? '';

function loadSettings() {
  try {
    const stored = localStorage.getItem('anon-chat-settings');
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const messagesRef = useRef(null);
  const accumulatedRef = useRef('');

  useEffect(() => {
    localStorage.setItem('anon-chat-settings', JSON.stringify(settings));
  }, [settings]);

  function scrollToBottom() {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async (text) => {
    if (streaming || (!text.trim() && pendingImages.length === 0)) return;

    let content;
    if (pendingImages.length > 0) {
      content = [];
      if (text.trim()) content.push({ type: 'text', text: text.trim() });
      for (const img of pendingImages) {
        content.push({ type: 'image_url', image_url: { url: img } });
      }
    } else {
      content = text.trim();
    }

    const userMsg = { role: 'user', content };

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', _streaming: true }]);
    setPendingImages([]);
    setStreaming(true);
    accumulatedRef.current = '';

    // Capture current messages + new user message for the API call
    // (we read from the closure at call time, not from stale state)
    const apiHistory = [...messages, userMsg];
    const apiMessages = settings.systemPrompt
      ? [{ role: 'system', content: settings.systemPrompt }, ...apiHistory]
      : apiHistory;

    try {
      await streamChat({
        workerUrl: WORKER_URL,
        messages: apiMessages,
        settings,
        onChunk(chunk) {
          accumulatedRef.current += chunk;
          const text = accumulatedRef.current;
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: text, _streaming: true },
          ]);
        },
        onError(err) {
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: '', _error: err },
          ]);
        },
      });

      const finalText = accumulatedRef.current;
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: finalText },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '', _error: err.message || 'Network error' },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, pendingImages, settings, streaming]);

  const handleNewChat = useCallback(() => {
    if (streaming) return;
    setMessages([]);
    setPendingImages([]);
  }, [streaming]);

  const handleExport = useCallback(() => {
    if (messages.length === 0) return;
    const exportMsgs = messages.map(({ _streaming, _error, ...msg }) => msg);
    const json = JSON.stringify(exportMsgs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const handleExportSettings = useCallback(() => {
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const handleImport = useCallback((imported) => {
    if (!Array.isArray(imported)) {
      alert('Failed to import: not a valid chat file.');
      return;
    }
    setMessages(imported);
    setPendingImages([]);
  }, []);

  const handleImportSettings = useCallback((imported) => {
    if (typeof imported !== 'object' || Array.isArray(imported) || imported === null) {
      alert('Failed to import: not a valid settings file.');
      return;
    }
    setSettings(prev => ({ ...prev, ...imported }));
  }, []);

  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  }, []);

  return (
    <div className="layout">
      <header className="header">
        <TitleBar />
        <Header
          onNewChat={handleNewChat}
          onExport={handleExport}
          onExportSettings={handleExportSettings}
          onImport={handleImport}
          onImportSettings={handleImportSettings}
          onSettings={() => setShowSettings(true)}
          streaming={streaming}
          hasMessages={messages.length > 0}
        />
      </header>
      <main className="messages" ref={messagesRef}>
        <MessageList messages={messages} />
      </main>
      <footer className="input-area">
        <InputArea
          streaming={streaming}
          pendingImages={pendingImages}
          onImagesChange={setPendingImages}
          onSubmit={handleSubmit}
        />
      </footer>
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
