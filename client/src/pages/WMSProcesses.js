import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Collapse, List, Spin } from 'antd';
import { wmsProcessesAPI } from '../services/api';

const { Panel } = Collapse;

const WMSProcesses = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await wmsProcessesAPI.getAll();
      setProcesses(response.data);
    } catch (error) {
      console.error('Error fetching WMS processes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Inbound':
        return '#1890ff';
      case 'Outbound':
        return '#52c41a';
      case 'Inventory':
        return '#fa8c16';
      default:
        return '#722ed1';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>WMS Processes Reference</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Comprehensive guide to Warehouse Management System processes and typical questions for each.
      </p>

      <Row gutter={[16, 16]}>
        {processes.map((process) => (
          <Col xs={24} lg={12} key={process.id}>
            <Card
              className="process-card"
              title={
                <div>
                  <span style={{ marginRight: '8px' }}>{process.name}</span>
                  <Tag color={getCategoryColor(process.category)}>
                    {process.category}
                  </Tag>
                </div>
              }
              style={{ height: '100%' }}
            >
              <p style={{ marginBottom: '16px' }}>{process.description}</p>
              
              <Collapse ghost>
                <Panel header="Typical Questions" key="questions">
                  <List
                    size="small"
                    dataSource={process.typical_questions}
                    renderItem={(question) => (
                      <List.Item>
                        <span style={{ color: '#666' }}>• {question}</span>
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default WMSProcesses;
