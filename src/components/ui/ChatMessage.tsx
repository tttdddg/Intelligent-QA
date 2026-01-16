import { ChatMessage as ChatMessageType } from '@/types/type';

interface ChatMessageProps {
  message: ChatMessageType;
}


function ChatMessage({ message }: ChatMessageProps) {
  // 添加错误边界检查
  if (!message) {
    console.error('ChatMessage: message is null or undefined');
    return null;
  }

  const formatTime = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      console.error('ChatMessage: invalid date:', date);
      return '--:--';
    }
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-avatar">
        {message.type === 'user' ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.content && typeof message.content === 'string' 
            ? message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))
            : <p>消息内容无效</p>
          }
        </div>
        {message.files && message.files.length > 0 && (
          <div className="message-files">
            {message.files.map((file, index) => (
              <div key={index} className="file-attachment">
                📎 {file.name}
              </div>
            ))}
          </div>
        )}
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;