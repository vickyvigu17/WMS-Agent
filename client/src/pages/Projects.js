import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  message, 
  Tag,
  Empty,
  Row,
  Col 
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  ProjectOutlined,
  SearchOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "WMS Implementation Phase 1",
      client_name: "Amazon Logistics",
      description: "Initial warehouse management system setup for primary distribution center",
      status: "active",
      created_at: new Date('2024-01-15'),
      research_count: 3,
      questions_count: 25
    },
    {
      id: 2,
      name: "Supply Chain Optimization",
      client_name: "Walmart Supply Chain", 
      description: "Optimization of existing warehouse processes and technology stack",
      status: "planning",
      created_at: new Date('2024-01-20'),
      research_count: 1,
      questions_count: 12
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleAddProject = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const newProject = {
        id: Date.now(),
        ...values,
        status: 'planning',
        created_at: new Date(),
        research_count: 0,
        questions_count: 0
      };
      
      setProjects([...projects, newProject]);
      setModalVisible(false);
      message.success('Project created successfully!');
    } catch (error) {
      message.error('Failed to create project');
    }
  };

  const columns = [
    {
      title: 'Project Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <div style={{ 
            fontWeight: '600', 
            fontSize: '16px',
            color: '#0f172a',
            marginBottom: '4px'
          }}>
            {record.name}
          </div>
          <div style={{ 
            color: '#3b82f6', 
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            {record.client_name}
          </div>
          <div style={{ 
            color: '#64748b', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <Tag 
              color={
                record.status === 'active' ? 'success' : 
                record.status === 'completed' ? 'blue' : 'warning'
              }
              style={{ 
                borderRadius: '6px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              {record.status?.toUpperCase()}
            </Tag>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <div>📊 {record.research_count} Research</div>
            <div>❓ {record.questions_count} Questions</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => (
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          <CalendarOutlined style={{ marginRight: '4px' }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<EyeOutlined />}
          className="modern-btn modern-btn-primary"
          onClick={() => navigate(`/projects/${record.id}`)}
          style={{ height: '36px' }}
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              Manage your WMS consulting projects and track progress with AI-powered insights.
            </p>
          </div>
          <Button 
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="modern-btn modern-btn-primary"
            onClick={handleAddProject}
          >
            Add New Project
          </Button>
        </div>
      </div>

      {/* Projects Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card className="modern-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-icon projects" style={{ margin: '0 auto 16px' }}>
              <ProjectOutlined />
            </div>
            <div className="stat-card-value">{projects.length}</div>
            <div className="stat-card-label">Total Projects</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-icon clients" style={{ margin: '0 auto 16px' }}>
              <BulbOutlined />
            </div>
            <div className="stat-card-value">
              {projects.reduce((sum, p) => sum + p.research_count, 0)}
            </div>
            <div className="stat-card-label">AI Research Conducted</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-card" style={{ textAlign: 'center' }}>
            <div className="stat-card-icon questions" style={{ margin: '0 auto 16px' }}>
              <QuestionCircleOutlined />
            </div>
            <div className="stat-card-value">
              {projects.reduce((sum, p) => sum + p.questions_count, 0)}
            </div>
            <div className="stat-card-label">Questions Generated</div>
          </Card>
        </Col>
      </Row>

      {/* Projects Table */}
      <Card 
        className="modern-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
            }} />
            All Projects
          </div>
        }
      >
        <div className="modern-table">
          {projects.length > 0 ? (
            <Table
              columns={columns}
              dataSource={projects}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} projects`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No projects found"
                  />
                )
              }}
            />
          ) : (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div className="empty-state-icon">
                <ProjectOutlined style={{ fontSize: '64px', color: '#e2e8f0' }} />
              </div>
              <div className="empty-state-title">No Projects Yet</div>
              <div className="empty-state-description">
                Create your first WMS consulting project to get started with AI-powered research and question generation.
              </div>
              <Button 
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                className="modern-btn modern-btn-primary"
                onClick={handleAddProject}
                style={{ marginTop: '24px' }}
              >
                Create First Project
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add Project Modal */}
      <Modal
        title={
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <PlusOutlined />
            </div>
            Create New Project
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="modern-form"
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input 
              placeholder="e.g., WMS Implementation Phase 1"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            label="Client Name"
            name="client_name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input 
              placeholder="e.g., Amazon Logistics"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter project description' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="Describe the project scope, objectives, and key deliverables..."
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setModalVisible(false)}
                className="modern-btn modern-btn-secondary"
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="modern-btn modern-btn-primary"
                size="large"
              >
                Create Project
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
