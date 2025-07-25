import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/question-bank',
      icon: <QuestionCircleOutlined />,
      label: 'Question Bank',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={280}
      className="modern-sidebar"
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            🏭
          </div>
          <span>WMS Consultant</span>
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="sidebar-menu"
        theme="dark"
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '16px 0',
        }}
      />
      
      <div style={{ 
        position: 'absolute', 
        bottom: '24px', 
        left: '20px', 
        right: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          color: '#cbd5e1', 
          fontSize: '12px', 
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          AI-Powered Research
        </div>
        <div style={{ 
          color: '#3b82f6', 
          fontSize: '10px', 
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ✨ Intelligent WMS Consulting
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
