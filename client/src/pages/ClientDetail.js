import React from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';

const ClientDetail = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '24px' }}>
      <Card title={`Client Details - ID: ${id}`}>
        <p>Client detail page coming soon! This will show client information, projects, and market research.</p>
      </Card>
    </div>
  );
};

export default ClientDetail;
