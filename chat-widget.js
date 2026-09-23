class ChatWidget {
  constructor(containerId, apiUrl = 'http://localhost:5000') {
    this.container = document.getElementById(containerId);
    this.apiUrl = apiUrl;
    this.conversationId = null;
    this.isLoading = false;
    this.init();
  }

  async init() {
    this.render();
    await this.createConversation();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-widget">
        <div class="chat-header">
          <h3>Chat with AI</h3>
          <p>Ask me anything</p>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <form class="chat-form" id="chatForm">
          <input
            type="text"
            id="chatInput"
            placeholder="Type your message..."
            class="chat-input"
            disabled
          />
          <button type="submit" class="chat-send" id="chatSend" disabled>
            <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
              <path d="M8.5.5a.5.5 0 0 0-.5.5v11.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 12.793V1a.5.5 0 0 0-.5-.5z"/>
            </svg>
          </button>
        </form>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    form.addEventListener('submit', (e) => this.handleSendMessage(e));
  }

  async createConversation() {
    try {
      const response = await fetch(`${this.apiUrl}/api/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Portfolio Chat' })
      });

      if (!response.ok) throw new Error('Failed to create conversation');

      const data = await response.json();
      this.conversationId = data.conversation_id;

      // Enable input
      document.getElementById('chatInput').disabled = false;
      document.getElementById('chatSend').disabled = false;

      this.addMessage('assistant', 'Hi! I\'m an AI assistant. Ask me anything about Tanish\'s work or skills.');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      this.addMessage('assistant', 'Sorry, I couldn\'t start a conversation. Please refresh the page.');
    }
  }

  async handleSendMessage(e) {
    e.preventDefault();

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message || this.isLoading || !this.conversationId) return;

    input.value = '';
    this.addMessage('user', message);
    this.isLoading = true;
    this.showLoadingState();

    try {
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: this.conversationId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      this.removeLoadingState();
      this.addMessage('assistant', data.assistant_message);
    } catch (error) {
      console.error('Error:', error);
      this.removeLoadingState();
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message--${role}`;
    messageEl.textContent = content;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showLoadingState() {
    const messagesContainer = document.getElementById('chatMessages');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'chat-message chat-message--assistant chat-loading';
    loadingEl.id = 'loadingMessage';
    loadingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeLoadingState() {
    const loadingEl = document.getElementById('loadingMessage');
    if (loadingEl) loadingEl.remove();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatWidget');
  if (chatContainer) {
    // Use deployed API URL, fallback to localhost for development
    const apiUrl = window.CHATBOT_API_URL || 'http://localhost:5000';
    new ChatWidget('chatWidget', apiUrl);
  }
});
