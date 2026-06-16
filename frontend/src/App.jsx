import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Search, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  History, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Trash2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lifease-solutions.onrender.com/api';

export default function App() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Scroll to bottom of chat when activeChat or loading changes
  useEffect(() => {
    scrollToBottom();
  }, [activeChat, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch full conversation history from backend
  const fetchHistory = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) throw new Error('Failed to fetch conversation history.');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running on port 5000.');
    }
  };

  // Perform backend search
  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim() === '') {
      fetchHistory();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Submit a new question
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const currentQuestion = inputQuestion.trim();
    setInputQuestion('');
    setLoading(true);
    setError(null);

    // Create a temporary local active chat object immediately for instant feedback
    const tempChat = {
      question: currentQuestion,
      answer: '',
      isPending: true,
      createdAt: new Date().toISOString()
    };
    setActiveChat(tempChat);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to get response from AI assistant.');
      }

      const data = await res.json();
      setActiveChat(data);
      // Refresh the left sidebar history
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please check your backend connection.');
      // Remove temporary pending state
      setActiveChat(null);
    } finally {
      setLoading(false);
    }
  };

  // Select a historical conversation to view in the chat panel
  const selectHistoryItem = (item) => {
    setActiveChat(item);
    setError(null);
  };

  // Clear current active panel to display empty state / dashboard
  const handleNewChat = () => {
    setActiveChat(null);
    setInputQuestion('');
    setError(null);
  };

  // Delete a conversation
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop parent click trigger
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (activeChat && activeChat._id === id) {
          setActiveChat(null);
        }
        fetchHistory();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error(err);
      setError('Could not delete the conversation. Please try again.');
    }
  };

  // Standard sample questions for empty state dashboard
  const sampleQuestions = [
    "What is the difference between SQL and NoSQL databases?",
    "Explain React hooks in simple words with examples.",
    "How does MongoDB index work for search optimization?",
    "What are the benefits of Docker containers?"
  ];

  return (
    <div className="app-container">
      {/* Dynamic Glow Orbs in background */}
      <div className="glow-backdrop">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* Left Sidebar: Logo, Search, and History */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="logo-text">Ahoum FAQ</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI-Powered Assistant</p>
          </div>
        </div>

        <button className="new-chat-button" onClick={handleNewChat}>
          <Plus size={18} />
          <span>New Conversation</span>
        </button>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="history-list">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <History size={12} />
            <span>Chat History ({history.length})</span>
          </div>
          
          {history.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No conversations found.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item._id || item.createdAt}
                className={`history-item ${activeChat && (activeChat._id === item._id || activeChat.question === item.question) ? 'active' : ''}`}
                onClick={() => selectHistoryItem(item)}
              >
                <div className="history-item-question">{item.question}</div>
                <div className="history-item-footer">
                  <span className="history-item-time">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="history-item-badge">Gemini</span>
                    <button 
                      onClick={(e) => handleDelete(e, item._id)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-dark-gray)', 
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-dark-gray)'}
                      title="Delete Conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Main Panel: Active Chat thread or Empty/Dashboard State */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-info">
            <h2 className="chat-header-title">
              {activeChat ? 'Conversation View' : 'FAQ Dashboard'}
            </h2>
            <div className="chat-header-status">
              <span className="status-dot"></span>
              <span>Gemini Engine Active</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Status: <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Ready</span>
          </div>
        </header>

        {/* Messages / Viewport */}
        <div className="messages-container">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.9rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Connection/API Error</strong>
                {error}
              </div>
            </div>
          )}

          {activeChat ? (
            <>
              {/* Question bubble */}
              <div className="message-bubble-wrapper user">
                <div className="message-bubble">
                  {activeChat.question}
                  <span className="message-time">
                    {new Date(activeChat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Answer bubble */}
              <div className="message-bubble-wrapper assistant">
                <div className="message-bubble" style={{ minWidth: '100px' }}>
                  {activeChat.isPending ? (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{activeChat.answer}</div>
                  )}
                  {!activeChat.isPending && (
                    <span className="message-time">
                      {new Date(activeChat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <div ref={messagesEndRef} />
            </>
          ) : (
            /* Empty State Dashboard */
            <div className="empty-state">
              <div className="empty-icon">
                <Sparkles size={36} />
              </div>
              <h3 className="empty-title">Ask the AI Assistant</h3>
              <p className="empty-description">
                Ask any question below. Our FAQ Assistant powered by Google Gemini will answer and store the conversation for later search and lookup.
              </p>
              
              <div className="suggested-questions">
                <div style={{ textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Suggested Topics
                </div>
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="suggested-item"
                    onClick={() => {
                      setInputQuestion(q);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{q}</span>
                      <ArrowRight size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat input block */}
        <div className="input-container">
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask a question..."
              className="chat-input"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={loading || !inputQuestion.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
