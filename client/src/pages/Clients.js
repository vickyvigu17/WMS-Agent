import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../services/api';

const { Option } = Select;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      message.error('Failed to fetch clients');
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

  const handleSubmit = async (values) => {
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, values);
        message.success('Client updated successfully');
      } else {
        await clientsAPI.create(values);
        message.success('Client created successfully');
      }
      setModalVisible(false);
      fetchClients();
    } catch (error) {
      message.error('Failed to save client');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Company Size',
      dataIndex: 'company_size',
      key: 'company_size',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/clients/${record.id}`)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Clients"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Client
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={clients}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingClient ? 'Edit Client' : 'Add Client'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Industry"
            name="industry"
          >
            <Select placeholder="Select industry">
              <Option value="E-commerce">E-commerce</Option>
              <Option value="Retail">Retail</Option>
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Automotive">Automotive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Company Size"
            name="company_size"
          >
            <Select placeholder="Select company size">
              <Option value="Small">Small (1-50 employees)</Option>
              <Option value="Medium">Medium (51-500 employees)</Option>
              <Option value="Large">Large (500+ employees)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contact Email"
            name="contact_email"
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Contact Phone"
            name="contact_phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingClient ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clients;
