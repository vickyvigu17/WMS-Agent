import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  RobotOutlined
} from '@ant-design/icons';
import QuestionBank from './pages/QuestionBank';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('questions');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'questions',
      icon: <RobotOutlined style={{ color: '#ff4757' }} />,
      label: (
        <span style={{ color: '#ff4757', fontWeight: 'bold' }}>
          🤖 AI Questions
        </span>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible={false}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['questions']}
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 24,
          }}
        >
          <div style={{ paddingLeft: 24 }}>
            <h2 style={{ margin: 0, color: '#667eea' }}>
              🤖 WMS AI Questions Generator
            </h2>
          </div>
          <div style={{ color: '#667eea', fontWeight: 'bold' }}>
            AI-Powered Question Generation
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <QuestionBank />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
