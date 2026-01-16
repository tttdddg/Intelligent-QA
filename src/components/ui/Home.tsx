// Home.tsx (改造后)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/assets/styles/HomePage.css';

function Home(){
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [typingVisible, setTypingVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const textPairs = [
    { text1: '知识管理，我是你的', text2: '图谱向导' },
    { text1: '智能问答，我是你的', text2: '答疑专家' },
    { text1: '文档解析，我是你的', text2: '内容引擎' },
    { text1: '多模态学习，我是你的', text2: '知识中枢' }
  ];

  useEffect(() => {
    let currentPairIndex = 0;
    let currentText = '';
    let charIndex = 0;
    let isFirstText = true;
    let blinkCount = 0;

    const typeText = () => {
      const pair = textPairs[currentPairIndex];
      const targetText = isFirstText ? pair.text1 : pair.text2;

      if (charIndex < targetText.length) {
        currentText += targetText[charIndex];
        setDisplayText(currentText);
        charIndex++;
      } else if (blinkCount < 6) {
        setTypingVisible(blinkCount % 2 === 0);
        blinkCount++;
      } else {
        // 切换到下一个文本或下一对
        if (!isFirstText) {
          // 切换到下一对文本
          currentPairIndex = (currentPairIndex + 1) % textPairs.length;
          setCurrentTextIndex(currentPairIndex);
        }

        isFirstText = !isFirstText;
        currentText = '';
        charIndex = 0;
        blinkCount = 0;
        setTypingVisible(false);
      }
    };

    intervalRef.current = setInterval(typeText, 150);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderText = (text: string, isSpecial: boolean = false) => {
    return (
      <span className={isSpecial ? 'special' : 'ordinary'}>
        <h1>{text}</h1>
      </span>
    );
  };

  const currentPair = textPairs[currentTextIndex];

  return (
    <div className="home-container">
      <div className="nokia-brand">
        <div className="nokia-logo">NOKIA</div>
        <div className="nokia-slogan">领先科技，成就世界和合共生</div>
      </div>
      
      <div className="content-wrapper">
        <div className="item-list">
          <div className="item">
            {renderText(currentPair.text1)}
            {renderText(currentPair.text2, true)}
            {typingVisible && (
              <span className="typing">
                <h1>_</h1>
              </span>
            )}
          </div>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            {/* <div className="feature-icon">📊</div> */}
            {/* <h3>知识图谱</h3>
            <p>构建企业知识网络，实现智能关联分析</p> */}
            <div className="feature-icon">💂</div>
              <h3>数字人助手</h3>
            <p>讲解企业文化，解答访客问题</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>智能问答</h3>
            <p>基于AI技术给员工提供精准的问题解答</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>文档解析</h3>
            <p>多格式文档智能解析与内容提取</p>
          </div>
        </div>
        
        <div className="button-container">
          <button
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            进入系统
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
      
      <div className="home-footer">
        <p>© 2025 Nokia · 企业智能问答助手</p>
      </div>
    </div>
  );
};

export default Home;