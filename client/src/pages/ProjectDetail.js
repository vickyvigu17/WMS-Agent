import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  message, 
  Spin, 
  Alert,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  Progress,
  Tag,
  Space,
  Collapse,
  Typography,
  Row,
  Col,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { projectAPI, questionAPI } from '../services/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [addQuestionModalVisible, setAddQuestionModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerForm] = Form.useForm();
  const [questionForm] = Form.useForm();

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectResponse, questionsResponse] = await Promise.all([
        projectAPI.getById(id),
        questionAPI.getByProjectId(id).catch(() => ({ data: [] }))
      ]);
      
      setProject(projectResponse.data);
      setQuestions(questionsResponse.data);
    } catch (error) {
      message.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      setGenerating(true);
      const response = await questionAPI.generate(id);
      message.success(`Generated ${response.data.question_count} questions successfully!`);
      // Reload questions
      const questionsResponse = await questionAPI.getByProjectId(id);
      setQuestions(questionsResponse.data);
    } catch (error) {
      message.error('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    answerForm.setFieldsValue({
      answer: question.answer || '',
      notes: question.notes || ''
    });
    setAnswerModalVisible(true);
  };

  const handleSaveAnswer = async (values) => {
    try {
      await questionAPI.updateAnswer(selectedQuestion.id, values);
      message.success('Answer saved successfully');
      setAnswerModalVisible(false);
      answerForm.resetFields();
      setSelectedQuestion(null);
      // Reload questions
      const questionsResponse = await questionAPI.getByProjectId(id);
      setQuestions(questionsResponse.data);
    } catch (error) {
      message.error('Failed to save answer');
    }
  };

  const handleAddCustomQuestion = async (values) => {
    try {
      await questionAPI.addCustom(id, values);
      message.success('Custom question added successfully');
      setAddQuestionModalVisible(false);
      questionForm.resetFields();
      // Reload questions
      const questionsResponse = await questionAPI.getByProjectId(id);
      setQuestions(questionsResponse.data);
    } catch (error) {
      message.error('Failed to add custom question');
    }
  };

  const getPriorityLabel = (priority) => {
    if (priority <= 1) return { text: 'HIGH', color: 'red' };
    if (priority <= 2) return { text: 'MEDIUM', color: 'orange' };
    return { text: 'LOW', color: 'green' };
  };

  const getQuestionsByCategory = () => {
    const categories = {};
    questions.forEach(question => {
      if (!categories[question.category]) {
        categories[question.category] = [];
      }
      categories[question.category].push(question);
    });
    return categories;
  };

  const answeredQuestions = questions.filter(q => q.is_answered).length;
  const completionRate = questions.length > 0 ? Math.round((answeredQuestions / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <Alert message="Project not found" type="error" />;
  }

  const questionsByCategory = getQuestionsByCategory();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          style={{ marginRight: 16 }}
        >
          Back to Projects
        </Button>
        <Button 
          icon={<EditOutlined />} 
          onClick={() => navigate(`/projects/${id}/edit`)}
        >
          Edit Project
        </Button>
      </div>

      <Card title={project.name} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Descriptions column={1}>
              <Descriptions.Item label="Client">{project.client_name}</Descriptions.Item>
              <Descriptions.Item label="Industry">{project.industry || '-'}</Descriptions.Item>
              <Descriptions.Item label="Company Size">{project.company_size || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={project.status === 'active' ? 'green' : 'blue'}>
                  {project.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions column={1}>
              <Descriptions.Item label="Start Date">
                {project.start_date ? dayjs(project.start_date).format('MMM DD, YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Completion">
                {project.expected_completion ? dayjs(project.expected_completion).format('MMM DD, YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(project.created_at).format('MMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        
        {project.description && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Description</Title>
            <Text>{project.description}</Text>
          </div>
        )}
      </Card>

      <Tabs defaultActiveKey="questions">
        <TabPane tab={<span><QuestionCircleOutlined />Questions ({questions.length})</span>} key="questions">
          {/* Progress and Actions */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Completion Progress</Text>
                  <Progress 
                    percent={completionRate} 
                    status={completionRate === 100 ? 'success' : 'active'}
                    format={() => `${answeredQuestions}/${questions.length}`}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={16}>
                <Space wrap>
                  <Button 
                    type="primary"
                    icon={<BulbOutlined />}
                    onClick={handleGenerateQuestions}
                    loading={generating}
                  >
                    Generate Questions
                  </Button>
                  <Button 
                    icon={<PlusOutlined />}
                    onClick={() => setAddQuestionModalVisible(true)}
                  >
                    Add Custom Question
                  </Button>
                  <Text type="secondary">
                    {answeredQuestions} of {questions.length} questions answered
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Questions by Category */}
          {Object.keys(questionsByCategory).length > 0 ? (
            <Collapse defaultActiveKey={Object.keys(questionsByCategory)} ghost>
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <Panel 
                  key={category}
                  header={
                    <Space>
                      <span style={{ fontWeight: 500 }}>
                        {category.replace('_', ' ').toUpperCase()}
                      </span>
                      <Tag color="blue">{categoryQuestions.length} questions</Tag>
                      <Tag color="green">
                        {categoryQuestions.filter(q => q.is_answered).length} answered
                      </Tag>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {categoryQuestions.map((question, index) => {
                      const priorityInfo = getPriorityLabel(question.priority);
                      return (
                        <Card 
                          key={question.id}
                          className={`question-card ${question.is_answered ? 'answered' : ''}`}
                          size="small"
                          title={
                            <Space>
                              <span>Q{index + 1}</span>
                              <Tag color={priorityInfo.color} size="small">
                                {priorityInfo.text}
                              </Tag>
                              {question.is_answered && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            </Space>
                          }
                          extra={
                            <Button 
                              size="small"
                              onClick={() => handleAnswerQuestion(question)}
                            >
                              {question.is_answered ? 'Edit Answer' : 'Answer'}
                            </Button>
                          }
                        >
                          <div style={{ marginBottom: 12 }}>
                            <Text strong>{question.question}</Text>
                          </div>
                          
                          {question.is_answered && (
                            <div>
                              <Text type="secondary">Answer:</Text>
                              <div style={{ marginTop: 4, padding: '8px 12px', background: '#f6ffed', borderRadius: 4 }}>
                                <Text>{question.answer}</Text>
                              </div>
                              {question.notes && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary">Notes:</Text>
                                  <div style={{ marginTop: 4 }}>
                                    <Text italic>{question.notes}</Text>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </Space>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <div className="empty-state">
              <h3>No Questions Generated Yet</h3>
              <p>Click "Generate Questions" to create tailored WMS questions based on the client's industry and requirements.</p>
            </div>
          )}
        </TabPane>
      </Tabs>

      {/* Answer Question Modal */}
      <Modal
        title={`Answer Question`}
        open={answerModalVisible}
        onCancel={() => {
          setAnswerModalVisible(false);
          answerForm.resetFields();
          setSelectedQuestion(null);
        }}
        onOk={() => answerForm.submit()}
        width={600}
      >
        {selectedQuestion && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>{selectedQuestion.question}</Text>
            </div>
            
            <Form
              form={answerForm}
              layout="vertical"
              onFinish={handleSaveAnswer}
            >
              <Form.Item
                name="answer"
                label="Answer"
                rules={[{ required: true, message: 'Please provide an answer' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter the client's response to this question"
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Notes (Optional)"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Add any additional notes, context, or follow-up actions"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Add Custom Question Modal */}
      <Modal
        title="Add Custom Question"
        open={addQuestionModalVisible}
        onCancel={() => {
          setAddQuestionModalVisible(false);
          questionForm.resetFields();
        }}
        onOk={() => questionForm.submit()}
        width={600}
      >
        <Form
          form={questionForm}
          layout="vertical"
          onFinish={handleAddCustomQuestion}
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: 'Please enter the question' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter your custom question"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            initialValue="custom"
          >
            <Select>
              <Option value="custom">Custom</Option>
              <Option value="wms_processes">WMS Processes</Option>
              <Option value="technical_architecture">Technical Architecture</Option>
              <Option value="business_requirements">Business Requirements</Option>
              <Option value="integration">Integration</Option>
              <Option value="client_specific">Client Specific</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            initialValue={2}
          >
            <Select>
              <Option value={1}>High</Option>
              <Option value={2}>Medium</Option>
              <Option value={3}>Low</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;