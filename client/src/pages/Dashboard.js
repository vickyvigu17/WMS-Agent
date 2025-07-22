import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List, Spin, Alert } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const { summary, recent_projects, industry_distribution } = dashboardData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-tag ${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Total Clients"
              value={summary.total_clients}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Active Projects"
              value={summary.total_projects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Total Questions"
              value={summary.total_questions}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Completion Rate"
              value={summary.question_completion_rate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Industry Distribution Chart */}
        <Col xs={24} lg={12}>
          <Card title="Industry Distribution" className="chart-container">
            {industry_distribution && industry_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industry_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {industry_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <h3>No Industry Data</h3>
                <p>Add clients to see industry distribution</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Question Progress Chart */}
        <Col xs={24} lg={12}>
          <Card title="Question Progress" className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'Questions',
                    answered: summary.answered_questions,
                    remaining: summary.total_questions - summary.answered_questions
                  }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="answered" stackId="a" fill="#52c41a" name="Answered" />
                <Bar dataKey="remaining" stackId="a" fill="#faad14" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Recent Projects">
            {recent_projects && recent_projects.length > 0 ? (
              <Table
                dataSource={recent_projects}
                columns={projectColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div className="empty-state">
                <h3>No Recent Projects</h3>
                <p>Create your first client and project to get started</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={8}>
          <Card title="Research Items" size="small">
            <Statistic
              value={summary.total_research_items}
              prefix={<RiseOutlined />}
              suffix="items"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Avg. Questions per Project" size="small">
            <Statistic
              value={summary.total_projects > 0 ? Math.round(summary.total_questions / summary.total_projects) : 0}
              prefix={<QuestionCircleOutlined />}
              suffix="questions"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Response Rate" size="small">
            <Statistic
              value={summary.question_completion_rate}
              suffix="%"
              valueStyle={{ color: summary.question_completion_rate > 50 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;