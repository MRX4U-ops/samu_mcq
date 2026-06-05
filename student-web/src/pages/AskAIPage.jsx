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
        // analyze-image route: backend expects { imageBase64 }
        response = await fetch(`${API_BASE_URL}/api/ai/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: requestImage,   // raw base64, no data: prefix
            prompt: requestText || 'Please analyze this medical image.'
          })
        });
      } else {
        // /ask route: backend expects { question }
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
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <div className={styles.titleWrap}>
            <BrainCircuit size={32} color="#EC4899" />
            <h1 className={styles.title}>Ask AI</h1>
          </div>
          <p className={styles.sub}>Your personal medical AI tutor. Powered by Llama 3.3 70B.</p>
        </div>

        <div className={styles.chatBox}>
          <div className={styles.messagesList}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.wrapperUser : styles.wrapperAi}`}>
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                  {msg.role === 'assistant' && <Bot size={18} className={styles.bubbleIcon} />}
                  
                  <div className={styles.bubbleContent}>
                    {msg.image && (
                      <img src={msg.image} alt="User upload" className={styles.uploadedImage} />
                    )}
                    {msg.content && <p className={styles.messageText}>{msg.content}</p>}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
                <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                  <Loader size={18} className={styles.spin} />
                  <p className={styles.messageText}>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.inputArea}>
            {selectedImage && (
              <div className={styles.imagePreviewWrap}>
                <img src={selectedImage.preview} alt="Preview" className={styles.imagePreview} />
                <button type="button" onClick={removeImage} className={styles.removeImageBtn}>
                  <X size={14} />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <button 
                type="button" 
                className={styles.attachBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
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
              
              <input
                type="text"
                className={styles.inputField}
                placeholder="Ask a medical question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
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
      </div>
    </div>
  );
}
