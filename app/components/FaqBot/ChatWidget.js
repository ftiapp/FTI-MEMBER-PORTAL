'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';
import SuggestedResponse from './SuggestedResponse';
import Link from 'next/link';

// Helper function to format dashboard links in messages
const formatMessageWithLinks = (message) => {
  if (!message) return '';
  
  // Define dashboard sections and their corresponding URLs
  const dashboardLinks = {
    'แดชบอร์ด': '/dashboard',
    'ข้อมูลสมาชิก': '/dashboard/profile',
    'ที่อยู่': '/dashboard/address',
    'สินค้า/บริการ': '/dashboard/products',
    'โลโก้': '/dashboard/logo',
    'ติดต่อเรา': '/dashboard/contact',
    'ตั้งค่า': '/dashboard/settings',
    'ชำระเงิน': '/dashboard/payment',
  };
  
  let formattedMessage = message;
  
  // Replace dashboard section names with links
  Object.entries(dashboardLinks).forEach(([section, url]) => {
    const regex = new RegExp(`("${section}"|${section})`, 'g');
    formattedMessage = formattedMessage.replace(regex, `<a href="${url}" class="${styles.dashboardLink}">${section}</a>`);
  });
  
  return formattedMessage;
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [initialMessageShown, setInitialMessageShown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Show initial welcome message and suggested questions when chat opens
  useEffect(() => {
    if (isOpen && !initialMessageShown) {
      // Fetch top 5 FAQs for initial suggestions
      const fetchInitialSuggestions = async () => {
        try {
          const response = await fetch('/api/faq?limit=5');
          const data = await response.json();
          
          let initialSuggestions = [];
          if (data.success && data.data && data.data.length > 0) {
            initialSuggestions = data.data.map(faq => faq.question).slice(0, 5);
          } else {
            // Default suggestions if API fails
            initialSuggestions = [
              'วิธีการสมัครสมาชิก',
              'วิธีการยืนยันตัวตน',
              'วิธีการแก้ไขข้อมูลที่อยู่',
              'วิธีการเพิ่มสินค้าหรือบริการ',
              'วิธีการอัปโหลดโลโก้บริษัท'
            ];
          }
          
          setMessages([
            { 
              type: 'bot', 
              content: 'สวัสดีครับ! ผมเป็น FTI MEMBER PORTAL CHAT BOT สามารถถามคำถามเกี่ยวกับการใช้งานระบบได้เลยครับ',
              suggestions: initialSuggestions
            }
          ]);
          setInitialMessageShown(true);
        } catch (error) {
          console.error('Error fetching initial suggestions:', error);
          // Use default suggestions if API fails
          setMessages([
            { 
              type: 'bot', 
              content: 'สวัสดีครับ! ผมเป็น FTI MEMBER PORTAL CHAT BOT สามารถถามคำถามเกี่ยวกับการใช้งานระบบได้เลยครับ',
              suggestions: [
                'วิธีการสมัครสมาชิก',
                'วิธีการยืนยันตัวตน',
                'วิธีการแก้ไขข้อมูลที่อยู่',
                'วิธีการเพิ่มสินค้าหรือบริการ',
                'วิธีการอัปโหลดโลโก้บริษัท'
              ]
            }
          ]);
          setInitialMessageShown(true);
        }
      };
      
      fetchInitialSuggestions();
    }
  }, [isOpen, initialMessageShown]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (text) => {
    setInputValue(text);
    handleSubmit(null, text);
  };

  const handleSubmit = async (e, suggestedText = null) => {
    if (e) e.preventDefault();
    
    const messageText = suggestedText || inputValue;
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInputValue('');
    
    // Handle basic greetings without API call
    const greetings = ['สวัสดี', 'hello', 'hi', 'สวัสดีครับ', 'สวัสดีค่ะ'];
    if (greetings.some(greeting => messageText.toLowerCase().includes(greeting.toLowerCase()))) {
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: 'สวัสดีครับ! มีอะไรให้ช่วยเหลือไหมครับ?',
          suggestions: [
            'วิธีการสมัครสมาชิก',
            'วิธีการยืนยันตัวตน',
            'วิธีการแก้ไขข้อมูลที่อยู่'
          ]
        }
      ]);
      return;
    }
    
    // Show loading indicator
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'bot', content: '...', isLoading: true }]);
    
    try {
      // Call API to get answer
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText }),
      });
      
      const data = await response.json();
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      if (data.success && data.data) {
        // Add bot response with suggestions or followUpOptions if available
        setMessages(prev => [
          ...prev, 
          { 
            type: 'bot', 
            content: data.data.answer,
            suggestions: data.data.suggestions || [],
            followUpOptions: data.data.followUpOptions || [],
            requiresFollowUp: data.data.requiresFollowUp || false
          }
        ]);
      } else {
        // No answer found, suggest contact form
        setMessages(prev => [
          ...prev, 
          { 
            type: 'bot', 
            content: 'ขออภัยครับ ผมไม่พบคำตอบสำหรับคำถามนี้ คุณสามารถติดต่อเจ้าหน้าที่โดยตรงได้ที่แท็บ "ติดต่อเรา" ในหน้าแดชบอร์ด',
            suggestions: ['วิธีการติดต่อเจ้าหน้าที่', 'กลับไปหน้าหลัก']
          }
        ]);
      }
    } catch (error) {
      console.error('Error getting FAQ answer:', error);
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการค้นหาคำตอบ กรุณาลองใหม่อีกครั้ง',
          suggestions: ['ลองใหม่อีกครั้ง', 'ติดต่อเจ้าหน้าที่']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWidgetContainer}>
      {/* Chat button */}
      <button 
        className={styles.chatButton} 
        onClick={toggleChat}
        aria-label="เปิด/ปิดแชท"
      >
        {isOpen ? (
          <span className={styles.closeIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </span>
        ) : (
          <>
            <span className={styles.chatIcon} style={{ fontSize: '24px' }}>💬</span>
            <span className={styles.chatButtonBadge}>?</span>
          </>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
                  <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z"/>
                </svg>
              </div>
              <h3>FTI MEMBER PORTAL CHAT BOT</h3>
            </div>
            <button 
              className={styles.minimizeButton} 
              onClick={toggleChat}
              aria-label="ปิดแชท"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.messageContainer} ${
                  message.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
                }`}
              >
                {message.type !== 'user' && (
                  <div className={styles.messageBotAvatar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
                      <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z"/>
                    </svg>
                  </div>
                )}
                <div 
                  className={`${styles.message} ${
                    message.type === 'user' ? styles.userMessage : styles.botMessage
                  } ${message.isLoading ? styles.loadingMessage : ''}`}
                >
                  {message.isLoading ? (
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div 
                        className={styles.messageContent}
                        dangerouslySetInnerHTML={{ __html: formatMessageWithLinks(message.content) }}
                      />
                      {message.type === 'bot' && message.requiresFollowUp && message.followUpOptions && message.followUpOptions.length > 0 && (
                        <div className={`${styles.suggestedResponses} ${styles.followUpOptions}`}>
                          <div className={styles.followUpTitle}>โปรดเลือกหนึ่งตัวเลือก:</div>
                          {message.followUpOptions.map((option, i) => (
                            <SuggestedResponse 
                              key={i} 
                              text={option} 
                              onClick={handleSuggestionClick} 
                            />
                          ))}
                        </div>
                      )}
                      {message.type === 'bot' && !message.requiresFollowUp && message.suggestions && message.suggestions.length > 0 && (
                        <div className={styles.suggestedResponses}>
                          {message.suggestions.map((suggestion, i) => (
                            <SuggestedResponse 
                              key={i} 
                              text={suggestion} 
                              onClick={handleSuggestionClick} 
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className={styles.messageUserAvatar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form className={styles.chatInputForm} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="พิมพ์คำถามที่นี่..."
              disabled={isLoading}
              className={styles.chatInput}
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className={styles.sendButton}
              aria-label="ส่งข้อความ"
            >
              ส่ง
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
