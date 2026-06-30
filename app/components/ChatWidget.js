'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authProvider';
import { MessageSquare, X, Send, Bot, User, Activity, Camera, Maximize2, Minimize2 } from 'lucide-react';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello. I am the CivicTech Command Assistant. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText, image }]);
    setInput('');
    const currentImage = image;
    setImage(null);
    setIsLoading(true);

    try {
      // Only send the text history to save bandwidth, exclude images from history
      const historyToSend = messages.map(m => ({ role: m.role, text: m.text }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, userContext: user, image: currentImage, history: historyToSend })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: data.text,
          actions: data.actions,
          intent: data.intent 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "Error communicating with AI core." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Network error. AI core offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            width: 56, 
            height: 56, 
            borderRadius: '50%',
            padding: 0,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="card-elevated"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isMaximized ? 'min(800px, calc(100vw - 48px))' : 360,
            height: isMaximized ? 'min(800px, calc(100vh - 48px))' : 500,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--border-light)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>CivicTech Assistant</div>
                <div style={{ fontSize: 12, color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Activity size={10} /> Online - ML Core Active
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setIsMaximized(!isMaximized)} className="btn btn-ghost" style={{ padding: 6 }}>
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-main)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div 
                  style={{ 
                    maxWidth: '85%', 
                    padding: '12px 16px', 
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Upload" style={{ width: '100%', borderRadius: 4, marginBottom: 8 }} />
                  )}
                  {msg.role === 'assistant' && msg.intent && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                      Intent: {msg.intent.replace('_', ' ')}
                    </div>
                  )}
                  {/* Super basic markdown rendering for bold text and links */}
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--primary); text-decoration: underline; font-weight: 500;">$1</a>')
                  }} />
                </div>
                
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {msg.actions.map((act, i) => (
                      <Link 
                        key={i} 
                        href={act.href}
                        className="btn btn-secondary"
                        onClick={() => setIsOpen(false)}
                        style={{ padding: '6px 12px', fontSize: 12, height: 'auto', minHeight: 0 }}
                      >
                        {act.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, padding: '0 12px' }}>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <span className="animate-pulse">Generating response on Google Cloud CPU (please wait)...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border-light)' }}>
            {image && (
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                <img src={image} alt="Preview" style={{ height: 40, borderRadius: 4, border: '1px solid var(--border-light)' }} />
                <button 
                  onClick={() => setImage(null)}
                  style={{ position: 'absolute', top: -6, right: -6, background: 'var(--status-critical)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '0 12px', color: 'var(--text-muted)' }}
              >
                <Camera size={18} />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about reports, XP, or the AI..."
                className="input"
                style={{ flex: 1, borderRadius: 20, paddingLeft: 16 }}
                disabled={isLoading}
              />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !input.trim()}
              style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={18} />
            </button>
          </form>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Note: Generation may take 30-40 seconds as the AI runs entirely on Google Cloud CPUs.
          </div>
        </div>
        </div>
      )}
    </>
  );
}
