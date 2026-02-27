const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2';

// NOTE FOR USER: PLease put your prompt inside this variable between the backticks!
const SYSTEM_PROMPT = `You are an expert software tester. I will provide you with a component, class, or functionality description.
Your goal is to generate comprehensive, production-ready test cases.
Follow best practices, test both happy paths and edge cases, and output the result in clean code.
Avoid extra explanations, just output the test structure.`;

const elements = {
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    connDot: document.getElementById('connection-dot'),
    connStatus: document.getElementById('connection-status')
};

let isGenerating = false;
let messageContext = [
    { role: 'system', content: SYSTEM_PROMPT }
];

// Setup Marked.js and Highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

// Auto-resize textarea
elements.userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Check Ollama Connection
async function checkConnection() {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            elements.connDot.className = 'dot online';
            elements.connStatus.textContent = 'Ollama Connected';
            return true;
        }
    } catch (e) {
        elements.connDot.className = 'dot offline';
        elements.connStatus.textContent = 'Ollama Offline (Start local server)';
        return false;
    }
}

// Handle Enter to send (Shift+Enter for newline)
elements.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

elements.sendBtn.addEventListener('click', sendMessage);

function addMessageToUI(type, content) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;

    let avatarIcon = type === 'user' ? '👤' : '🤖';

    div.innerHTML = `
        <div class="avatar">${avatarIcon}</div>
        <div class="message-content"></div>
    `;

    const contentDiv = div.querySelector('.message-content');

    // If it's HTML/Markdown
    if (type !== 'user') {
        contentDiv.innerHTML = marked.parse(content);
    } else {
        contentDiv.textContent = content; // pure text for user input
    }

    elements.chatHistory.appendChild(div);
    scrollToBottom();
    return contentDiv;
}

function addLoadingIndicator() {
    const div = document.createElement('div');
    div.className = 'message bot-message loading-indicator';
    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    elements.chatHistory.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
}

async function sendMessage() {
    const text = elements.userInput.value.trim();
    if (!text || isGenerating) return;

    // Reset input
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';

    // Add User message
    addMessageToUI('user', text);
    messageContext.push({ role: 'user', content: text });

    // Add loading
    const loadingEl = addLoadingIndicator();
    isGenerating = true;
    elements.sendBtn.disabled = true;

    try {
        const isOnline = await checkConnection();
        if (!isOnline) throw new Error("Ollama is not running locally on port 11434.");

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messageContext,
                stream: true
            })
        });

        if (!response.ok) throw new Error("Failed to communicate with the model.");

        // Remove loading
        loadingEl.remove();

        // Setup streaming UI message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `<div class="avatar">🤖</div><div class="message-content"></div>`;
        elements.chatHistory.appendChild(messageDiv);
        const contentDiv = messageDiv.querySelector('.message-content');

        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\\n');

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message && parsed.message.content) {
                            fullResponse += parsed.message.content;
                            contentDiv.innerHTML = marked.parse(fullResponse);
                            scrollToBottom();
                        }
                    } catch (e) {
                        // Incomplete JSON chunk, typically handled gracefully in full implementations
                    }
                }
            }
        }

        // Complete
        messageContext.push({ role: 'assistant', content: fullResponse });

        // Highlight code block after streaming is done and add Copy button
        contentDiv.querySelectorAll('pre').forEach((block) => {
            // Check if we already have a wrapper/button
            if (!block.classList.contains('code-block-wrapper')) {
                // Ensure the block is positioned relative for absolute button placement
                block.style.position = 'relative';
                block.classList.add('code-block-wrapper');

                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.innerHTML = '📋 Copy';
                copyBtn.title = 'Copy code to clipboard';

                copyBtn.addEventListener('click', () => {
                    const code = block.querySelector('code');
                    if (code) {
                        navigator.clipboard.writeText(code.innerText).then(() => {
                            copyBtn.innerHTML = '✅ Copied!';
                            setTimeout(() => {
                                copyBtn.innerHTML = '📋 Copy';
                            }, 2000);
                        });
                    }
                });

                block.appendChild(copyBtn);
            }

            const codeElem = block.querySelector('code');
            if (codeElem) {
                hljs.highlightElement(codeElem);
            }
        });

    } catch (err) {
        loadingEl.remove();
        addMessageToUI('system', `**Error:** ${err.message}`);
    } finally {
        isGenerating = false;
        elements.sendBtn.disabled = false;
        elements.userInput.focus();
    }
}

// Initial Check
checkConnection();
