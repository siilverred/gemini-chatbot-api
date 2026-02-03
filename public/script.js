// DOM Elements
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');
const clearChat = document.getElementById('clear-chat');
const typingIndicator = document.getElementById('typing-indicator');
const charCount = document.getElementById('char-count');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const exportBtn = document.getElementById('export-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const emojiBtn = document.getElementById('emoji-btn');
const attachBtn = document.getElementById('attach-btn');

// Conversation history
let conversationHistory = [];
let settings = {
  theme: localStorage.getItem('theme') || 'auto',
  showTimestamps: localStorage.getItem('showTimestamps') !== 'false',
  soundEffects: localStorage.getItem('soundEffects') !== 'false',
  autoScroll: localStorage.getItem('autoScroll') !== 'false',
  reduceMotion: localStorage.getItem('reduceMotion') === 'true'
};

// Initialize
initializeApp();

function initializeApp() {
  applyTheme(settings.theme);
  loadSettings();
  setupEventListeners();
  autoResizeTextarea();
  
  // Check for system theme preference
  if (settings.theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Clear chat
  clearChat.addEventListener('click', handleClearChat);
  
  // Character counter
  input.addEventListener('input', updateCharCount);
  
  // Settings
  settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
  closeSettings.addEventListener('click', () => settingsModal.classList.remove('show'));
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('show');
  });
  
  // Settings controls
  document.getElementById('theme-select').addEventListener('change', (e) => {
    settings.theme = e.target.value;
    localStorage.setItem('theme', settings.theme);
    applyTheme(settings.theme);
  });
  
  document.getElementById('show-timestamps').addEventListener('change', (e) => {
    settings.showTimestamps = e.target.checked;
    localStorage.setItem('showTimestamps', settings.showTimestamps);
  });
  
  document.getElementById('sound-effects').addEventListener('change', (e) => {
    settings.soundEffects = e.target.checked;
    localStorage.setItem('soundEffects', settings.soundEffects);
  });
  
  document.getElementById('auto-scroll').addEventListener('change', (e) => {
    settings.autoScroll = e.target.checked;
    localStorage.setItem('autoScroll', settings.autoScroll);
  });
  
  document.getElementById('reduce-motion').addEventListener('change', (e) => {
    settings.reduceMotion = e.target.checked;
    localStorage.setItem('reduceMotion', settings.reduceMotion);
    document.body.classList.toggle('reduce-motion', settings.reduceMotion);
  });
  
  // Export chat
  exportBtn.addEventListener('click', exportChat);
  
  // Voice input (placeholder)
  voiceBtn.addEventListener('click', () => {
    showToast('Voice input coming soon!', 'info');
  });
  
  // Emoji picker (placeholder)
  emojiBtn.addEventListener('click', () => {
    const emojis = ['😊', '👍', '❤️', '🎉', '🤔', '💡', '✨', '🚀'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    input.value += emoji;
    input.focus();
  });
  
  // Attach file (placeholder)
  attachBtn.addEventListener('click', () => {
    showToast('File attachment coming soon!', 'info');
  });
  
  // Prompt chips
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('prompt-chip')) {
      input.value = e.target.textContent;
      input.focus();
      autoResizeTextarea();
    }
  });
  
  // Keyboard shortcuts
  input.addEventListener('keydown', handleKeyPress);
  
  // Auto-resize textarea
  input.addEventListener('input', autoResizeTextarea);
}

function applyTheme(theme) {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.body.setAttribute('data-theme', theme);
  }
}

function loadSettings() {
  document.getElementById('theme-select').value = settings.theme;
  document.getElementById('show-timestamps').checked = settings.showTimestamps;
  document.getElementById('sound-effects').checked = settings.soundEffects;
  document.getElementById('auto-scroll').checked = settings.autoScroll;
  document.getElementById('reduce-motion').checked = settings.reduceMotion;
  
  if (settings.reduceMotion) {
    document.body.classList.add('reduce-motion');
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  settings.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  document.getElementById('theme-select').value = newTheme;
  
  // Play sound
  playSound('pop');
  
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(10);
}

function handleClearChat() {
  const modal = createConfirmModal(
    'New Conversation',
    'Are you sure you want to start a new conversation? This cannot be undone.',
    () => {
      chatBox.innerHTML = '';
      conversationHistory = [];
      showWelcomeScreen();
      showToast('Conversation cleared', 'success');
      playSound('clear');
    }
  );
  document.body.appendChild(modal);
}

function updateCharCount() {
  const length = input.value.length;
  charCount.textContent = length;
  charCount.style.color = length > 1800 ? 'var(--danger-color)' : 'var(--text-tertiary)';
}

function autoResizeTextarea() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function handleKeyPress(e) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
}

