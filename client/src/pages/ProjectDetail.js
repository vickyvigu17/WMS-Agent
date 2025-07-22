import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Space>
      
      <Card title={`Project Details - ID: ${id}`}>
        <p>Project detail page with question management coming soon!</p>
        <p>This will include:</p>
        <ul>
          <li>✅ Project information</li>
          <li>✅ Question generation</li>
          <li>✅ Answer tracking</li>
          <li>✅ Progress monitoring</li>
        </ul>
      </Card>
    </div>
  );
};

export default ProjectDetail;
