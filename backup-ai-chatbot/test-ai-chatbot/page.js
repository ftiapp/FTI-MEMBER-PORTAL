'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './AIChatbot.module.css';

export default function TestAIChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef(null);
  const [initializing, setInitializing] = useState(true);

  // เลื่อนไปที่ข้อความล่าสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // โหลดข้อความทักทายเมื่อเริ่มต้น
  useEffect(() => {
    if (initializing) {
      setInitializing(false);
      
      // เพิ่มข้อความทักทายจากบอท
      setMessages([
        { 
          type: 'bot', 
          text: 'สวัสดีครับ ผมเป็นแชทบอทอัจฉริยะที่เรียนรู้จากโค้ดและเอกสารของ FTI Member Portal โดยอัตโนมัติ คุณสามารถถามคำถามเกี่ยวกับระบบได้เลยครับ',
          suggestedQuestions: [
            'วิธีการลงทะเบียนสมาชิกใหม่',
            'วิธีการแก้ไขข้อมูลที่อยู่',
            'วิธีการอัปโหลดโลโก้บริษัท',
            'วิธีการติดต่อผู้ดูแลระบบ',
            'วิธีการเปลี่ยนรหัสผ่าน'
          ]
        }
      ]);

      // เตรียมข้อมูลสำหรับ Vector Database
      initializeVectorStore();
    }
  }, [initializing]);

  // เตรียมข้อมูลสำหรับ Vector Database
  const initializeVectorStore = async () => {
    try {
      const response = await fetch('/api/ai-faq', {
        method: 'GET'
      });
      
      const data = await response.json();
      console.log('Vector store initialization:', data);
    } catch (error) {
      console.error('Error initializing vector store:', error);
    }
  };

  // เลื่อนไปที่ข้อความล่าสุด
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ส่งคำถามไปยัง API
  const sendQuestion = async (question) => {
    if (!question.trim()) return;
    
    // เพิ่มข้อความของผู้ใช้
    setMessages(prev => [...prev, { type: 'user', text: question }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      const data = await response.json();
      
      // เพิ่มข้อความของบอท
      setMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          text: data.answer,
          suggestedQuestions: data.suggestedQuestions || []
        }
      ]);
    } catch (error) {
      console.error('Error sending question:', error);
      setMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          text: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถาม กรุณาลองใหม่อีกครั้ง',
          suggestedQuestions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // จัดการการส่งคำถาม
  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  // จัดการการคลิกคำถามแนะนำ
  const handleSuggestedQuestionClick = (question) => {
    sendQuestion(question);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>แชทบอทอัจฉริยะ FTI Member Portal</h1>
        <p>แชทบอทนี้เรียนรู้จากโค้ดและเอกสารของโปรเจคโดยอัตโนมัติ</p>
      </div>

      {showChat && (
        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.botMessage}`}>
                <div className={styles.messageContent}>
                  {message.text}
                </div>
                {message.type === 'bot' && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                  <div className={styles.suggestedResponsesContainer}>
                    {message.suggestedQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        className={styles.suggestedResponse}
                        onClick={() => handleSuggestedQuestionClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.loadingIndicator}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}
            >
              ส่ง
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