// Form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage || userMessage.length > 2000) return;

  // Hide welcome screen
  const welcomeScreen = document.querySelector('.welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.opacity = '0';
    setTimeout(() => welcomeScreen.remove(), 300);
  }

  // Add user message
  appendMessage('user', userMessage);
  input.value = '';
  charCount.textContent = '0';
  autoResizeTextarea();
  playSound('send');

  // Add to history
  conversationHistory.push({ role: 'user', text: userMessage });

  // Show typing indicator
  typingIndicator.style.display = 'flex';
  if (settings.autoScroll) scrollToBottom();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: conversationHistory })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    typingIndicator.style.display = 'none';

    if (data.result) {
      appendMessage('bot', data.result);
      conversationHistory.push({ role: 'model', text: data.result });
      playSound('receive');
    } else {
      appendMessage('bot', 'Sorry, I couldn\'t generate a response.');
    }
  } catch (error) {
    console.error('Error:', error);
    typingIndicator.style.display = 'none';
    appendMessage('bot', '⚠️ Unable to connect. Please try again.');
    showToast('Connection error', 'error');
  }

  if (settings.autoScroll) scrollToBottom();
});

function appendMessage(sender, text) {
  const messageWrapper = document.createElement('div');
  messageWrapper.classList.add('message-wrapper', sender);

  const avatar = document.createElement('div');
  avatar.classList.add('message-avatar');
  
  if (sender === 'bot') {
    avatar.innerHTML = `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#avatarGradient)"/>
        <path d="M16 9C15.2 9 14.5 9.7 14.5 10.5V11C12.5 11.6 11 13.4 10.7 15.5H10C9.2 15.5 8.5 16.2 8.5 17C8.5 17.8 9.2 18.5 10 18.5H10.7C11 20.6 12.5 22.4 14.5 23V23.5C14.5 24.3 15.2 25 16 25C16.8 25 17.5 24.3 17.5 23.5V23C19.5 22.4 21 20.6 21.3 18.5H22C22.8 18.5 23.5 17.8 23.5 17C23.5 16.2 22.8 15.5 22 15.5H21.3C21 13.4 19.5 11.6 17.5 11V10.5C17.5 9.7 16.8 9 16 9M13.5 14C13.9 14 14.25 14.35 14.25 14.75C14.25 15.15 13.9 15.5 13.5 15.5C13.1 15.5 12.75 15.15 12.75 14.75C12.75 14.35 13.1 14 13.5 14M18.5 14C18.9 14 19.25 14.35 19.25 14.75C19.25 15.15 18.9 15.5 18.5 15.5C18.1 15.5 17.75 15.15 17.75 14.75C17.75 14.35 18.1 14 18.5 14M16 21C14.1 21 12.5 19.4 12.5 17.5H19.5C19.5 19.4 17.9 21 16 21Z" fill="white"/>
      </svg>
    `;
  } else {
    avatar.innerHTML = `
      <div class="user-avatar">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" fill="currentColor"/>
          <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z" fill="currentColor"/>
        </svg>
      </div>
    `;
  }

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  // CLEAN TEXT - Remove markdown symbols
  const cleanText = text
    .replace(/#{1,6}\s*/g, '')           // Headers #
    .replace(/[*_`]{1,2}/g, '')          // * ** ` ** 
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links [text](url)
    .replace(/\n{3,}/g, '\n\n')          // Multiple newlines
    .trim();

  const bubble = document.createElement('div');
  bubble.classList.add('message-bubble', sender);
  bubble.textContent = cleanText;

  if (settings.showTimestamps) {
    const timestamp = document.createElement('div');
    timestamp.classList.add('message-time');
    timestamp.textContent = formatTime(new Date());
    messageContent.appendChild(bubble);
    messageContent.appendChild(timestamp);
  } else {
    messageContent.appendChild(bubble);
  }

  // Proper order: Bot = avatar + content | User = content + avatar
  if (sender === 'bot') {
    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageContent);
  } else {
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(avatar);
  }

  chatBox.appendChild(messageWrapper);
  
  requestAnimationFrame(() => {
    messageWrapper.classList.add('show');
  });
}

function showWelcomeScreen() {
  chatBox.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon-wrapper">
        <div class="welcome-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="welcomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="32" fill="url(#welcomeGradient)" opacity="0.1"/>
            <circle cx="32" cy="32" r="24" fill="url(#welcomeGradient)" opacity="0.2"/>
            <path d="M32 18C29.8 18 28 19.8 28 22V22.6C23.5 24 20.2 27.8 19.6 32.5H18C15.8 32.5 14 34.3 14 36.5C14 38.7 15.8 40.5 18 40.5H19.6C20.2 45.2 23.5 49 28 50.4V51C28 53.2 29.8 55 32 55C34.2 55 36 53.2 36 51V50.4C40.5 49 43.8 45.2 44.4 40.5H46C48.2 40.5 50 38.7 50 36.5C50 34.3 48.2 32.5 46 32.5H44.4C43.8 27.8 40.5 24 36 22.6V22C36 19.8 34.2 18 32 18M26 30C27.1 30 28 30.9 28 32C28 33.1 27.1 34 26 34C24.9 34 24 33.1 24 32C24 30.9 24.9 30 26 30M38 30C39.1 30 40 30.9 40 32C40 33.1 39.1 34 38 34C36.9 34 36 33.1 36 32C36 30.9 36.9 30 38 30M32 46C27.6 46 24 42.4 24 38H40C40 42.4 36.4 46 32 46Z" fill="url(#welcomeGradient)"/>
          </svg>
        </div>
      </div>
      <h2>Hello! I'm Gemini</h2>
      <p>Your intelligent AI assistant, ready to help with anything you need.</p>
      
      <div class="capabilities">
        <div class="capability-card">
          <div class="capability-icon">💡</div>
          <h3>Creative Ideas</h3>
          <p>Brainstorm and explore new concepts</p>
        </div>
        <div class="capability-card">
          <div class="capability-icon">💻</div>
          <h3>Code Assistant</h3>
          <p>Debug, explain, and write code</p>
        </div>
        <div class="capability-card">
          <div class="capability-icon">📝</div>
          <h3>Writing Help</h3>
          <p>Compose, edit, and refine text</p>
        </div>
        <div class="capability-card">
          <div class="capability-icon">🎓</div>
          <h3>Learn Anything</h3>
          <p>Explain complex topics simply</p>
        </div>
      </div>

      <div class="quick-prompts">
        <h4>Try asking:</h4>
        <div class="prompts-grid">
          <button class="prompt-chip">Explain quantum computing simply</button>
          <button class="prompt-chip">Write a Python function for sorting</button>
          <button class="prompt-chip">Create a morning routine plan</button>
          <button class="prompt-chip">Help me brainstorm app ideas</button>
        </div>
      </div>
    </div>
  `;
}

function scrollToBottom() {
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: settings.reduceMotion ? 'auto' : 'smooth'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function exportChat() {
  if (conversationHistory.length === 0) {
    showToast('No conversation to export', 'info');
    return;
  }
  
  const text = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'You' : 'Gemini AI'}: ${msg.text}`)
    .join('\n\n');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gemini-chat-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Chat exported successfully', 'success');
  playSound('export');
}

function createConfirmModal(title, message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content glass confirm-modal">
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary cancel-btn">Cancel</button>
        <button class="btn-danger confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  
  modal.querySelector('.cancel-btn').onclick = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.querySelector('.confirm-btn').onclick = () => {
    onConfirm();
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  };
  
  return modal;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = {
    success: '✓',
    error: '✕',
    info: 'ⓘ'
  }[type];
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
  `;
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function playSound(type) {
  if (!settings.soundEffects) return;
  
  // Placeholder for sound effects
  const sounds = {
    send: 440,
    receive: 523,
    pop: 659,
    clear: 349,
    export: 587
  };
  
  const freq = sounds[type];
  if (!freq || !window.AudioContext) return;
  
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.frequency.value = freq;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.1);
}
