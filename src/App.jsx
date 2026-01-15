import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Bot, User, Trash2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'Hello! I am your immaculate AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Step 1: Send to n8n Webhook
      const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      // n8n might return an array or a single object depending on the Respond to Webhook node
      const answer = Array.isArray(data) ? data[0] : data;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: answer.output || answer.message || answer.answer || (typeof answer === 'string' ? answer : 'I processed your request, but I couldn\'t find a specific answer.')
      }]);

    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please check your connection or endpoint configuration.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <button className="new-chat-btn">
          <Plus size={18} />
          New Chat
        </button>

        <div style={{ flex: 1 }}>
          {/* Chat history would go here */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '0.5rem' }}>
            Experimental Chatbot v1.0
          </div>
        </div>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <User size={16} />
            <span>Guest User</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="chat-messages">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${msg.role}`}
              >
                <div className="avatar" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: msg.role === 'ai' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="message ai"
            >
              <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <Bot size={18} />
              </div>
              <div className="message-content" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>●</motion.span>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>●</motion.span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              placeholder="Message your AI..."
              rows="1"
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            AI can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
