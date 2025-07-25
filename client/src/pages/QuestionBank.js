import React, { useState } from 'react';
import { 
  Card, Tabs, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm, Row, Col, 
  Alert, Slider, Radio
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, 
  RobotOutlined, ThunderboltOutlined, InboxOutlined, DatabaseOutlined,
  ScanOutlined, ShoppingCartOutlined, TruckOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const QuestionBank = () => {
  const [questions, setQuestions] = useState({
    receiving: [
      { id: 1, text: "What is your current receiving process flow?", priority: "High", category: "receiving" },
      { id: 2, text: "How do you handle advance shipping notices?", priority: "High", category: "receiving" }
    ],
    inventory: [
      { id: 3, text: "What inventory tracking methods do you use?", priority: "High", category: "inventory" },
      { id: 4, text: "How frequently do you perform cycle counts?", priority: "Medium", category: "inventory" }
    ],
    picking: [
      { id: 5, text: "What picking methods do you currently use?", priority: "High", category: "picking" },
      { id: 6, text: "How do you optimize pick paths?", priority: "Medium", category: "picking" }
    ]
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [aiForm] = Form.useForm();

  const categoryInfo = {
    receiving: { 
      title: "Receiving Operations", 
      icon: <InboxOutlined />, 
      description: "Inbound delivery processing, dock management, quality control" 
    },
    inventory: { 
      title: "Inventory Control", 
      icon: <DatabaseOutlined />, 
      description: "Stock tracking, cycle counting, inventory accuracy, ABC analysis" 
    },
    picking: { 
      title: "Order Picking", 
      icon: <ScanOutlined />, 
      description: "Pick strategies, path optimization, task management, accuracy validation" 
    }
  };

  // AI Generation Functions
  const generateAIQuestions = async () => {
    try {
      setIsGenerating(true);
      const values = await aiForm.validateFields();
      
      console.log('🤖 Calling AI generation API with:', values);
      
      const response = await axios.post('/api/question-bank/generate', {
        category: values.category,
        count: values.count || 10,
        priority: values.priority || 'Mixed',
        complexity: values.complexity || 'Mixed'
      });

      if (response.data.success) {
        setGenerationResult(response.data);
        message.success(`🎉 Generated ${response.data.count} AI questions!`);
      } else {
        message.error('Failed to generate questions');
      }
    } catch (error) {
      console.error('❌ AI generation error:', error);
      message.error(error.response?.data?.message || 'Failed to generate AI questions');
      
      // Show fallback demo questions
      const demoQuestions = [
        {
          id: Date.now(),
          text: `What are your ${values.category || 'warehouse'} automation requirements?`,
          priority: 'High',
          category: values.category || 'general',
          ai_generated: true
        },
        {
          id: Date.now() + 1,
          text: `How do you handle ${values.category || 'inventory'} exceptions and errors?`,
          priority: 'Medium', 
          category: values.category || 'general',
          ai_generated: true
        },
        {
          id: Date.now() + 2,
          text: `What integration requirements do you have for ${values.category || 'system'}?`,
          priority: 'High',
          category: values.category || 'general', 
          ai_generated: true
        }
      ];
      
      setGenerationResult({
        success: true,
        questions: demoQuestions,
        count: demoQuestions.length,
        category: values.category || 'general',
        ai_powered: false
      });
      
      message.info('🤖 Showing demo AI questions (API not available)');
    } finally {
      setIsGenerating(false);
    }
  };

  const addGeneratedQuestions = () => {
    if (generationResult && generationResult.questions) {
      const category = generationResult.category;
      
      setQuestions(prev => ({
        ...prev,
        [category]: [
          ...(prev[category] || []),
          ...generationResult.questions.map(q => ({
            ...q,
            id: Math.max(...Object.values(prev).flat().map(q => q.id || 0)) + Math.random()
          }))
        ]
      }));
      
      message.success(`✅ Added ${generationResult.questions.length} questions to ${categoryInfo[category]?.title || category}`);
      setGenerationResult(null);
      aiForm.resetFields();
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    form.setFieldsValue(question);
    setIsModalVisible(true);
  };

  const handleDeleteQuestion = (questionId, category) => {
    setQuestions(prev => ({
      ...prev,
      [category]: prev[category].filter(q => q.id !== questionId)
    }));
    message.success('Question deleted successfully');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingQuestion) {
        // Edit existing question
        setQuestions(prev => ({
          ...prev,
          [values.category]: prev[values.category].map(q => 
            q.id === editingQuestion.id ? { ...q, ...values } : q
          )
        }));
        message.success('Question updated successfully');
      } else {
        // Add new question
        const newQuestion = {
          id: Math.max(...Object.values(questions).flat().map(q => q.id || 0)) + 1,
          ...values
        };
        
        setQuestions(prev => ({
          ...prev,
          [values.category]: [...(prev[values.category] || []), newQuestion]
        }));
        message.success('Question added successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const renderQuestionCard = (question, category) => (
    <Card
      key={question.id}
      size="small"
      className="modern-card"
      style={{ marginBottom: 12 }}
      actions={[
        <EditOutlined key="edit" onClick={() => handleEditQuestion(question)} />,
        <Popconfirm
          title="Are you sure you want to delete this question?"
          onConfirm={() => handleDeleteQuestion(question.id, category)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined key="delete" />
        </Popconfirm>
      ]}
    >
      <div style={{ marginBottom: 8 }}>
        <Tag color={question.priority === 'High' ? 'red' : question.priority === 'Medium' ? 'orange' : 'blue'}>
          {question.priority}
        </Tag>
        {question.ai_generated && (
          <Tag color="purple" icon={<RobotOutlined />}>AI Generated</Tag>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '14px' }}>{question.text}</p>
    </Card>
  );

  // AI Questions Tab Content - VERY OBVIOUS AND SIMPLE
  const renderAIQuestionsTab = () => (
    <div style={{ padding: 20 }}>
      {/* HUGE OBVIOUS HEADER */}
      <Alert
        message="🤖 AI QUESTION GENERATOR"
        description="This is where you generate AI questions! Click the button below to create unlimited WMS questions using artificial intelligence."
        type="success"
        showIcon
        style={{ 
          marginBottom: 30,
          fontSize: '16px',
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          border: '3px solid #52c41a',
          borderRadius: 12
        }}
      />

      <Form form={aiForm} layout="vertical">
        <Card 
          title="🎯 Single Category Generation" 
          style={{ marginBottom: 20 }}
          headStyle={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Select WMS Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Choose a category..." size="large">
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <Option key={key} value={key}>
                      {info.icon} {info.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="count"
                label="Number of Questions"
                initialValue={10}
              >
                <Slider 
                  min={5} 
                  max={25} 
                  marks={{ 5: '5', 10: '10', 15: '15', 20: '20', 25: '25' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority Focus"
                initialValue="Mixed"
              >
                <Radio.Group>
                  <Radio.Button value="Mixed">Mixed</Radio.Button>
                  <Radio.Button value="High">High</Radio.Button>
                  <Radio.Button value="Medium">Medium</Radio.Button>
                  <Radio.Button value="Low">Low</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="complexity"
                label="Complexity Level"
                initialValue="Mixed"
              >
                <Radio.Group>
                  <Radio.Button value="Mixed">Mixed</Radio.Button>
                  <Radio.Button value="Basic">Basic</Radio.Button>
                  <Radio.Button value="Advanced">Advanced</Radio.Button>
                  <Radio.Button value="Expert">Expert</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* HUGE OBVIOUS BUTTON */}
          <Button 
            type="primary" 
            loading={isGenerating}
            onClick={generateAIQuestions}
            icon={<ThunderboltOutlined />}
            size="large"
            style={{ 
              background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)', 
              border: 'none',
              width: '100%',
              height: '60px',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)'
            }}
          >
            🚀 GENERATE AI QUESTIONS NOW! 🤖
          </Button>
        </Card>

        {/* RESULTS SECTION */}
        {generationResult && (
          <Card 
            title="🎉 Generated Questions Preview" 
            style={{ marginTop: 20 }}
            headStyle={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white',
              fontSize: '16px'
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                Category: {categoryInfo[generationResult.category]?.title || generationResult.category}
              </Tag>
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                Generated: {generationResult.count} questions
              </Tag>
              {generationResult.ai_powered && (
                <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  AI-Powered
                </Tag>
              )}
            </div>
            
            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20 }}>
              {generationResult.questions.map((question, index) => (
                <div key={index} style={{ 
                  padding: 16, 
                  border: '2px solid #e2e8f0', 
                  borderRadius: 8, 
                  marginBottom: 12,
                  background: '#f8fafc'
                }}>
                  <p style={{ margin: 0, marginBottom: 8, fontSize: '15px', fontWeight: '500' }}>
                    {question.text}
                  </p>
                  <Space>
                    <Tag color={question.priority === 'High' ? 'red' : question.priority === 'Medium' ? 'orange' : 'blue'}>
                      {question.priority} Priority
                    </Tag>
                    {question.ai_generated && (
                      <Tag color="cyan" icon={<RobotOutlined />}>AI Generated</Tag>
                    )}
                  </Space>
                </div>
              ))}
            </div>

            <Button 
              type="primary" 
              onClick={addGeneratedQuestions}
              size="large"
              style={{ 
                width: '100%',
                height: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              ✅ ADD ALL QUESTIONS TO QUESTION BANK ✅
            </Button>
          </Card>
        )}
      </Form>
    </div>
  );

  const getTotalQuestions = () => {
    return Object.values(questions).flat().length;
  };

  const getAIGeneratedCount = () => {
    return Object.values(questions).flat().filter(q => q.ai_generated === true).length;
  };

  // TAB ITEMS WITH AI QUESTIONS FIRST
  const tabItems = [
    // AI QUESTIONS TAB - FIRST AND OBVIOUS
    {
      key: 'ai-questions',
      label: (
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          <RobotOutlined style={{ color: '#ff4757', fontSize: '18px' }} />
          <span style={{ marginLeft: 8, color: '#ff4757' }}>🤖 AI QUESTIONS</span>
          <Tag style={{ marginLeft: 8 }} color="red">GENERATE HERE!</Tag>
        </span>
      ),
      children: renderAIQuestionsTab()
    },
    // Regular category tabs
    ...Object.entries(categoryInfo).map(([key, info]) => ({
      key,
      label: (
        <span style={{ fontSize: '14px' }}>
          {info.icon}
          <span style={{ marginLeft: 8 }}>{info.title}</span>
          <Tag style={{ marginLeft: 8 }} color="blue">
            {questions[key]?.length || 0}
          </Tag>
        </span>
      ),
      children: (
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{info.description}</p>
          </div>
          
          <Space style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddQuestion}
            >
              Add Manual Question
            </Button>
            <Alert 
              message="💡 Want AI questions? Go to the 'AI Questions' tab!" 
              type="info" 
              showIcon 
              style={{ flex: 1 }}
            />
          </Space>
          
          <div>
            {questions[key]?.map(question => renderQuestionCard(question, key))}
            {(!questions[key] || questions[key].length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <QuestionCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p style={{ fontSize: '16px' }}>No questions added yet for this category</p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  Go to the <strong>"🤖 AI Questions"</strong> tab to generate questions with AI!
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }))
  ];

  return (
    <div className="main-content fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
          Question Bank
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>
          Manage WMS questions and generate new ones with AI
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card className="modern-card stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                <QuestionCircleOutlined />
              </div>
              <div>
                <h3>{getTotalQuestions()}</h3>
                <p>Total Questions</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="modern-card stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <RobotOutlined />
              </div>
              <div>
                <h3>{getAIGeneratedCount()}</h3>
                <p>AI Generated</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="modern-card stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <DatabaseOutlined />
              </div>
              <div>
                <h3>{Object.keys(questions).length}</h3>
                <p>Categories</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* HUGE NOTICE */}
      <Alert
        message="🚨 LOOKING FOR AI QUESTION GENERATION?"
        description="Click the '🤖 AI QUESTIONS' tab above to generate unlimited WMS questions with artificial intelligence!"
        type="warning"
        showIcon
        style={{ 
          marginBottom: 24,
          fontSize: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '2px solid #f59e0b',
          borderRadius: 8
        }}
      />

      {/* Question Categories Tabs */}
      <Card className="modern-card" style={{ minHeight: '60vh' }}>
        <Tabs 
          items={tabItems}
          size="large"
          style={{ minHeight: '500px' }}
          tabPosition="top"
          defaultActiveKey="ai-questions"
        />
      </Card>

      {/* Add/Edit Question Modal */}
      <Modal
        title={editingQuestion ? "Edit Question" : "Add New Question"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        className="modern-modal"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category" size="large">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <Option key={key} value={key}>
                  {info.icon} {info.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="text"
            label="Question Text"
            rules={[{ required: true, message: 'Please enter the question text' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter your WMS question here..."
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Priority Level"
            rules={[{ required: true, message: 'Please select priority level' }]}
          >
            <Select placeholder="Select priority" size="large">
              <Option value="High">High Priority</Option>
              <Option value="Medium">Medium Priority</Option>
              <Option value="Low">Low Priority</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBank;