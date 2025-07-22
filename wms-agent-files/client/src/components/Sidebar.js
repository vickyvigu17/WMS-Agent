import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  SearchOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Clients'
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects'
    },
    {
      key: '/wms-processes',
      icon: <SearchOutlined />,
      label: 'WMS Processes'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      style={{
        background: '#001529',
        minHeight: '100vh'
      }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #002140'
      }}>
        {!collapsed && (
          <div style={{ 
            color: 'white', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            WMS Agent
          </div>
        )}
        {React.createElement(
          collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            style: { 
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            },
            onClick: () => setCollapsed(!collapsed)
          }
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: '#001529'
        }}
      />
    </Sider>
  );
};

export default Sidebar;