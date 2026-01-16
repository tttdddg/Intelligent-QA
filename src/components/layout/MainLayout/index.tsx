import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import TopNav from '../Header/topNav';
import { MenuItem, Tab, menuItems } from '@/types/type';
import '@/assets/styles/top.css';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initializeTabsFromPath = () => {
    const currentPath = location.pathname;
    const defaultTab = { id: 'qa-main', title: '问答助手', path: '/qa' };
    
    if (currentPath === '/qa') {
      return {
        tabs: [defaultTab],
        activeTab: 'qa-main'
      };
    }

    const allMenuItems: MenuItem[] = [];
    menuItems.forEach(item => {
      if (item.children) {
        allMenuItems.push(...item.children);
      } else {
        allMenuItems.push(item);
      }
    });
    
    const currentMenuItem = allMenuItems.find(item => item.path === currentPath);
    
    if (currentMenuItem && currentMenuItem.path !== '/qa') {
      return {
        tabs: [defaultTab, { id: currentMenuItem.id, title: currentMenuItem.title, path: currentMenuItem.path }],
        activeTab: currentMenuItem.id
      };
    } else {
      return {
        tabs: [defaultTab],
        activeTab: 'qa-main'
      };
    }
  };
  
  const initialState = initializeTabsFromPath();
  const [tabs, setTabs] = useState<Tab[]>(initialState.tabs);
  const [activeTab, setActiveTab] = useState<string>(initialState.activeTab);
  
  // 监听路径变化，更新活动标签
  useEffect(() => {
    const currentPath = location.pathname;
    const currentTab = tabs.find(tab => tab.path === currentPath);
    if (currentTab && currentTab.id !== activeTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname, tabs, activeTab]);

  // 处理菜单点击
  const handleMenuClick = (item: MenuItem) => {
    const existingTab = tabs.find(tab => tab.id === item.id);

    if (existingTab) {
      setActiveTab(existingTab.id);
      navigate(existingTab.path);
    } else {
      const newTab = {
        id: item.id,
        title: item.title,
        path: item.path
      };
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTab(item.id);
      navigate(item.path);
    }
  };

  // 处理标签切换
  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      navigate(tab.path);
    }
  };

  // 处理标签关闭
  const handleTabClose = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);

    // 如果是最后一个标签，清空所有标签并跳转到首页
    if (newTabs.length === 0) {
      setTabs([]);
      setActiveTab('');
      navigate('/');
      return;
    }

    setTabs(newTabs);

    // 如果关闭的是当前活动的标签，切换到相邻的标签
    if (activeTab === tabId) {
      const newActiveTab = tabIndex > 0 ? tabs[tabIndex - 1].id : newTabs[0].id;
      setActiveTab(newActiveTab);
      navigate(newTabs.find(tab => tab.id === newActiveTab)?.path || '/qa');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar onMenuClick={handleMenuClick} />

      <div className="main-content">
        <TopNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
        />

        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;