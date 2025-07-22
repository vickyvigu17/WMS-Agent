import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  SettingOutlined,
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
      key: '/clients',
      icon: <UserOutlined />,
      label: 'Clients',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/wms-processes',
      icon: <SettingOutlined />,
      label: 'WMS Processes',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={250}
      className="sidebar"
      style={{
        background: '#001529',
        minHeight: '100vh',
      }}
    >
      <div 
        style={{ 
          padding: '16px', 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: '1px solid #1890ff'
        }}
      >
        🏭 WMS Consultant
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        theme="dark"
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
