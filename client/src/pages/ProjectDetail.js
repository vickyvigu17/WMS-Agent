import React from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '24px' }}>
      <Card title={`Project Details - ID: ${id}`}>
        <p>Project detail page coming soon! This will show project information and question management.</p>
      </Card>
    </div>
  );
};

export default ProjectDetail;
