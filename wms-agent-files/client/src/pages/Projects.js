import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Spin, Input } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientAPI, projectAPI } from '../services/api';
import dayjs from 'dayjs';

const { Search } = Input;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsResponse] = await Promise.all([
        clientAPI.getAll()
      ]);
      
      setClients(clientsResponse.data);
      
      // Load all projects for all clients
      const allProjects = [];
      for (const client of clientsResponse.data) {
        try {
          const projectsResponse = await projectAPI.getByClientId(client.id);
          allProjects.push(...projectsResponse.data);
        } catch (error) {
          console.error(`Failed to load projects for client ${client.id}:`, error);
        }
      }
      setProjects(allProjects);
    } catch (error) {
      message.error('Failed to load projects data');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Button type="link" onClick={() => handleView(record.id)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      sorter: (a, b) => (a.client_name || '').localeCompare(b.client_name || ''),
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/clients/${record.client_id}`)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'On Hold', value: 'on_hold' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color = status === 'active' ? 'green' : 
                     status === 'completed' ? 'blue' : 
                     status === 'on_hold' ? 'orange' : 'default';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => {
        if (!a.start_date && !b.start_date) return 0;
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return dayjs(a.start_date).unix() - dayjs(b.start_date).unix();
      },
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Expected Completion',
      dataIndex: 'expected_completion',
      key: 'expected_completion',
      sorter: (a, b) => {
        if (!a.expected_completion && !b.expected_completion) return 0;
        if (!a.expected_completion) return 1;
        if (!b.expected_completion) return -1;
        return dayjs(a.expected_completion).unix() - dayjs(b.expected_completion).unix();
      },
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
          size="small"
        >
          View Details
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title">Projects</h1>
        <Search
          placeholder="Search projects..."
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
        />
      </div>

      <Table
        dataSource={filteredProjects}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: 16 }}>
              <p><strong>Description:</strong> {record.description || 'No description available'}</p>
            </div>
          ),
          rowExpandable: (record) => !!record.description,
        }}
      />

      {filteredProjects.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No Projects Found</h3>
          <p>
            {searchText 
              ? 'No projects match your search criteria.' 
              : 'No projects have been created yet. Go to a client page to create your first project.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Projects;