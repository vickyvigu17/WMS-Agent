import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Table, 
  message, 
  Spin, 
  Alert,
  Tabs,
  Modal,
  Form,
  Input,
  DatePicker,
  Tag,
  Space,
  List,
  Typography,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  ProjectOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { clientAPI, projectAPI, researchAPI } from '../services/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [researchLoading, setResearchLoading] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, projectsResponse, researchResponse] = await Promise.all([
        clientAPI.getById(id),
        projectAPI.getByClientId(id),
        researchAPI.getByClientId(id).catch(() => ({ data: [] }))
      ]);
      
      setClient(clientResponse.data);
      setProjects(projectsResponse.data);
      setResearch(researchResponse.data);
    } catch (error) {
      message.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleConductResearch = async () => {
    try {
      setResearchLoading(true);
      const response = await researchAPI.conduct(id);
      message.success(`Market research completed! Generated ${response.data.research_count} research items.`);
      // Reload research data
      const researchResponse = await researchAPI.getByClientId(id);
      setResearch(researchResponse.data);
    } catch (error) {
      message.error('Failed to conduct market research');
    } finally {
      setResearchLoading(false);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      await projectAPI.create(id, {
        ...values,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        expected_completion: values.expected_completion?.format('YYYY-MM-DD')
      });
      message.success('Project created successfully');
      setProjectModalVisible(false);
      form.resetFields();
      // Reload projects
      const projectsResponse = await projectAPI.getByClientId(id);
      setProjects(projectsResponse.data);
    } catch (error) {
      message.error('Failed to create project');
    }
  };

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/projects/${record.id}`)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Expected Completion',
      dataIndex: 'expected_completion',
      key: 'expected_completion',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    }
  ];

  const renderResearchCard = (item) => {
    const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
    
    return (
      <Card 
        key={item.id}
        title={item.research_type.replace('_', ' ').toUpperCase()}
        className="research-card"
        size="small"
        extra={<Text type="secondary">Score: {item.relevance_score}</Text>}
      >
        <div className="research-content">
          {item.research_type === 'industry_analysis' && content.industry_overview && (
            <>
              <Title level={5}>Industry Trends</Title>
              <ul className="research-list">
                {content.industry_overview.trends?.map((trend, idx) => (
                  <li key={idx}>{trend}</li>
                ))}
              </ul>
              <Title level={5}>WMS Priorities</Title>
              <ul className="research-list">
                {content.industry_overview.wms_priorities?.map((priority, idx) => (
                  <li key={idx}>{priority}</li>
                ))}
              </ul>
            </>
          )}
          
          {item.research_type === 'competitor_analysis' && (
            <>
              <Title level={5}>Direct Competitors</Title>
              <ul className="research-list">
                {content.direct_competitors?.map((competitor, idx) => (
                  <li key={idx}>{competitor}</li>
                ))}
              </ul>
              <Title level={5}>WMS Landscape</Title>
              <ul className="research-list">
                {content.wms_landscape?.map((vendor, idx) => (
                  <li key={idx}>{vendor}</li>
                ))}
              </ul>
            </>
          )}
          
          {item.research_type === 'supply_chain_challenges' && (
            <>
              <Title level={5}>Primary Challenges</Title>
              <ul className="research-list">
                {content.primary_challenges?.map((challenge, idx) => (
                  <li key={idx}>{challenge}</li>
                ))}
              </ul>
              <Title level={5}>WMS Solutions</Title>
              <ul className="research-list">
                {content.wms_solutions?.map((solution, idx) => (
                  <li key={idx}>{solution}</li>
                ))}
              </ul>
            </>
          )}
          
          {item.research_type === 'technology_stack' && (
            <>
              <Title level={5}>Common Systems</Title>
              <ul className="research-list">
                {content.common_systems?.map((system, idx) => (
                  <li key={idx}>{system}</li>
                ))}
              </ul>
            </>
          )}
          
          {item.research_type === 'company_overview' && (
            <>
              <Title level={5}>Key Findings</Title>
              <ul className="research-list">
                {content.key_findings?.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </>
          )}
          
          {item.research_type === 'recent_news' && (
            <>
              <Title level={5}>Recent Developments</Title>
              <ul className="research-list">
                {content.recent_developments?.map((news, idx) => (
                  <li key={idx}>{news}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!client) {
    return <Alert message="Client not found" type="error" />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/clients')}
          style={{ marginRight: 16 }}
        >
          Back to Clients
        </Button>
        <Button 
          icon={<EditOutlined />} 
          onClick={() => navigate(`/clients/${id}/edit`)}
        >
          Edit Client
        </Button>
      </div>

      <Card title={client.name} style={{ marginBottom: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Industry">{client.industry || '-'}</Descriptions.Item>
          <Descriptions.Item label="Company Size">{client.company_size || '-'}</Descriptions.Item>
          <Descriptions.Item label="Location">{client.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="Contact Email">{client.contact_email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Contact Phone">{client.contact_phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Created">{dayjs(client.created_at).format('MMM DD, YYYY')}</Descriptions.Item>
        </Descriptions>
        {client.description && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Description</Title>
            <Text>{client.description}</Text>
          </div>
        )}
      </Card>

      <Tabs defaultActiveKey="projects">
        <TabPane tab={<span><ProjectOutlined />Projects</span>} key="projects">
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setProjectModalVisible(true)}
            >
              Create Project
            </Button>
          </div>
          
          {projects.length > 0 ? (
            <Table
              dataSource={projects}
              columns={projectColumns}
              rowKey="id"
              pagination={false}
            />
          ) : (
            <div className="empty-state">
              <h3>No Projects Yet</h3>
              <p>Create your first project to get started with client requirements analysis.</p>
            </div>
          )}
        </TabPane>

        <TabPane tab={<span><FileTextOutlined />Market Research</span>} key="research">
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button 
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleConductResearch}
                loading={researchLoading}
              >
                Conduct Market Research
              </Button>
              {research.length > 0 && (
                <Text type="secondary">{research.length} research items available</Text>
              )}
            </Space>
          </div>

          {research.length > 0 ? (
            <Row gutter={[16, 16]}>
              {research.map((item, index) => (
                <Col xs={24} md={12} lg={8} key={item.id}>
                  {renderResearchCard(item)}
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <h3>No Market Research Available</h3>
              <p>Click "Conduct Market Research" to analyze this client's industry, competitors, and market trends.</p>
            </div>
          )}
        </TabPane>
      </Tabs>

      <Modal
        title="Create New Project"
        open={projectModalVisible}
        onCancel={() => {
          setProjectModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name (e.g., WMS Implementation 2024)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Project Description"
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the project scope, objectives, and key requirements"
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expected_completion"
            label="Expected Completion"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientDetail;