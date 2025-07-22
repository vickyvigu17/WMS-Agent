import React from 'react';
import { Layout, Breadcrumb, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [{ title: 'Home' }];

    pathSegments.forEach((segment, index) => {
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ title });
    });

    return items;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout'
    }
  ];

  return (
    <AntHeader style={{
      padding: '0 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Breadcrumb items={getBreadcrumbItems()} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#666' }}>WMS Consultant</span>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              cursor: 'pointer'
            }}
          />
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;