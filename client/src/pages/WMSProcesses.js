import React, { useState, useEffect } from 'react';
import { Card, Collapse, Typography, Spin, Alert, Row, Col, Tag, Input } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { wmsProcessAPI } from '../services/api';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Search } = Input;

const WMSProcesses = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadWMSProcesses();
  }, []);

  const loadWMSProcesses = async () => {
    try {
      setLoading(true);
      const response = await wmsProcessAPI.getAll();
      setProcesses(response.data);
    } catch (err) {
      setError('Failed to load WMS processes');
    } finally {
      setLoading(false);
    }
  };

  const filteredProcesses = processes.filter(process =>
    process.process_name.toLowerCase().includes(searchText.toLowerCase()) ||
    process.category.toLowerCase().includes(searchText.toLowerCase()) ||
    process.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const groupedProcesses = filteredProcesses.reduce((groups, process) => {
    const category = process.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(process);
    return groups;
  }, {});

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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>WMS Processes Reference</Title>
        <Text type="secondary">
          Comprehensive guide to Warehouse Management System processes, typical questions, and technical considerations.
        </Text>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search processes, categories, or descriptions..."
          allowClear
          style={{ maxWidth: 400 }}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
        />
      </div>

      {Object.keys(groupedProcesses).map(category => (
        <Card 
          key={category}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SettingOutlined />
              <span>{category}</span>
              <Tag color="blue">{groupedProcesses[category].length} processes</Tag>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Collapse ghost>
            {groupedProcesses[category].map(process => (
              <Panel
                key={process.id}
                header={
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {process.process_name}
                    </Title>
                    <Text type="secondary">{process.description}</Text>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card size="small" title="Typical Questions" type="inner">
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {process.typical_questions ? (
                          <ul className="research-list">
                            {JSON.parse(process.typical_questions).map((question, index) => (
                              <li key={index}>{question}</li>
                            ))}
                          </ul>
                        ) : (
                          <Text type="secondary">No typical questions available</Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Card size="small" title="Technical Considerations" type="inner">
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        <Text>{process.technical_considerations || 'No technical considerations specified'}</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <div style={{ marginTop: 16, padding: 12, background: '#f6f8fa', borderRadius: 6 }}>
                  <Title level={5} style={{ marginBottom: 8 }}>Implementation Tips</Title>
                  <Text>
                    When discussing {process.process_name.toLowerCase()} with clients, focus on understanding their current 
                    workflow, pain points, and specific requirements. Consider industry-specific needs and integration 
                    requirements with existing systems.
                  </Text>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>
      ))}

      {Object.keys(groupedProcesses).length === 0 && (
        <div className="empty-state">
          <h3>No WMS Processes Found</h3>
          <p>
            {searchText 
              ? 'No processes match your search criteria. Try adjusting your search terms.' 
              : 'No WMS processes are available in the system.'
            }
          </p>
        </div>
      )}

      {/* Additional Information Card */}
      <Card 
        title="About WMS Processes" 
        style={{ marginTop: 24 }}
        type="inner"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={5}>Inbound Operations</Title>
            <Text>
              Processes focused on receiving, put-away, and initial inventory management. 
              Critical for establishing accurate inventory records and efficient storage.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Outbound Operations</Title>
            <Text>
              Processes handling order fulfillment, picking, packing, and shipping. 
              Key to customer satisfaction and operational efficiency.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Inventory Control</Title>
            <Text>
              Ongoing processes for maintaining inventory accuracy, cycle counting, 
              and inventory optimization throughout the warehouse.
            </Text>
          </Col>
        </Row>
        
        <div style={{ marginTop: 16, padding: 16, background: '#e6f7ff', borderRadius: 6, border: '1px solid #91d5ff' }}>
          <Title level={5} style={{ color: '#1890ff', marginBottom: 8 }}>
            How to Use This Reference
          </Title>
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>Use typical questions as a starting point for client discussions</li>
            <li>Adapt questions based on client's industry and specific requirements</li>
            <li>Consider technical considerations when designing WMS solutions</li>
            <li>Reference process descriptions to explain WMS capabilities to clients</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default WMSProcesses;