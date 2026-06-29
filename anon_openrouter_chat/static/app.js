// Conversation history in OpenAI message format
let messages = [];
// Base64 data URLs of attached images
let pendingImages = [];
// Whether a response is currently streaming
let streaming = false;

const messagesEl = document.getElementById("messages");
const emptyState = document.getElementById("empty-state");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const attachBtn = document.getElementById("attach-btn");
const fileInput = document.getElementById("file-input");
const imagePreviewBar = document.getElementById("image-preview-bar");
const newChatBtn = document.getElementById("new-chat-btn");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");

marked.setOptions({ gfm: true, breaks: true });

// ── Textarea auto-resize ─────────────────────────────────────────────────────

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = messageInput.scrollHeight + "px";
  updateSendBtn();
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) submit();
  }
});

function updateSendBtn() {
  sendBtn.disabled = streaming || (messageInput.value.trim() === "" && pendingImages.length === 0);
}

// ── Image attachment ─────────────────────────────────────────────────────────

attachBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);
  if (!files.length) return;
  let loaded = 0;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImages.push(e.target.result);
      loaded++;
      if (loaded === files.length) {
        renderImagePreviews();
        updateSendBtn();
      }
    };
    reader.readAsDataURL(file);
  }
  fileInput.value = "";
});

function renderImagePreviews() {
  imagePreviewBar.innerHTML = "";
  if (pendingImages.length === 0) {
    imagePreviewBar.classList.add("hidden");
    return;
  }
  imagePreviewBar.classList.remove("hidden");
  pendingImages.forEach((dataUrl, i) => {
    const item = document.createElement("div");
    item.className = "image-preview-item";
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = `Attached image ${i + 1}`;
    const btn = document.createElement("button");
    btn.className = "remove-image-btn";
    btn.setAttribute("aria-label", "Remove image");
    btn.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    btn.addEventListener("click", () => {
      pendingImages.splice(i, 1);
      renderImagePreviews();
      updateSendBtn();
    });
    item.appendChild(img);
    item.appendChild(btn);
    imagePreviewBar.appendChild(item);
  });
}

function clearPendingImages() {
  pendingImages = [];
  renderImagePreviews();
  updateSendBtn();
}

// ── New chat ─────────────────────────────────────────────────────────────────

newChatBtn.addEventListener("click", () => {
  if (streaming) return;
  messages = [];
  messagesEl.innerHTML = "";
  messagesEl.appendChild(emptyStateEl());
  clearPendingImages();
  messageInput.value = "";
  messageInput.style.height = "auto";
  updateSendBtn();
});

function emptyStateEl() {
  const el = document.createElement("div");
  el.className = "empty-state";
  el.id = "empty-state";
  el.innerHTML = `
    <div class="empty-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <p>Start a conversation</p>
  `;
  return el;
}

// ── Export / Import ──────────────────────────────────────────────────────────

exportBtn.addEventListener("click", () => {
  if (messages.length === 0) return;
  const json = JSON.stringify(messages, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFileInput.click());

importFileInput.addEventListener("change", () => {
  const file = importFileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error();
      messages = imported;
      rebuildChatUI();
    } catch {
      alert("Failed to import: not a valid chat file.");
    }
  };
  reader.readAsText(file);
  importFileInput.value = "";
});

function rebuildChatUI() {
  messagesEl.innerHTML = "";
  if (messages.length === 0) {
    messagesEl.appendChild(emptyStateEl());
    return;
  }
  for (const msg of messages) {
    if (msg.role === "user") {
      let text = "";
      let images = [];
      if (typeof msg.content === "string") {
        text = msg.content;
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === "text") text = part.text;
          if (part.type === "image_url") images.push(part.image_url.url);
        }
      }
      addUserBubble(text, images);
    } else if (msg.role === "assistant") {
      const bubble = addAssistantBubble();
      finalizeMessage(bubble, typeof msg.content === "string" ? msg.content : "");
    }
  }
  scrollToBottom();
}

// ── Send ─────────────────────────────────────────────────────────────────────

sendBtn.addEventListener("click", submit);

async function submit() {
  const text = messageInput.value.trim();
  if (streaming || (!text && pendingImages.length === 0)) return;

  // Remove empty state
  const es = document.getElementById("empty-state");
  if (es) es.remove();

  // Build message content
  let content;
  if (pendingImages.length > 0) {
    content = [];
    if (text) content.push({ type: "text", text });
    for (const img of pendingImages) {
      content.push({ type: "image_url", image_url: { url: img } });
    }
  } else {
    content = text;
  }

  const userMsg = { role: "user", content };
  messages.push(userMsg);

  addUserBubble(text, pendingImages.slice());
  clearPendingImages();
  messageInput.value = "";
  messageInput.style.height = "auto";
  updateSendBtn();

  streaming = true;
  updateSendBtn();

  const bubble = addAssistantBubble();
  let rawText = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      showError(bubble, err.detail || "Request failed");
      messages.pop();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") break;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            showError(bubble, parsed.error);
            messages.pop();
            return;
          }
          if (parsed.content) {
            rawText += parsed.content;
            renderStreaming(bubble, rawText);
          }
        } catch {}
      }
    }

    finalizeMessage(bubble, rawText);
    messages.push({ role: "assistant", content: rawText });
  } catch (err) {
    showError(bubble, err.message || "Network error");
    messages.pop();
  } finally {
    streaming = false;
    updateSendBtn();
    scrollToBottom();
  }
}

// ── DOM helpers ──────────────────────────────────────────────────────────────

function addUserBubble(text, images) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerHTML = `
    <div class="avatar">U</div>
    <div class="bubble user-bubble"></div>
  `;
  const bubble = msg.querySelector(".bubble");
  if (Array.isArray(images)) {
    for (let i = 0; i < images.length; i++) {
      const img = document.createElement("img");
      img.src = images[i];
      img.className = "attached";
      img.alt = `Attached image ${i + 1}`;
      bubble.appendChild(img);
    }
  }
  if (text) {
    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);
  }
  messagesEl.appendChild(msg);
  scrollToBottom();
}

function addAssistantBubble() {
  const msg = document.createElement("div");
  msg.className = "message assistant";
  msg.innerHTML = `
    <div class="avatar">AI</div>
    <div class="bubble"><span class="cursor"></span></div>
  `;
  messagesEl.appendChild(msg);
  scrollToBottom();
  return msg.querySelector(".bubble");
}

function renderStreaming(bubble, rawText) {
  bubble.innerHTML = marked.parse(rawText) + '<span class="cursor"></span>';
  scrollToBottom();
}

function finalizeMessage(bubble, rawText) {
  if (rawText) {
    bubble.innerHTML = marked.parse(rawText);
  } else {
    bubble.innerHTML = '<span class="error-text">No response.</span>';
  }
}

function showError(bubble, message) {
  bubble.innerHTML = `<span class="error-text">Error: ${escapeHtml(message)}</span>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
