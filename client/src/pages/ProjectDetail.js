import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Tabs, 
  Tag, 
  Descriptions,
  Modal,
  Form,
  Select,
  message,
  List,
  Typography,
  Row,
  Col,
  Checkbox
} from 'antd';
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock project data - replace with API call
  const [project] = useState({
    id: parseInt(id),
    name: "WMS Implementation Phase 1",
    client_name: "Amazon Logistics",
    description: "Initial warehouse management system setup for primary distribution center",
    status: "active",
    created_at: new Date('2024-01-15'),
  });

  const [researchData, setResearchData] = useState([
    {
      id: 1,
      research_type: "Company Overview",
      results: "Amazon is a global e-commerce leader with extensive warehouse operations...",
      created_at: new Date('2024-01-16'),
      ai_powered: true
    }
  ]);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      category: "WMS Process",
      question: "What is your current inventory accuracy rate?",
      priority: "high",
      answered: false
    },
    {
      id: 2,
      category: "Technical",
      question: "What ERP system are you currently using?",
      priority: "medium",
      answered: true,
      answer: "SAP ECC 6.0"
    }
  ]);

  const [researchModalVisible, setResearchModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Available questions from question bank
  const questionBank = [
    {
      id: 101,
      category: "WMS Process",
      subcategory: "Receiving",
      question: "What is your current daily receiving volume?",
      priority: "high"
    },
    {
      id: 102,
      category: "WMS Process", 
      subcategory: "Picking",
      question: "What picking methods do you currently use?",
      priority: "high"
    },
    {
      id: 103,
      category: "Technical",
      subcategory: "Integration",
      question: "What systems need to integrate with the WMS?",
      priority: "medium"
    },
    {
      id: 104,
      category: "Business Requirements",
      subcategory: "Performance",
      question: "What are your peak volume requirements?",
      priority: "high"
    }
  ];

  const handleConductResearch = async (values) => {
    try {
      const newResearch = {
        id: Date.now(),
        research_type: values.research_type,
        results: `AI-powered ${values.research_type} research results would appear here...`,
        created_at: new Date(),
        ai_powered: true
      };
      
      setResearchData([...researchData, newResearch]);
      setResearchModalVisible(false);
      message.success('Research conducted successfully!');
    } catch (error) {
      message.error('Failed to conduct research');
    }
  };

  const handleAddQuestions = () => {
    const newQuestions = selectedQuestions.map(qId => {
      const question = questionBank.find(q => q.id === qId);
      return {
        id: Date.now() + qId,
        ...question,
        answered: false
      };
    });
    
    setQuestions([...questions, ...newQuestions]);
    setQuestionModalVisible(false);
    setSelectedQuestions([]);
    message.success(`${newQuestions.length} questions added to project!`);
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <FileTextOutlined />
          Project Overview
        </span>
      ),
      children: (
        <Card className="modern-card">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Project Name" span={2}>
              {project.name}
            </Descriptions.Item>
            <Descriptions.Item label="Client">
              {project.client_name}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={project.status === 'active' ? 'success' : 'warning'}>
                {project.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              {project.created_at.toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Research Count">
              {researchData.length}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {project.description}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'research',
      label: (
        <span>
          <BulbOutlined />
          AI Research ({researchData.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<SearchOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => setResearchModalVisible(true)}
            >
              Add Research
            </Button>
          </div>
          
          <div>
            {researchData.map(research => (
              <Card 
                key={research.id}
                className="research-card"
                style={{ marginBottom: '16px' }}
              >
                <div className="research-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{research.research_type}</span>
                    <div>
                      {research.ai_powered && (
                        <Tag color="blue">AI-Powered</Tag>
                      )}
                      <span style={{ fontSize: '12px', opacity: 0.8 }}>
                        {research.created_at.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="research-card-content">
                  <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                    {research.results}
                  </Paragraph>
                </div>
              </Card>
            ))}
            
            {researchData.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <BulbOutlined />
                </div>
                <div className="empty-state-title">No Research Yet</div>
                <div className="empty-state-description">
                  Start by conducting AI-powered research for this project
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'questions',
      label: (
        <span>
          <QuestionCircleOutlined />
          Questions ({questions.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => setQuestionModalVisible(true)}
            >
              Add Questions
            </Button>
          </div>
          
          <div>
            {questions.map(question => (
              <Card 
                key={question.id}
                className={`question-card priority-${question.priority} ${question.answered ? 'question-answered' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <Tag color="blue">{question.category}</Tag>
                      <Tag color={
                        question.priority === 'high' ? 'red' : 
                        question.priority === 'medium' ? 'orange' : 'green'
                      }>
                        {question.priority?.toUpperCase()}
                      </Tag>
                      {question.answered && <Tag color="success">ANSWERED</Tag>}
                    </div>
                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                      {question.question}
                    </div>
                    {question.answered && (
                      <div style={{ 
                        background: '#f0fdf4', 
                        padding: '8px 12px', 
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#166534'
                      }}>
                        <strong>Answer:</strong> {question.answer}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {questions.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <QuestionCircleOutlined />
                </div>
                <div className="empty-state-title">No Questions Yet</div>
                <div className="empty-state-description">
                  Add questions from the question bank to start gathering requirements
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
            className="modern-btn modern-btn-secondary"
          >
            Back to Projects
          </Button>
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">
              <UserOutlined style={{ marginRight: '8px' }} />
              {project.client_name}
            </p>
          </div>
        </div>
      </div>

      <Tabs items={tabItems} defaultActiveKey="overview" />

      {/* Research Modal */}
      <Modal
        title="Conduct AI Research"
        open={researchModalVisible}
        onCancel={() => setResearchModalVisible(false)}
        footer={null}
        className="modern-modal"
      >
        <Form onFinish={handleConductResearch} layout="vertical" className="modern-form">
          <Form.Item 
            name="research_type" 
            label="Research Type" 
            rules={[{ required: true }]}
          >
            <Select placeholder="Select research type" size="large">
              <Option value="Company Overview">Company Overview</Option>
              <Option value="Supply Chain Analysis">Supply Chain Analysis</Option>
              <Option value="Competitor Analysis">Competitor Analysis</Option>
              <Option value="Technology Assessment">Technology Assessment</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setResearchModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="modern-btn modern-btn-primary">
                Start Research
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Question Bank Modal */}
      <Modal
        title="Add Questions from Question Bank"
        open={questionModalVisible}
        onCancel={() => setQuestionModalVisible(false)}
        width={800}
        className="modern-modal"
        footer={
          <Space>
            <Button onClick={() => setQuestionModalVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}
              className="modern-btn modern-btn-primary"
            >
              Add Selected Questions ({selectedQuestions.length})
            </Button>
          </Space>
        }
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {questionBank.map(question => (
            <Card 
              key={question.id}
              size="small"
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedQuestions([...selectedQuestions, question.id]);
                    } else {
                      setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                    }
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <Tag color="blue" size="small">{question.category}</Tag>
                    <Tag color="purple" size="small">{question.subcategory}</Tag>
                    <Tag color={
                      question.priority === 'high' ? 'red' : 
                      question.priority === 'medium' ? 'orange' : 'green'
                    } size="small">
                      {question.priority?.toUpperCase()}
                    </Tag>
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {question.question}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
