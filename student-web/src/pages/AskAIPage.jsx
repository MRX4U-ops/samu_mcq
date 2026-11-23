import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Image as ImageIcon, X, ChevronLeft, Loader, BrainCircuit } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import styles from './AskAIPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

export default function AskAIPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am SAMU AI. Ask me any medical question or upload an image of a medical question to get a detailed explanation.',
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        file,
        preview: reader.result,
        base64: reader.result.split(',')[1]
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = { role: 'user', content: input, image: selectedImage?.preview };
    setMessages(prev => [...prev, userMessage]);
    
    const requestText = input;
    const requestImage = selectedImage?.base64;
    
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsLoading(true);

    try {
      let response;
      if (requestImage) {
        response = await fetch(`${API_BASE_URL}/api/ai/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: requestImage,
            prompt: requestText || 'Please analyze this medical image.'
          })
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: requestText,
            language: 'English'
          })
        });
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.reply || data.analysis || data.answer || "I'm sorry, I couldn't process that."
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Link to="/home" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 12 }}>
              <ChevronLeft size={18} />
              <span style={{ fontSize: 13, fontWeight: 'bold' }}>Back</span>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrainCircuit size={32} color="#fbbf24" />
            <div>
              <h1 className={styles.headerTitle}>Ask AI</h1>
              <p className={styles.headerSub}>Your personal medical AI tutor. Powered by Llama 3.3 70B.</p>
            </div>
          </div>
        </div>

        <div className={styles.chatBox}>
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.role === 'user' ? styles.msgUser : styles.msgAI}>
              {msg.image && (
                <img src={msg.image} alt="User upload" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
              )}
              {msg.content}
            </div>
          ))}
          
          {isLoading && (
            <div className={styles.msgAI}>
              <div className={styles.typing}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {selectedImage && (
          <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={selectedImage.preview} alt="Preview" style={{ height: 60, borderRadius: 8, border: '2px solid #4f46e5' }} />
              <button 
                onClick={removeImage} 
                style={{ position: 'absolute', top: -8, right: -8, background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 8 }}
          >
            <ImageIcon size={22} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          
          <textarea
            className={styles.textArea}
            placeholder="Ask a medical question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            rows={1}
            style={{ paddingTop: 8 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <button 
            type="submit" 
            className={styles.sendBtn}
            disabled={isLoading || (!input.trim() && !selectedImage)}
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
