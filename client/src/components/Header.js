import React from 'react';
import { Layout, Breadcrumb, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ title: 'Home' }];
    
    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      breadcrumbs.push({
        title: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ')
      });
    });
    
    return breadcrumbs;
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
    },
    {
      key: 'settings',
      label: 'Settings',
    },
    {
      key: 'logout',
      label: 'Logout',
    },
  ];

  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Breadcrumb items={getBreadcrumbs()} />
      
      <Dropdown
        menu={{ items: userMenuItems }}
        trigger={['click']}
      >
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <span>WMS Consultant</span>
          <DownOutlined />
        </Space>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
