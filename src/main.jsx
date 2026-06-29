import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import './index.css';
import App from './App.jsx';

marked.use({ gfm: true, breaks: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
