import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Space,
  Tag,
  Spin,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getAll();
      setClients(response.data);
    } catch (error) {
      message.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    form.setFieldsValue(client);
    setModalVisible(true);
  };

  const handleDelete = async (clientId) => {
    try {
      await clientAPI.delete(clientId);
      message.success('Client deleted successfully');
      loadClients();
    } catch (error) {
      message.error('Failed to delete client');
    }
  };

  const handleView = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingClient) {
        await clientAPI.update(editingClient.id, values);
        message.success('Client updated successfully');
      } else {
        await clientAPI.create(values);
        message.success('Client created successfully');
      }
      setModalVisible(false);
      loadClients();
    } catch (error) {
      message.error('Failed to save client');
    }
  };

  const columns = [
    {
      title: 'Name',
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
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      filters: [
        { text: 'Manufacturing', value: 'Manufacturing' },
        { text: 'Retail', value: 'Retail' },
        { text: 'Healthcare', value: 'Healthcare' },
        { text: 'Food & Beverage', value: 'Food & Beverage' },
        { text: 'Logistics', value: 'Logistics' }
      ],
      onFilter: (value, record) => record.industry === value,
      render: (industry) => industry ? <Tag color="blue">{industry}</Tag> : '-'
    },
    {
      title: 'Company Size',
      dataIndex: 'company_size',
      key: 'company_size',
      filters: [
        { text: 'Small', value: 'Small' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Large', value: 'Large' }
      ],
      onFilter: (value, record) => record.company_size === value,
      render: (size) => size ? <Tag color="green">{size}</Tag> : '-'
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Contact Email',
      dataIndex: 'contact_email',
      key: 'contact_email'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="table-actions">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            size="small"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </div>
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
        <h1 className="page-title">Clients</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Client
        </Button>
      </div>

      <Table
        dataSource={clients}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} clients`
        }}
      />

      <Modal
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Client Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input placeholder="Enter client name" />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Industry"
          >
            <Select placeholder="Select industry">
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Retail">Retail</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Food & Beverage">Food & Beverage</Option>
              <Option value="Logistics">Logistics</Option>
              <Option value="E-commerce">E-commerce</Option>
              <Option value="Automotive">Automotive</Option>
              <Option value="Chemical">Chemical</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="company_size"
            label="Company Size"
          >
            <Select placeholder="Select company size">
              <Option value="Small">Small (1-50 employees)</Option>
              <Option value="Medium">Medium (51-500 employees)</Option>
              <Option value="Large">Large (500+ employees)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter location (city, state, country)" />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Contact Email"
            rules={[{ type: 'email', message: 'Please enter valid email' }]}
          >
            <Input placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Contact Phone"
          >
            <Input placeholder="Enter contact phone" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter client description, business focus, current challenges, etc."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clients;