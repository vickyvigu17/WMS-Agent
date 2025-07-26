import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Form,
  Select,
  Slider,
  Alert,
  Space,
  Tag,
  Row,
  Col,
  Spin,
  message,
  Typography
} from 'antd';
import {
  RobotOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TruckOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const QuestionBank = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  // Category definitions with WMS processes
  const categoryInfo = {
    receiving: {
      title: 'Receiving & Inbound',
      icon: <InboxOutlined style={{ color: '#52c41a' }} />,
      description: 'Questions about receiving processes, dock management, and inbound logistics.',
      color: '#52c41a'
    },
    inventory: {
      title: 'Inventory Management',
      icon: <BarChartOutlined style={{ color: '#1890ff' }} />,
      description: 'Questions about inventory control, cycle counting, and stock optimization.',
      color: '#1890ff'
    },
    picking: {
      title: 'Picking & Packing',
      icon: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      description: 'Questions about order fulfillment, picking strategies, and packing operations.',
      color: '#fa8c16'
    },
    shipping: {
      title: 'Shipping & Outbound',
      icon: <TruckOutlined style={{ color: '#722ed1' }} />,
      description: 'Questions about shipping processes, carrier management, and outbound logistics.',
      color: '#722ed1'
    },
    integration: {
      title: 'System Integration',
      icon: <LinkOutlined style={{ color: '#eb2f96' }} />,
      description: 'Questions about ERP integration, data flows, and system architecture.',
      color: '#eb2f96'
    },
    technical: {
      title: 'Technical Architecture',
      icon: <ThunderboltOutlined style={{ color: '#f5222d' }} />,
      description: 'Questions about system architecture, performance, and technical requirements.',
      color: '#f5222d'
    }
  };

  // Demo questions database (same as HTML version)
  const demoQuestions = {
    receiving: [
      { q: "How do you currently validate incoming shipment quantities against purchase orders?", tags: ["Process", "Accuracy"] },
      { q: "What is your strategy for handling damaged goods during receiving?", tags: ["Quality", "Process"] },
      { q: "How do you manage receiving operations during peak seasons?", tags: ["Capacity", "Planning"] },
      { q: "What documentation is required for your receiving process?", tags: ["Compliance", "Documentation"] },
      { q: "How do you handle discrepancies between expected and actual deliveries?", tags: ["Exception", "Process"] },
      { q: "What are your receiving dock capacity and layout requirements?", tags: ["Infrastructure", "Capacity"] },
      { q: "How do you prioritize incoming shipments for processing?", tags: ["Priority", "Workflow"] },
      { q: "What quality control measures do you have during receiving?", tags: ["Quality", "Control"] },
      { q: "How do you handle cross-docking operations?", tags: ["Cross-dock", "Efficiency"] },
      { q: "What are your appointment scheduling requirements for vendors?", tags: ["Scheduling", "Vendor"] }
    ],
    inventory: [
      { q: "What methods do you use for inventory classification and prioritization?", tags: ["Classification", "Strategy"] },
      { q: "How do you manage inventory across multiple locations?", tags: ["Multi-site", "Control"] },
      { q: "What is your approach to safety stock calculations?", tags: ["Planning", "Optimization"] },
      { q: "How do you handle seasonal inventory fluctuations?", tags: ["Seasonality", "Planning"] },
      { q: "What KPIs do you track for inventory performance?", tags: ["Metrics", "Performance"] },
      { q: "How do you manage slow-moving and obsolete inventory?", tags: ["Obsolete", "Management"] },
      { q: "What cycle counting strategies do you employ?", tags: ["Counting", "Accuracy"] },
      { q: "How do you handle lot tracking and expiration dates?", tags: ["Lot", "Expiration"] },
      { q: "What are your inventory accuracy requirements?", tags: ["Accuracy", "Requirements"] },
      { q: "How do you manage inventory replenishment triggers?", tags: ["Replenishment", "Triggers"] }
    ],
    picking: [
      { q: "What picking strategies do you employ for different order types?", tags: ["Strategy", "Optimization"] },
      { q: "How do you minimize pick errors and improve accuracy?", tags: ["Accuracy", "Quality"] },
      { q: "What technology do you use for pick path optimization?", tags: ["Technology", "Efficiency"] },
      { q: "How do you handle partial picks and backorders?", tags: ["Exception", "Process"] },
      { q: "What is your approach to batch picking vs single order picking?", tags: ["Strategy", "Efficiency"] },
      { q: "How do you manage pick slot optimization and slotting?", tags: ["Slotting", "Optimization"] },
      { q: "What are your peak picking volume requirements?", tags: ["Volume", "Capacity"] },
      { q: "How do you handle priority orders and rush shipments?", tags: ["Priority", "Rush"] },
      { q: "What pick confirmation methods do you use?", tags: ["Confirmation", "Accuracy"] },
      { q: "How do you manage wave planning and release?", tags: ["Wave", "Planning"] }
    ],
    shipping: [
      { q: "How do you optimize carrier selection and routing?", tags: ["Optimization", "Carriers"] },
      { q: "What is your process for handling expedited shipments?", tags: ["Urgency", "Process"] },
      { q: "How do you manage shipping costs and rate shopping?", tags: ["Cost", "Optimization"] },
      { q: "What tracking and visibility do you provide to customers?", tags: ["Visibility", "Service"] },
      { q: "How do you handle international shipping requirements?", tags: ["International", "Compliance"] },
      { q: "What are your packaging and labeling requirements?", tags: ["Packaging", "Labeling"] },
      { q: "How do you manage shipping documentation and compliance?", tags: ["Documentation", "Compliance"] },
      { q: "What are your on-time delivery performance targets?", tags: ["Performance", "Delivery"] },
      { q: "How do you handle shipping damage and claims?", tags: ["Damage", "Claims"] },
      { q: "What consolidation strategies do you use for outbound shipments?", tags: ["Consolidation", "Strategy"] }
    ],
    integration: [
      { q: "What are your real-time data synchronization requirements?", tags: ["Integration", "Real-time"] },
      { q: "How do you handle data mapping between systems?", tags: ["Data", "Mapping"] },
      { q: "What APIs and web services do you currently use?", tags: ["API", "Technology"] },
      { q: "How do you manage master data consistency across systems?", tags: ["Data", "Consistency"] },
      { q: "What are your system backup and disaster recovery requirements?", tags: ["Backup", "Recovery"] },
      { q: "How do you handle EDI transactions and requirements?", tags: ["EDI", "Transactions"] },
      { q: "What ERP system integration points are critical?", tags: ["ERP", "Integration"] },
      { q: "How do you manage data validation and error handling?", tags: ["Validation", "Errors"] },
      { q: "What are your reporting and analytics requirements?", tags: ["Reporting", "Analytics"] },
      { q: "How do you handle system performance monitoring?", tags: ["Performance", "Monitoring"] }
    ],
    technical: [
      { q: "What are your scalability requirements for the WMS?", tags: ["Scalability", "Architecture"] },
      { q: "How do you handle system performance during peak operations?", tags: ["Performance", "Peak"] },
      { q: "What are your data security and compliance requirements?", tags: ["Security", "Compliance"] },
      { q: "How do you manage user access and permissions?", tags: ["Security", "Access"] },
      { q: "What are your system availability and uptime requirements?", tags: ["Availability", "SLA"] },
      { q: "How do you handle database performance and optimization?", tags: ["Database", "Performance"] },
      { q: "What are your mobile device and hardware requirements?", tags: ["Mobile", "Hardware"] },
      { q: "How do you manage system upgrades and maintenance?", tags: ["Upgrades", "Maintenance"] },
      { q: "What are your cloud vs on-premise preferences?", tags: ["Cloud", "Infrastructure"] },
      { q: "How do you handle system testing and validation?", tags: ["Testing", "Validation"] }
    ]
  };
const generateAIQuestions = async (values) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { category, priority, complexity } = values;
      const count = questionCount;
      
      const categoryQuestions = demoQuestions[category] || demoQuestions.receiving;
      const selectedQuestions = categoryQuestions.slice(0, count);
      
      // Add metadata to questions
      const questionsWithMeta = selectedQuestions.map((item, index) => ({
        ...item,
        id: Date.now() + index,
        category,
        priority,
        complexity,
        generated: true
      }));
      
      setGeneratedQuestions(questionsWithMeta);
      setShowResults(true);
      message.success(`Generated ${count} AI questions for ${categoryInfo[category].title}!`);
      
    } catch (error) {
      message.error('Error generating questions. Showing demo questions instead.');
      
      // Fallback to demo questions
      const category = values.category || 'receiving';
      const categoryQuestions = demoQuestions[category];
      const selectedQuestions = categoryQuestions.slice(0, questionCount);
      
      const questionsWithMeta = selectedQuestions.map((item, index) => ({
        ...item,
        id: Date.now() + index,
        category,
        priority: values.priority || 'medium',
        complexity: values.complexity || 'intermediate',
        generated: true
      }));
      
      setGeneratedQuestions(questionsWithMeta);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4d4f',
      medium: '#faad14',
      low: '#52c41a',
      mixed: '#1890ff'
    };
    return colors[priority] || '#1890ff';
  };

  const renderAIQuestionsTab = () => (
    <div style={{ padding: '20px 0' }}>
      {/* Large Alert Banner */}
      <Alert
        message="🤖 AI QUESTION GENERATOR - GENERATE UNLIMITED WMS QUESTIONS!"
        description="This is the AI-powered question generation feature. Use the form below to generate customized WMS implementation questions using artificial intelligence."
        type="success"
        showIcon
        style={{ 
          marginBottom: 30,
          background: 'linear-gradient(45deg, #52c41a, #73d13d)',
          border: 'none',
          borderRadius: 12,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      />

      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: 15,
          marginBottom: 30
        }}
      >
        <div style={{ color: 'white', textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            🤖 AI QUESTION GENERATOR
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '16px', margin: '10px 0 0 0' }}>
            Generate unlimited WMS questions using artificial intelligence!
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={generateAIQuestions}
          initialValues={{
            category: 'receiving',
            priority: 'high',
            complexity: 'intermediate'
          }}
        >
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="category" label={<span style={{ color: 'white', fontWeight: 'bold' }}>📂 Select Category:</span>}>
                <Select size="large">
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <Option key={key} value={key}>
                      {info.icon} {info.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'white', fontWeight: 'bold' }}>🔢 Number of Questions: {questionCount}</span>}>
                <Slider
                  min={5}
                  max={25}
                  value={questionCount}
                  onChange={setQuestionCount}
                  marks={{
                    5: '5',
                    10: '10',
                    15: '15',
                    20: '20',
                    25: '25'
                  }}
                  trackStyle={{ background: '#feca57' }}
                  handleStyle={{ borderColor: '#feca57', backgroundColor: '#feca57' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="priority" label={<span style={{ color: 'white', fontWeight: 'bold' }}>⭐ Priority Level:</span>}>
                <Select size="large">
                  <Option value="high">🔴 High Priority</Option>
                  <Option value="medium">🟡 Medium Priority</Option>
                  <Option value="low">🟢 Low Priority</Option>
                  <Option value="mixed">🎯 Mixed Priorities</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="complexity" label={<span style={{ color: 'white', fontWeight: 'bold' }}>🎯 Complexity Level:</span>}>
                <Select size="large">
                  <Option value="beginner">🟢 Beginner</Option>
                  <Option value="intermediate">🟡 Intermediate</Option>
                  <Option value="advanced">🔴 Advanced</Option>
                  <Option value="expert">🚀 Expert</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{
              width: '100%',
              height: 60,
              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
              border: 'none',
              borderRadius: 12,
              fontSize: '18px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? '🔄 Generating AI Questions...' : '🚀 GENERATE AI QUESTIONS NOW! 🤖'}
          </Button>
        </Form>

        <Alert
          message="💡 DEMO MODE"
          description="This generates sample AI questions for demonstration. In production with API keys, this connects to real AI services!"
          type="info"
          style={{ 
            marginTop: 20,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}
        />
      </Card>
{/* Generated Questions Results */}
      {showResults && (
        <Card 
          title={
            <Title level={3} style={{ color: '#667eea', margin: 0 }}>
              🎉 Generated AI Questions
            </Title>
          }
          style={{ borderRadius: 12 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Title level={2} style={{ color: '#feca57', margin: 0 }}>{generatedQuestions.length}</Title>
                <Text>Questions Generated</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Title level={2} style={{ color: '#feca57', margin: 0 }}>
                  {generatedQuestions[0]?.category?.charAt(0).toUpperCase() + generatedQuestions[0]?.category?.slice(1) || '-'}
                </Title>
                <Text>Category</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Title level={2} style={{ color: '#feca57', margin: 0 }}>
                  {generatedQuestions[0]?.priority?.charAt(0).toUpperCase() + generatedQuestions[0]?.priority?.slice(1) || '-'}
                </Title>
                <Text>Priority</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Title level={2} style={{ color: '#feca57', margin: 0 }}>
                  {generatedQuestions[0]?.complexity?.charAt(0).toUpperCase() + generatedQuestions[0]?.complexity?.slice(1) || '-'}
                </Title>
                <Text>Complexity</Text>
              </Card>
            </Col>
          </Row>

          <div>
            {generatedQuestions.map((question, index) => (
              <Card 
                key={question.id}
                size="small" 
                style={{ 
                  marginBottom: 15,
                  borderLeft: `4px solid ${getPriorityColor(question.priority)}`,
                  background: '#f8f9fa'
                }}
              >
                <Title level={5} style={{ color: '#667eea', marginBottom: 8 }}>
                  Q{index + 1}: {question.q}
                </Title>
                <Space wrap>
                  {question.tags.map(tag => (
                    <Tag key={tag} color={getPriorityColor(question.priority)}>
                      {tag}
                    </Tag>
                  ))}
                  <Tag color="#667eea">{question.complexity}</Tag>
                  <Tag color="#5f27cd">AI Generated</Tag>
                </Space>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderCategoryTab = (categoryKey) => {
    const info = categoryInfo[categoryKey];
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
          {info.icon}
        </div>
        <Title level={2}>{info.title}</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          {info.description}
        </Paragraph>
        
        <Card 
          style={{ 
            marginTop: 30, 
            textAlign: 'left',
            background: '#f8f9fa',
            borderRadius: 10 
          }}
        >
          <Title level={4}>📝 Sample Questions:</Title>
          <ul style={{ lineHeight: 1.6 }}>
            {demoQuestions[categoryKey]?.slice(0, 4).map((q, idx) => (
              <li key={idx}>{q.q}</li>
            ))}
          </ul>
        </Card>

        <Alert
          message="💡 Want AI questions? Go to the 'AI Questions' tab!"
          type="info"
          showIcon
          style={{ marginTop: 20 }}
        />
      </div>
    );
  };

  const tabItems = [
    // AI QUESTIONS TAB - FIRST AND MOST PROMINENT
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
            {demoQuestions[key]?.length || 0}
          </Tag>
        </span>
      ),
      children: renderCategoryTab(key)
    }))
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={1} style={{ color: '#667eea', margin: 0 }}>
          🤖 AI-Powered Question Bank
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', margin: '8px 0 0 0' }}>
          Generate unlimited WMS implementation questions using artificial intelligence
        </Paragraph>
      </div>

      {/* Main Warning Banner */}
      <Alert
        message="🚨 LOOKING FOR AI QUESTION GENERATION?"
        description="Click the '🤖 AI QUESTIONS' tab below to generate unlimited WMS questions with AI!"
        type="warning"
        showIcon
        style={{
          marginBottom: 24,
          padding: 20,
          fontSize: '16px',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
          border: 'none',
          borderRadius: 12,
          color: 'white'
        }}
        closable={false}
      />

      {/* Tabs */}
      <Tabs
        defaultActiveKey="ai-questions"
        items={tabItems}
        size="large"
        style={{
          background: 'white',
          borderRadius: 15,
          padding: '0 0 20px 0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};

export default QuestionBank;
