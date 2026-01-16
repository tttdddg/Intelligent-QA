import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuItem, menuItems } from '@/types/type';
import '@/assets/styles/siderbar.css';

export interface SidebarProps {
  onMenuClick: (item: MenuItem) => void;
}

function Sidebar({ onMenuClick }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['qa']);

  const toggleExpand = (id: string) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="nokia-logo">
          <span className="nokia-text">NOKIA</span>
          <span className="beta-badge">Beta</span>
        </div>
        <h3>企业智能问答助手</h3>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(item => (
          <div key={item.id}>
            <div
              className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => item.children ? toggleExpand(item.id) : onMenuClick(item)}
            >
              <div className="menu-item-content">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-title">{item.title}</span>
              </div>
              {item.children && (
                <span className="menu-expand-icon">
                  {expandedItems.includes(item.id) ? '▼' : '►'}
                </span>
              )}
            </div>

            {item.children && expandedItems.includes(item.id) && (
              <div className="submenu">
                {item.children.map(child => (
                  <div
                    key={child.id}
                    className={`submenu-item ${isActive(child.path) ? 'active' : ''}`}
                    onClick={() => onMenuClick(child)}
                  >
                    <span className="submenu-icon">{child.icon}</span>
                    <span className="submenu-title">{child.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="nokia-slogan">
          领先科技，成就世界和合共生
        </div>
        <div className="copyright">
          © 2025 Nokia
        </div>
      </div>
    </div>
  );
};

export default Sidebar;