import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const ChatBot = ({ isOpen, onClose, context = 'general' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside detection to close/shrink chatbot
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the toggle button itself (handled via parent state)
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/chat/send`,
        { message: userMessage, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to get response from AI';
      setMessages(prev => [...prev, { role: 'error', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className="fixed bottom-6 right-6 w-[320px] sm:w-[350px] h-[390px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-100 overflow-hidden transition-all duration-300 transform scale-100 hover:scale-[1.01]"
    >
      {/* Header - Royal Indigo Premium Theme (NO Pink) */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-750 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FiMessageSquare size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <span className="font-bold text-sm tracking-wide">AI Career Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 p-1.5 rounded-lg text-white/90 hover:text-white transition"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-12 px-4">
            <FiMessageSquare size={36} className="mx-auto mb-3 text-indigo-300" />
            <p className="text-sm font-semibold text-slate-800">Ask your AI Placement Coach</p>
            <p className="text-xs text-slate-400 mt-1">Get instant insights on interview prep, skill requirements, or role advice tailored to your active profile.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                  : msg.role === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex space-x-1.5 items-center py-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs disabled:bg-slate-50 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center"
        >
          <FiSend size={14} />
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
