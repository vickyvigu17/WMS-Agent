import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Tag,
  Space,
  Popconfirm,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  QuestionCircleOutlined,
  InboxOutlined,
  SendOutlined,
  ApiOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const QuestionBank = () => {
  const [questions, setQuestions] = useState({
    inbound: [
      {
        id: 1,
        question: "What is your current daily receiving volume (number of receipts/SKUs)?",
        priority: "high",
        subcategory: "Receiving"
      },
      {
        id: 2,
        question: "How do you currently handle advance shipment notifications (ASNs)?",
        priority: "high",
        subcategory: "Receiving"
      },
      {
        id: 3,
        question: "What put-away strategies do you currently use (random, fixed, zone-based)?",
        priority: "high",
        subcategory: "Put-away"
      },
      {
        id: 4,
        question: "How do you determine optimal storage locations for received items?",
        priority: "medium",
        subcategory: "Put-away"
      },
    ],
    outbound: [
      {
        id: 5,
        question: "What picking methods do you currently use (piece, case, pallet, batch)?",
        priority: "high",
        subcategory: "Picking"
      },
      {
        id: 6,
        question: "What is your current pick accuracy rate and target?",
        priority: "high",
        subcategory: "Picking"
      },
      {
        id: 7,
        question: "How do you optimize pick paths and minimize travel time?",
        priority: "medium",
        subcategory: "Picking"
      },
      {
        id: 8,
        question: "What types of packaging do you use and how is packaging determined?",
        priority: "medium",
        subcategory: "Packing"
      },
    ],
    integration: [
      {
        id: 9,
        question: "What ERP system are you currently using and what version?",
        priority: "high",
        subcategory: "ERP Integration"
      },
      {
        id: 10,
        question: "What data needs to be synchronized between WMS and ERP?",
        priority: "high",
        subcategory: "ERP Integration"
      },
      {
        id: 11,
        question: "What other systems need to integrate with the WMS (TMS, EDI, e-commerce)?",
        priority: "medium",
        subcategory: "System Integration"
      },
    ],
    technical: [
      {
        id: 12,
        question: "What mobile devices and scanners are you currently using?",
        priority: "medium",
        subcategory: "Hardware"
      },
      {
        id: 13,
        question: "What is your current network infrastructure (WiFi coverage, bandwidth)?",
        priority: "high",
        subcategory: "Infrastructure"
      },
      {
        id: 14,
        question: "How clean and standardized is your current item master data?",
        priority: "high",
        subcategory: "Data Quality"
      },
    ],
    business: [
      {
        id: 15,
        question: "What are your current order processing times and targets?",
        priority: "high",
        subcategory: "Performance"
      },
      {
        id: 16,
        question: "What are your peak volume requirements (orders per hour/day)?",
        priority: "high",
        subcategory: "Capacity"
      },
      {
        id: 17,
        question: "What key performance indicators (KPIs) do you need to track?",
        priority: "medium",
        subcategory: "Reporting"
      },
    ]
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();

  const categoryIcons = {
    inbound: <InboxOutlined />,
    outbound: <SendOutlined />,
    integration: <ApiOutlined />,
    technical: <SettingOutlined />,
    business: <UserOutlined />
  };

  const categoryColors = {
    inbound: '#3b82f6',
    outbound: '#10b981', 
    integration: '#f59e0b',
    technical: '#8b5cf6',
    business: '#ef4444'
  };

  const handleAddQuestion = (category) => {
    setEditingQuestion(null);
    form.resetFields();
    form.setFieldValue('category', category);
    setModalVisible(true);
  };

  const handleEditQuestion = (question, category) => {
    setEditingQuestion({ ...question, category });
    form.setFieldsValue({
      question: question.question,
      priority: question.priority,
      subcategory: question.subcategory,
      category: category
    });
    setModalVisible(true);
  };

  const handleDeleteQuestion = (questionId, category) => {
    setQuestions(prev => ({
      ...prev,
      [category]: prev[category].filter(q => q.id !== questionId)
    }));
    message.success('Question deleted successfully!');
  };

  const handleSubmit = (values) => {
    if (editingQuestion) {
      // Update existing question
      setQuestions(prev => ({
        ...prev,
        [values.category]: prev[values.category].map(q => 
          q.id === editingQuestion.id 
            ? { ...q, question: values.question, priority: values.priority, subcategory: values.subcategory }
            : q
        )
      }));
      message.success('Question updated successfully!');
    } else {
      // Add new question
      const newQuestion = {
        id: Date.now(),
        question: values.question,
        priority: values.priority,
        subcategory: values.subcategory
      };
      
      setQuestions(prev => ({
        ...prev,
        [values.category]: [...prev[values.category], newQuestion]
      }));
      message.success('Question added successfully!');
    }
    
    setModalVisible(false);
    form.resetFields();
  };

  const renderQuestionCard = (question, category) => (
    <Card 
      key={question.id}
      size="small"
      className={`question-card priority-${question.priority}`}
      style={{ marginBottom: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Tag color="blue" size="small">{question.subcategory}</Tag>
            <Tag color={
              question.priority === 'high' ? 'red' : 
              question.priority === 'medium' ? 'orange' : 'green'
            } size="small">
              {question.priority?.toUpperCase()}
            </Tag>
          </div>
          <div style={{ fontWeight: '500', lineHeight: '1.4' }}>
            {question.question}
          </div>
        </div>
        <Space>
          <Button 
            type="text" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditQuestion(question, category)}
          />
          <Popconfirm
            title="Delete this question?"
            description="Are you sure you want to delete this question?"
            onConfirm={() => handleDeleteQuestion(question.id, category)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );

  const tabItems = [
    {
      key: 'inbound',
      label: (
        <span>
          <InboxOutlined />
          Inbound ({questions.inbound.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => handleAddQuestion('inbound')}
            >
              Add Inbound Question
            </Button>
          </div>
          {questions.inbound.map(question => renderQuestionCard(question, 'inbound'))}
        </div>
      ),
    },
    {
      key: 'outbound',
      label: (
        <span>
          <SendOutlined />
          Outbound ({questions.outbound.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => handleAddQuestion('outbound')}
            >
              Add Outbound Question
            </Button>
          </div>
          {questions.outbound.map(question => renderQuestionCard(question, 'outbound'))}
        </div>
      ),
    },
    {
      key: 'integration',
      label: (
        <span>
          <ApiOutlined />
          Integration ({questions.integration.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => handleAddQuestion('integration')}
            >
              Add Integration Question
            </Button>
          </div>
          {questions.integration.map(question => renderQuestionCard(question, 'integration'))}
        </div>
      ),
    },
    {
      key: 'technical',
      label: (
        <span>
          <SettingOutlined />
          Technical ({questions.technical.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => handleAddQuestion('technical')}
            >
              Add Technical Question
            </Button>
          </div>
          {questions.technical.map(question => renderQuestionCard(question, 'technical'))}
        </div>
      ),
    },
    {
      key: 'business',
      label: (
        <span>
          <UserOutlined />
          Business ({questions.business.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              className="modern-btn modern-btn-primary"
              onClick={() => handleAddQuestion('business')}
            >
              Add Business Question
            </Button>
          </div>
          {questions.business.map(question => renderQuestionCard(question, 'business'))}
        </div>
      ),
    },
  ];

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Question Bank</h1>
        <p className="page-subtitle">
          Manage your WMS consulting questions organized by categories. Add, edit, or remove questions as needed.
        </p>
      </div>

      {/* Question Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {Object.entries(questions).map(([category, categoryQuestions]) => (
          <Col xs={24} sm={12} lg={8} xl={4.8} key={category}>
            <Card className="modern-card" style={{ textAlign: 'center' }}>
              <div 
                className="stat-card-icon"
                style={{ 
                  margin: '0 auto 16px',
                  background: categoryColors[category],
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '24px'
                }}
              >
                {categoryIcons[category]}
              </div>
              <div className="stat-card-value">{categoryQuestions.length}</div>
              <div className="stat-card-label">{category.charAt(0).toUpperCase() + category.slice(1)}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Question Categories */}
      <Card className="modern-card">
        <Tabs items={tabItems} />
      </Card>

      {/* Add/Edit Question Modal */}
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
              {editingQuestion ? <EditOutlined /> : <PlusOutlined />}
            </div>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
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
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" size="large">
              <Option value="inbound">Inbound</Option>
              <Option value="outbound">Outbound</Option>
              <Option value="integration">Integration</Option>
              <Option value="technical">Technical</Option>
              <Option value="business">Business</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Subcategory"
            name="subcategory"
            rules={[{ required: true, message: 'Please enter subcategory' }]}
          >
            <Input 
              placeholder="e.g., Receiving, Picking, ERP Integration"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            label="Question"
            name="question"
            rules={[{ required: true, message: 'Please enter question' }]}
          >
            <TextArea 
              rows={4}
              placeholder="Enter your WMS consulting question..."
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority" size="large">
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
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
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
