import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Room() {
  const location = useLocation();
  
  useEffect(() => {
    // 跳转到外部视频页面
    window.open('http://127.0.0.1:11188/video.html', '_blank');
  }, []);

  // 根据当前路由路径显示不同的跳转提示文本
  const getRedirectText = () => {
    if (location.pathname === '/enterprise') {
      return '正在跳转到企业展厅-贝尔星...';
    }
    return '正在跳转到办公助手-贝尔诺...';
  };

  return (
    <div>
      <p>{getRedirectText()}</p>
    </div>
  )
}

export default Room