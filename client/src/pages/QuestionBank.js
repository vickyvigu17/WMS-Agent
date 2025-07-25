import React, { useState } from 'react';
import { 
  Card, Tabs, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm, Row, Col, Collapse
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, 
  InboxOutlined, SendOutlined, ApiOutlined, SettingOutlined, UserOutlined,
  DatabaseOutlined, TruckOutlined, ScanOutlined, SafetyOutlined, TeamOutlined,
  DashboardOutlined, ClockCircleOutlined, ShoppingCartOutlined, FileTextOutlined,
  ToolOutlined, CloudOutlined, MobileOutlined, BarChartOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const QuestionBank = () => {
  const [questions, setQuestions] = useState({
    // INBOUND OPERATIONS
    receiving: [
      { id: 1, text: "What is your current receiving process flow from truck arrival to inventory confirmation?", priority: "High", category: "receiving" },
      { id: 2, text: "How do you handle advance shipping notices (ASN) and what information do you require?", priority: "High", category: "receiving" },
      { id: 3, text: "What are your dock door management requirements and scheduling processes?", priority: "Medium", category: "receiving" },
      { id: 4, text: "How do you manage appointment scheduling for inbound deliveries?", priority: "Medium", category: "receiving" },
      { id: 5, text: "What quality control checks are performed during receiving?", priority: "High", category: "receiving" },
      { id: 6, text: "How do you handle discrepancies in quantity, quality, or documentation?", priority: "High", category: "receiving" },
      { id: 7, text: "What are your requirements for cross-docking operations?", priority: "Medium", category: "receiving" },
      { id: 8, text: "How do you manage returns processing and reverse logistics?", priority: "Medium", category: "receiving" }
    ],
    putaway: [
      { id: 9, text: "What putaway strategies do you currently use (FIFO, LIFO, location-based)?", priority: "High", category: "putaway" },
      { id: 10, text: "How do you determine optimal storage locations for different product types?", priority: "High", category: "putaway" },
      { id: 11, text: "What are your requirements for directed putaway vs. random putaway?", priority: "Medium", category: "putaway" },
      { id: 12, text: "How do you handle putaway for hazardous or special handling materials?", priority: "High", category: "putaway" },
      { id: 13, text: "What slotting optimization requirements do you have?", priority: "Medium", category: "putaway" },
      { id: 14, text: "How do you manage putaway task prioritization and sequencing?", priority: "Medium", category: "putaway" }
    ],
    
    // INVENTORY MANAGEMENT
    inventory: [
      { id: 15, text: "What inventory tracking methods do you currently use (lot, serial, batch)?", priority: "High", category: "inventory" },
      { id: 16, text: "How frequently do you perform cycle counts and full physical inventories?", priority: "High", category: "inventory" },
      { id: 17, text: "What are your requirements for real-time inventory visibility?", priority: "High", category: "inventory" },
      { id: 18, text: "How do you manage inventory adjustments and variance reporting?", priority: "Medium", category: "inventory" },
      { id: 19, text: "What ABC analysis and inventory classification do you require?", priority: "Medium", category: "inventory" },
      { id: 20, text: "How do you handle expiration date tracking and FEFO management?", priority: "High", category: "inventory" },
      { id: 21, text: "What are your requirements for inventory reservations and allocations?", priority: "Medium", category: "inventory" },
      { id: 22, text: "How do you manage safety stock levels and reorder points?", priority: "Medium", category: "inventory" }
    ],
    
    // OUTBOUND OPERATIONS
    picking: [
      { id: 23, text: "What picking methods do you currently use (discrete, batch, wave, zone)?", priority: "High", category: "picking" },
      { id: 24, text: "How do you optimize pick paths and travel time in the warehouse?", priority: "High", category: "picking" },
      { id: 25, text: "What are your requirements for pick task prioritization?", priority: "Medium", category: "picking" },
      { id: 26, text: "How do you handle short picks and back-order management?", priority: "High", category: "picking" },
      { id: 27, text: "What validation methods do you use to ensure pick accuracy?", priority: "High", category: "picking" },
      { id: 28, text: "How do you manage pick list generation and wave planning?", priority: "Medium", category: "picking" },
      { id: 29, text: "What are your requirements for voice, RF, or pick-to-light systems?", priority: "Medium", category: "picking" }
    ],
    packing: [
      { id: 30, text: "What packing strategies and cartonization rules do you require?", priority: "High", category: "packing" },
      { id: 31, text: "How do you determine optimal box sizes and packaging materials?", priority: "Medium", category: "packing" },
      { id: 32, text: "What are your requirements for pack verification and quality control?", priority: "High", category: "packing" },
      { id: 33, text: "How do you handle special packaging requirements (fragile, hazmat, etc.)?", priority: "High", category: "packing" },
      { id: 34, text: "What labeling requirements do you have for packages?", priority: "Medium", category: "packing" },
      { id: 35, text: "How do you manage packing productivity and performance metrics?", priority: "Medium", category: "packing" }
    ],
    shipping: [
      { id: 36, text: "What shipping carrier management and rate shopping requirements do you have?", priority: "High", category: "shipping" },
      { id: 37, text: "How do you handle multi-carrier shipping and carrier selection rules?", priority: "Medium", category: "shipping" },
      { id: 38, text: "What are your requirements for shipment tracking and visibility?", priority: "High", category: "shipping" },
      { id: 39, text: "How do you manage freight audit and payment processes?", priority: "Medium", category: "shipping" },
      { id: 40, text: "What documentation requirements do you have for international shipping?", priority: "Medium", category: "shipping" },
      { id: 41, text: "How do you handle shipment consolidation and LTL optimization?", priority: "Medium", category: "shipping" }
    ],
    
    // YARD MANAGEMENT
    yard: [
      { id: 42, text: "What yard management capabilities do you require for trailer tracking?", priority: "Medium", category: "yard" },
      { id: 43, text: "How do you manage dock door assignments and scheduling?", priority: "Medium", category: "yard" },
      { id: 44, text: "What are your requirements for yard jockey and equipment management?", priority: "Low", category: "yard" },
      { id: 45, text: "How do you handle detention and demurrage tracking?", priority: "Medium", category: "yard" },
      { id: 46, text: "What visibility do you need into yard activities and trailer status?", priority: "Medium", category: "yard" }
    ],
    
    // LABOR MANAGEMENT
    labor: [
      { id: 47, text: "What labor management and workforce planning capabilities do you need?", priority: "Medium", category: "labor" },
      { id: 48, text: "How do you track labor productivity and performance metrics?", priority: "Medium", category: "labor" },
      { id: 49, text: "What are your requirements for task interleaving and optimization?", priority: "Low", category: "labor" },
      { id: 50, text: "How do you manage labor standards and engineered time studies?", priority: "Medium", category: "labor" },
      { id: 51, text: "What incentive programs and performance tracking do you require?", priority: "Low", category: "labor" }
    ],
    
    // WAREHOUSE CONFIGURATION
    configuration: [
      { id: 52, text: "How do you want to configure warehouse zones and storage areas?", priority: "High", category: "configuration" },
      { id: 53, text: "What location labeling and addressing scheme do you prefer?", priority: "High", category: "configuration" },
      { id: 54, text: "How should the system handle different storage types (bulk, rack, floor)?", priority: "High", category: "configuration" },
      { id: 55, text: "What equipment types and capacities need to be configured?", priority: "Medium", category: "configuration" },
      { id: 56, text: "How do you want to set up user roles and permissions?", priority: "High", category: "configuration" },
      { id: 57, text: "What business rules and workflows need to be configured?", priority: "Medium", category: "configuration" }
    ],
    
    // TECHNOLOGY & INTEGRATION
    technology: [
      { id: 58, text: "What ERP system do you use and what integration points are required?", priority: "High", category: "technology" },
      { id: 59, text: "What other systems need to integrate with the WMS (TMS, OMS, etc.)?", priority: "High", category: "technology" },
      { id: 60, text: "What are your requirements for real-time vs. batch data integration?", priority: "Medium", category: "technology" },
      { id: 61, text: "How do you want to handle master data synchronization?", priority: "High", category: "technology" },
      { id: 62, text: "What API requirements and data formats do you prefer?", priority: "Medium", category: "technology" },
      { id: 63, text: "What are your cybersecurity and data protection requirements?", priority: "High", category: "technology" }
    ],
    automation: [
      { id: 64, text: "What warehouse automation equipment do you currently have or plan to implement?", priority: "Medium", category: "automation" },
      { id: 65, text: "How should the WMS integrate with conveyor systems and sortation equipment?", priority: "Medium", category: "automation" },
      { id: 66, text: "What are your requirements for robotic integration (AMR, AGV)?", priority: "Low", category: "automation" },
      { id: 67, text: "How do you want to handle automated storage and retrieval systems (AS/RS)?", priority: "Low", category: "automation" },
      { id: 68, text: "What pick-to-light or put-to-light system integration is needed?", priority: "Low", category: "automation" }
    ],
    mobile: [
      { id: 69, text: "What mobile device requirements do you have (RF guns, tablets, smartphones)?", priority: "High", category: "mobile" },
      { id: 70, text: "How should the mobile interface be designed for warehouse operations?", priority: "High", category: "mobile" },
      { id: 71, text: "What offline capabilities are required for mobile devices?", priority: "Medium", category: "mobile" },
      { id: 72, text: "How do you want to handle device management and maintenance?", priority: "Medium", category: "mobile" },
      { id: 73, text: "What barcode scanning and RFID requirements do you have?", priority: "High", category: "mobile" }
    ],
    
    // REPORTING & ANALYTICS
    reporting: [
      { id: 74, text: "What key performance indicators (KPIs) do you need to track?", priority: "High", category: "reporting" },
      { id: 75, text: "What standard reports do you require for daily operations?", priority: "High", category: "reporting" },
      { id: 76, text: "How do you want to handle executive dashboards and real-time monitoring?", priority: "Medium", category: "reporting" },
      { id: 77, text: "What ad-hoc reporting and data export capabilities do you need?", priority: "Medium", category: "reporting" },
      { id: 78, text: "How should the system handle historical data retention and archiving?", priority: "Medium", category: "reporting" },
      { id: 79, text: "What business intelligence and analytics tools integration is required?", priority: "Low", category: "reporting" }
    ],
    
    // COMPLIANCE & QUALITY
    compliance: [
      { id: 80, text: "What regulatory compliance requirements do you have (FDA, DOT, etc.)?", priority: "High", category: "compliance" },
      { id: 81, text: "How do you need to handle lot traceability and recall management?", priority: "High", category: "compliance" },
      { id: 82, text: "What quality control and inspection processes need to be supported?", priority: "High", category: "compliance" },
      { id: 83, text: "How should the system handle audit trails and documentation?", priority: "Medium", category: "compliance" },
      { id: 84, text: "What are your requirements for chain of custody tracking?", priority: "Medium", category: "compliance" },
      { id: 85, text: "How do you handle temperature monitoring and cold chain management?", priority: "Medium", category: "compliance" }
    ],
    
    // BUSINESS PROCESSES
    orders: [
      { id: 86, text: "How do you want to handle order prioritization and allocation rules?", priority: "High", category: "orders" },
      { id: 87, text: "What are your requirements for order splitting and consolidation?", priority: "Medium", category: "orders" },
      { id: 88, text: "How should the system handle rush orders and expedited processing?", priority: "Medium", category: "orders" },
      { id: 89, text: "What order modification and cancellation processes do you need?", priority: "Medium", category: "orders" },
      { id: 90, text: "How do you want to manage customer-specific requirements and SLAs?", priority: "Medium", category: "orders" }
    ],
    returns: [
      { id: 91, text: "What is your returns processing workflow and disposition rules?", priority: "High", category: "returns" },
      { id: 92, text: "How do you handle different return reasons and restocking processes?", priority: "Medium", category: "returns" },
      { id: 93, text: "What are your requirements for return merchandise authorization (RMA)?", priority: "Medium", category: "returns" },
      { id: 94, text: "How should the system handle refurbishment and repair processes?", priority: "Low", category: "returns" },
      { id: 95, text: "What customer communication is required during returns processing?", priority: "Medium", category: "returns" }
    ],
    
    // IMPLEMENTATION & SUPPORT
    implementation: [
      { id: 96, text: "What is your preferred implementation timeline and go-live strategy?", priority: "High", category: "implementation" },
      { id: 97, text: "How do you want to handle data migration from legacy systems?", priority: "High", category: "implementation" },
      { id: 98, text: "What training requirements do you have for different user groups?", priority: "High", category: "implementation" },
      { id: 99, text: "How should we approach testing and user acceptance processes?", priority: "High", category: "implementation" },
      { id: 100, text: "What change management and communication strategy do you prefer?", priority: "Medium", category: "implementation" }
    ],
    support: [
      { id: 101, text: "What ongoing support and maintenance requirements do you have?", priority: "Medium", category: "support" },
      { id: 102, text: "How do you want to handle system upgrades and enhancements?", priority: "Medium", category: "support" },
      { id: 103, text: "What service level agreements (SLAs) do you require for support?", priority: "Medium", category: "support" },
      { id: 104, text: "How should we handle escalation procedures and critical issues?", priority: "Medium", category: "support" },
      { id: 105, text: "What documentation and knowledge transfer requirements do you have?", priority: "Medium", category: "support" }
    ]
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();

  const categoryInfo = {
    // INBOUND OPERATIONS
    receiving: { 
      title: "Receiving Operations", 
      icon: <InboxOutlined />, 
      description: "Inbound delivery processing, dock management, quality control" 
    },
    putaway: { 
      title: "Putaway Management", 
      icon: <DatabaseOutlined />, 
      description: "Storage location assignment, putaway strategies, slotting optimization" 
    },
    
    // INVENTORY MANAGEMENT
    inventory: { 
      title: "Inventory Control", 
      icon: <BarChartOutlined />, 
      description: "Stock tracking, cycle counting, inventory accuracy, ABC analysis" 
    },
    
    // OUTBOUND OPERATIONS
    picking: { 
      title: "Order Picking", 
      icon: <ScanOutlined />, 
      description: "Pick strategies, path optimization, task management, accuracy validation" 
    },
    packing: { 
      title: "Packing Operations", 
      icon: <ShoppingCartOutlined />, 
      description: "Cartonization, packaging strategies, pack verification, labeling" 
    },
    shipping: { 
      title: "Shipping Management", 
      icon: <TruckOutlined />, 
      description: "Carrier management, rate shopping, shipment tracking, documentation" 
    },
    
    // YARD MANAGEMENT
    yard: { 
      title: "Yard Management", 
      icon: <SafetyOutlined />, 
      description: "Trailer tracking, dock scheduling, yard operations, detention tracking" 
    },
    
    // LABOR MANAGEMENT
    labor: { 
      title: "Labor Management", 
      icon: <TeamOutlined />, 
      description: "Workforce planning, productivity tracking, performance metrics, incentives" 
    },
    
    // WAREHOUSE CONFIGURATION
    configuration: { 
      title: "System Configuration", 
      icon: <SettingOutlined />, 
      description: "Warehouse setup, zones, locations, storage types, business rules" 
    },
    
    // TECHNOLOGY & INTEGRATION
    technology: { 
      title: "Technology Integration", 
      icon: <ApiOutlined />, 
      description: "ERP integration, system interfaces, APIs, data synchronization" 
    },
    automation: { 
      title: "Warehouse Automation", 
      icon: <ToolOutlined />, 
      description: "Conveyor systems, robotics, AS/RS, automated equipment integration" 
    },
    mobile: { 
      title: "Mobile Technology", 
      icon: <MobileOutlined />, 
      description: "RF devices, mobile interfaces, barcode scanning, offline capabilities" 
    },
    
    // REPORTING & ANALYTICS
    reporting: { 
      title: "Reporting & Analytics", 
      icon: <DashboardOutlined />, 
      description: "KPIs, dashboards, standard reports, business intelligence" 
    },
    
    // COMPLIANCE & QUALITY
    compliance: { 
      title: "Compliance & Quality", 
      icon: <SafetyOutlined />, 
      description: "Regulatory compliance, lot traceability, quality control, audit trails" 
    },
    
    // BUSINESS PROCESSES
    orders: { 
      title: "Order Management", 
      icon: <FileTextOutlined />, 
      description: "Order processing, prioritization, allocation, customer requirements" 
    },
    returns: { 
      title: "Returns Processing", 
      icon: <ClockCircleOutlined />, 
      description: "Return workflows, RMA processing, disposition rules, refurbishment" 
    },
    
    // IMPLEMENTATION & SUPPORT
    implementation: { 
      title: "Implementation Planning", 
      icon: <UserOutlined />, 
      description: "Go-live strategy, data migration, training, testing, change management" 
    },
    support: { 
      title: "Support & Maintenance", 
      icon: <CloudOutlined />, 
      description: "Ongoing support, SLAs, upgrades, documentation, knowledge transfer" 
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      text: question.text,
      priority: question.priority,
      category: question.category
    });
    setIsModalVisible(true);
  };

  const handleDeleteQuestion = (questionId, category) => {
    setQuestions(prev => ({
      ...prev,
      [category]: prev[category].filter(q => q.id !== questionId)
    }));
    message.success('Question deleted successfully');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const { text, priority, category } = values;
      
      if (editingQuestion) {
        // Edit existing question
        setQuestions(prev => ({
          ...prev,
          [category]: prev[category].map(q => 
            q.id === editingQuestion.id ? { ...q, text, priority, category } : q
          )
        }));
        message.success('Question updated successfully');
      } else {
        // Add new question
        const newQuestion = {
          id: Math.max(...Object.values(questions).flat().map(q => q.id)) + 1,
          text,
          priority,
          category
        };
        setQuestions(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), newQuestion]
        }));
        message.success('Question added successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const renderQuestionCard = (question, category) => (
    <Card 
      key={question.id}
      size="small" 
      className="question-card"
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: 16 }}>
          <p style={{ margin: 0, lineHeight: '1.4' }}>{question.text}</p>
          <Tag 
            color={question.priority === 'High' ? 'red' : question.priority === 'Medium' ? 'orange' : 'blue'}
            style={{ marginTop: 8 }}
          >
            {question.priority} Priority
          </Tag>
        </div>
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEditQuestion(question)}
          />
          <Popconfirm
            title="Are you sure you want to delete this question?"
            onConfirm={() => handleDeleteQuestion(question.id, category)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );

  const getTotalQuestions = () => {
    return Object.values(questions).reduce((total, categoryQuestions) => total + categoryQuestions.length, 0);
  };

  const getQuestionsByPriority = (priority) => {
    return Object.values(questions).flat().filter(q => q.priority === priority).length;
  };

  const tabItems = Object.entries(categoryInfo).map(([key, info]) => ({
    key,
    label: (
      <span style={{ fontSize: '14px' }}>
        {info.icon}
        <span style={{ marginLeft: 8 }}>{info.title}</span>
        <Tag 
          style={{ marginLeft: 8 }} 
          color="blue"
        >
          {questions[key]?.length || 0}
        </Tag>
      </span>
    ),
    children: (
      <div>
        <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{info.description}</p>
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddQuestion}
            className="modern-btn modern-btn-primary"
          >
            Add Question
          </Button>
        </Space>
        <div>
          {questions[key]?.map(question => renderQuestionCard(question, key))}
          {(!questions[key] || questions[key].length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <QuestionCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>No questions added yet for this category</p>
            </div>
          )}
        </div>
      </div>
    )
  }));

  return (
    <div className="main-content fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, color: '#1e293b' }}>
          <QuestionCircleOutlined style={{ marginRight: 12, color: '#3b82f6' }} />
          Question Bank
        </h1>
        <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '16px' }}>
          Comprehensive WMS question repository organized by process areas
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
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
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-card stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <UserOutlined />
              </div>
              <div>
                <h3>{getQuestionsByPriority('High')}</h3>
                <p>High Priority</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-card stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                <SettingOutlined />
              </div>
              <div>
                <h3>{getQuestionsByPriority('Medium')}</h3>
                <p>Medium Priority</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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

      {/* Question Categories */}
      <Card className="modern-card" style={{ minHeight: '60vh' }}>
        <Tabs 
          items={tabItems}
          size="large"
          style={{ minHeight: '500px' }}
          tabPosition="top"
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