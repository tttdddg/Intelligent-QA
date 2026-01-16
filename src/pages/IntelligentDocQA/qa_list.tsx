import { useState, useEffect } from 'react';
import { QAHistory } from '@/types/type';
import '@/assets/styles/qa-list.css';

function QAList() {
  const [history, setHistory] = useState<QAHistory[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<QAHistory | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedHistory = localStorage.getItem('qa-history');
        console.log('原始存储数据:', storedHistory);
        
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          console.log('解析后的数据:', parsedHistory);
          
          // 处理数据格式，提取真正的问答内容
          const processedHistory = parsedHistory.map((item: any) => {
            console.log('处理项目:', item);
            
            // 如果包含conversationData，从中提取真正的问答内容
            if (item.conversationData && Array.isArray(item.conversationData) && item.conversationData.length > 0) {
              console.log('找到conversationData:', item.conversationData);
              
              // 从conversationData中获取真正的问答
              const realQA = extractRealQAFromConversation(item.conversationData);
              console.log('提取的问答:', realQA);
              
              if (realQA.question && realQA.answer) {
                return {
                  id: item.id,
                  question: realQA.question,
                  answer: realQA.answer,
                  timestamp: new Date(item.timestamp),
                  files: item.files || []
                };
              }
            }
            
            // 普通格式的数据或提取失败
            return {
              ...item,
              timestamp: new Date(item.timestamp)
            };
          });
          
          console.log('处理后的历史记录:', processedHistory);
          setHistory(processedHistory);
        }
      } catch (error) {
        console.error('加载历史记录失败:', error);
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  const extractRealQAFromConversation = (conversationData: any[]): { question: string; answer: string } => {
    let realQuestion = '';
    let realAnswer = '';
    
    console.log('开始提取对话数据:', conversationData);
    
    for (const qaItem of conversationData) {
      console.log('检查QA项目:', qaItem);
      
      if (qaItem.question && 
          !qaItem.question.includes('对话记录') && 
          !qaItem.question.includes('ga_list.tsx')) {
        realQuestion = qaItem.question;
      }
      
      if (qaItem.answer && 
          !qaItem.answer.includes('包含') && 
          !qaItem.answer.includes('完整对话记录')) {
        realAnswer = qaItem.answer;
      }
      
      if (realQuestion && realAnswer) break;
    }
    
    console.log('提取结果:', { realQuestion, realAnswer });
    return { question: realQuestion, answer: realAnswer };
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('qa-history', JSON.stringify(newHistory));
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.setItem('qa-history', '[]');
    setSelectedRecord(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getQuestionPreview = (question: string) => {
    if (!question || 
        question.trim() === '' || 
        question.includes('对话记录') ||
        question.includes('ga_list.tsx')) {
      return '查看文件内容';
    }

    const maxLength = 40;
    if (question.length > maxLength) {
      return question.substring(0, maxLength) + '...';
    }
    return question;
  };

  return (
    <div className="qa-list-container">
      <div className="list-header">
        <h3>问答记录</h3>
        {history.length > 0 && (
          <button onClick={handleClearAll} className="clear-all-btn">
            清空所有记录
          </button>
        )}
      </div>

      <div className="list-content">
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-list">
              <p>暂无问答记录</p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className={`history-item ${selectedRecord?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedRecord(item)}
              >
                <div className="item-question">{getQuestionPreview(item.question)}</div>
                <div className="item-date">{formatDate(item.timestamp)}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="delete-btn"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>

        {selectedRecord && (
          <div className="record-detail">
            <div className="detail-header">
              <h4>问答详情</h4>
              <button onClick={() => setSelectedRecord(null)} className="close-btn">
                ×
              </button>
            </div>
            <div className="detail-content">
              <div className="question-section">
                <strong>问题：</strong>
                <p>{selectedRecord.question || '文件咨询'}</p>
              </div>
              <div className="answer-section">
                <strong>回答：</strong>
                <p>{selectedRecord.answer}</p>
              </div>
              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <div className="files-section">
                  <strong>附件：</strong>
                  {selectedRecord.files.map((file, index) => (
                    <div key={index} className="file-item">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 数据清理和迁移函数
export const cleanupQAHistoryData = () => {
  try {
    const storedHistory = localStorage.getItem('qa-history');
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      console.log('清理前数据:', parsedHistory);
      
      const cleanedHistory = parsedHistory.map((item: any) => {
        if (item.conversationData && Array.isArray(item.conversationData) && item.conversationData.length > 0) {
          let realQuestion = '';
          let realAnswer = '';

          for (const qaItem of item.conversationData) {
            if (qaItem.question && 
                !qaItem.question.includes('对话记录') && 
                !qaItem.question.includes('ga_list.tsx')) {
              realQuestion = qaItem.question;
            }
            
            if (qaItem.answer && 
                !qaItem.answer.includes('包含') && 
                !qaItem.answer.includes('完整对话记录')) {
              realAnswer = qaItem.answer;
            }
            
            if (realQuestion && realAnswer) break;
          }

          if (realQuestion && realAnswer) {
            return {
              id: item.id,
              question: realQuestion,
              answer: realAnswer,
              timestamp: item.timestamp,
              files: item.files || []
            };
          }
        }
   
        return item;
      });
      
      localStorage.setItem('qa-history', JSON.stringify(cleanedHistory));
      console.log('清理后数据:', cleanedHistory);
      return cleanedHistory;
    }
  } catch (error) {
    console.error('数据清理失败:', error);
  }
  return [];
};

export const fixCurrentDisplay = () => {
  try {
    const storedHistory = localStorage.getItem('qa-history');
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      
      const fixedHistory = parsedHistory.map((item: any) => {
        if (item.question && 
            (item.question.includes('对话记录') || item.question.includes('ga_list.tsx'))) {
          if (item.conversationData && item.conversationData.length > 0) {
            for (const qaItem of item.conversationData) {
              if (qaItem.question && 
                  !qaItem.question.includes('对话记录') && 
                  !qaItem.question.includes('ga_list.tsx')) {
                return {
                  ...item,
                  question: qaItem.question,
                  answer: qaItem.answer || item.answer
                };
              }
            }
          }
          
          return {
            ...item,
            question: '查看文件内容'
          };
        }
        return item;
      });
      
      localStorage.lsetItem('qa-history', JSON.stringify(fixedHistory));
      console.log('修复后的数据:', fixedHistory);
      return fixedHistory;
    }
  } catch (error) {
    console.error('修复显示失败:', error);
  }
  return [];
};

export default QAList;