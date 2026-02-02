const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Maintain conversation history
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI
  appendMessage('user', userMessage);
  input.value = '';

  // Add user message to history
  conversationHistory.push({ role: 'user', text: userMessage });

  // Show temporary "Thinking..." message
  const botMessageDiv = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation: conversationHistory })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.result) {
      // Replace "Thinking..." with actual response
      botMessageDiv.textContent = data.result;
      // Add model response to history
      conversationHistory.push({ role: 'model', text: data.result });
    } else {
      botMessageDiv.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Error:', error);
    botMessageDiv.textContent = 'Failed to get response from server.';
  }

  // Ensure chat box is scrolled to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
