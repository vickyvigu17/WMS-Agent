import React from 'react';
import { Card, Row, Col, Statistic, Typography, Alert } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={1} style={{ color: '#667eea', margin: 0 }}>
          🎯 WMS Consultant Dashboard
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', margin: '8px 0 0 0' }}>
          Welcome to your AI-powered WMS implementation workspace
        </Paragraph>
      </div>

      <Alert
        message="🚀 New AI Features Available!"
        description="Check out the AI Questions section to generate unlimited WMS implementation questions using artificial intelligence."
        type="success"
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={3}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Questions Generated"
              value={127}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AI Research Reports"
              value={8}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={94.2}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="📊 Recent Activity" style={{ height: 300 }}>
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <RiseOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <p>Your WMS consulting activities will appear here</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="AI Insights" style={{ height: 300 }}>
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <RobotOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <p>AI-powered insights and recommendations</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
