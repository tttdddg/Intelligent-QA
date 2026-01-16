import React, { useState, useRef, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
import ChatMessage from '@/components/ui/ChatMessage';
import FileUpload from '@/components/ui/FileUpload';
import { ChatMessage as ChatMessageType, FileInfo, Conversation } from '@/types/type';
import '@/assets/styles/qa.css';
function QA() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  
  // 对话管理相关状态
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // 语音输入相关状态
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 对话管理函数
  const createNewConversation = () => {
    // 保存当前对话到历史记录
    if (currentConversationId && messages.length > 0) {
      saveCurrentConversation();
    }
    
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 创建新对话
    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    setInputText('');
    setFiles([]);
    
    // 保存到本地存储
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const saveCurrentConversation = () => {
    if (currentConversationId && messages.length > 0) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: [...messages], 
              title: messages[0]?.content?.substring(0, 20) + '...' || '新对话',
              updatedAt: new Date() 
            }
          : conv
      );
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      
      // 保存到qa-history格式（只在开启新对话时保存）
      const qaHistory = JSON.parse(localStorage.getItem('qa-history') || '[]');
      const conversationHistory = messages
        .filter(msg => msg.type === 'user')
        .map(userMsg => {
          const aiMsg = messages.find(msg => 
            msg.type === 'assistant' && 
            messages.indexOf(msg) > messages.indexOf(userMsg)
          );
          return {
            id: userMsg.id,
            question: userMsg.content,
            answer: aiMsg?.content || '暂无回复',
            timestamp: userMsg.timestamp,
            files: userMsg.files
          };
        });
      
      // 将整个对话作为一个历史记录项添加
      if (conversationHistory.length > 0) {
        const conversationRecord = {
          id: currentConversationId,
          question: `对话记录 (${conversationHistory.length}条问答)`,
          answer: `包含${conversationHistory.length}条问答的完整对话记录`,
          timestamp: new Date(),
          conversationData: conversationHistory
        };
        qaHistory.push(conversationRecord);
        localStorage.setItem('qa-history', JSON.stringify(qaHistory));
      }
    }
  };

  const loadConversations = () => {
    const storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // 如果有对话记录，加载最新的对话
    if (storedConversations.length > 0) {
      setConversations(storedConversations);
      const latestConversation = storedConversations[storedConversations.length - 1];
      setCurrentConversationId(latestConversation.id);
      setMessages(latestConversation.messages || []);
    } else {
      // 如果没有对话记录，创建一个新的对话
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: '新对话',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedConversations = [newConversation];
      setConversations(updatedConversations);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }
  };

  // 初始化对话和语音识别
  useEffect(() => {
    loadConversations();
  }, []);
  
  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setInputText(prev => prev + transcript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  
  // 开始语音识别
  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  // 停止语音识别
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !files.length) return;

    // 如果没有当前对话，创建一个新对话
    if (!currentConversationId) {
      createNewConversation();
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      files: files.length > 0 ? files : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setFiles([]);
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '根据您提供的信息，我为您提供以下专业解答：',
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      setIsLoading(false);

      // 更新当前对话（只保存到conversations，不保存到qa-history）
      if (currentConversationId) {
        const updatedConversations = conversations.map(conv => 
          conv.id === currentConversationId 
            ? { 
                ...conv, 
                messages: finalMessages,
                title: finalMessages[0]?.content?.substring(0, 20) + '...' || '新对话',
                updatedAt: new Date() 
              }
            : conv
        );
        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      }
    }, 2000);
  };

  const handleFileUpload = (fileInfo: FileInfo) => {
    setFiles(prev => [...prev, fileInfo]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 清理语音识别资源
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  return (
    <div className="qa-container">
      <div className="qa-header">
        <div className="header-left">
          <h2>智能问答</h2>
          <div className="subtitle">企业智能问答小助手</div>
        </div>
        <div className="header-right">
          <button 
            onClick={createNewConversation}
            className="new-conversation-btn"
            title="开启新对话"
          >
            <span className="btn-icon">💬</span>
            新对话
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>暂无对话记录，开始提问吧！</p>
            </div>
          ) : (
            messages.map(message => {
              // 确保消息数据完整
              if (!message || !message.id || !message.type || !message.content) {
                console.error('无效的消息数据:', message);
                return null;
              }
              return <ChatMessage key={message.id} message={message} />;
            })
          )}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <FileUpload onFileUpload={handleFileUpload} />

          <div className="text-input-container">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题或上传文件..."
                rows={3}
                className="message-input"
              />
              {speechSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`voice-button ${isListening ? 'listening' : ''}`}
                  title={isListening ? '停止语音输入' : '开始语音输入'}
                >
                  {isListening ? (
                    <span className="voice-icon recording">🎤</span>
                  ) : (
                    <span className="voice-icon">🎤</span>
                  )}
                </button>
              )}
              {!speechSupported && (
                <div className="voice-not-supported" title="您的浏览器不支持语音识别功能">
                  <span style={{fontSize: '14px', color: '#999'}}>🎤⚠️</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && files.length === 0)}
              className="send-button"
            >
              {isLoading ? (
        <span className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      ) : '发送'}
            </button>
          </div>

          {isListening && (
            <div className="voice-status">
              <span className="voice-indicator">🎤 正在听取您的语音...</span>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="file-preview">
              <span>已选择文件: </span>
              {files.map((file, index) => (
                <span key={index} className="file-tag">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="qa-footer">
        {/* <div className="clear-history">
          <button className="clear-btn">清除历史记录</button>
        </div> */}
        <div className="copyright">
          © 2025 <br />
        </div>
      </div>
    </div>
  );
};

export default QA;