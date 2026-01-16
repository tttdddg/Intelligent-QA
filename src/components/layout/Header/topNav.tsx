import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@/types/type';
import '@/assets/styles/top.css';

export interface TopNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

function TopNav({ tabs, activeTab, onTabChange, onTabClose }: TopNavProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser.username || '用户';
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };
  
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };
  
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('点击退出登录');
    setShowUserMenu(false);
    handleLogout();
  };
  
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);
  return (
    <div className="top-nav">
      <div className="nav-tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="user-menu-container">
        <div 
          className="user-avatar"
          onClick={handleAvatarClick}
        >
          <div className="avatar-icon">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="user-name">{userName}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        
        {showUserMenu && (
          <div className="user-dropdown-menu">
            <div 
              className="menu-item" 
              onClick={handleLogoutClick}
            >
              <span className="menu-icon">🚪</span>
              <span>退出登录</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;