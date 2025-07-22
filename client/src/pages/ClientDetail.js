import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Tag, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { clientsAPI, projectsAPI, researchAPI } from '../services/api';

const { TabPane } = Tabs;

const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [researchModalVisible, setResearchModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const [clientRes, projectsRes, researchRes] = await Promise.all([
        clientsAPI.getById(id),
        projectsAPI.getByClient(id),
        researchAPI.getByClient(id)
      ]);
      
      setClient(clientRes.data);
      setProjects(projectsRes.data);
      setResearch(researchRes.data);
    } catch (error) {
      message.error('Failed to fetch client data');
    } finally {
      setLoading(false);
    }
  };

  const handleConductResearch = async (values) => {
    try {
      await researchAPI.conduct(id, values.research_type);
      message.success('Research conducted successfully');
      setResearchModalVisible(false);
      fetchClientData();
    } catch (error) {
      message.error('Failed to conduct research');
    }
  };

  const handleCreateProject = async (values) => {
    try {
      await projectsAPI.create(id, values);
      message.success('Project created successfully');
      setProjectModalVisible(false);
      form.resetFields();
      fetchClientData();
    } catch (error) {
      message.error('Failed to create project');
    }
  };

  const projectColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'blue'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Card title={`Client: ${client.name}`}>
        <div style={{ marginBottom: '16px' }}>
          <p><strong>Industry:</strong> {client.industry}</p>
          <p><strong>Company Size:</strong> {client.company_size}</p>
          <p><strong>Location:</strong> {client.location}</p>
          {client.contact_email && <p><strong>Email:</strong> {client.contact_email}</p>}
          {client.description && <p><strong>Description:</strong> {client.description}</p>}
        </div>

        <Tabs defaultActiveKey="projects">
          <TabPane tab="Projects" key="projects">
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setProjectModalVisible(true)}
              >
                Create Project
              </Button>
            </div>
            <Table
              columns={projectColumns}
              dataSource={projects}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Market Research" key="research">
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={() => setResearchModalVisible(true)}
              >
                Conduct Research
              </Button>
            </div>
            <div>
              {research.map((item) => (
                <Card key={item.id} size="small" style={{ marginBottom: '8px' }}>
                  <strong>{item.research_type}:</strong> {item.results}
                </Card>
              ))}
              {research.length === 0 && <p>No research conducted yet.</p>}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Research Modal */}
      <Modal
        title="Conduct Market Research"
        open={researchModalVisible}
        onCancel={() => setResearchModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleConductResearch} layout="vertical">
          <Form.Item name="research_type" label="Research Type" rules={[{ required: true }]}>
            <Input placeholder="e.g., Company Overview, Competitor Analysis" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Conduct Research</Button>
              <Button onClick={() => setResearchModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Modal */}
      <Modal
        title="Create New Project"
        open={projectModalVisible}
        onCancel={() => setProjectModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateProject} layout="vertical">
          <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., WMS Implementation Phase 1" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Project description..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Create Project</Button>
              <Button onClick={() => setProjectModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientDetail;
