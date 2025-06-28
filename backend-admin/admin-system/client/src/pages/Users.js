import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    setModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleSubmit = async (values) => {
    try {
      await axios.put(`/api/users/${editingUser.id}`, values);
      message.success('用户信息更新成功');
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('用户信息更新失败');
    }
  };

  const getMemberLevelColor = (level) => {
    const levelMap = {
      '普通会员': 'blue',
      '银卡会员': 'green',
      '金卡会员': 'orange',
      '钻石会员': 'purple'
    };
    return levelMap[level] || 'default';
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname) => nickname || '未设置',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '未绑定',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <Tag color={points > 0 ? 'green' : 'default'}>
          {points || 0}
        </Tag>
      ),
    },
    {
      title: '会员等级',
      dataIndex: 'member_level',
      key: 'member_level',
      render: (level) => (
        <Tag color={getMemberLevelColor(level)}>
          {level}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>用户管理</h2>
      
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="编辑用户信息"
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
            name="nickname"
            label="昵称"
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="member_level"
            label="会员等级"
          >
            <Select placeholder="请选择会员等级">
              <Option value="普通会员">普通会员</Option>
              <Option value="银卡会员">银卡会员</Option>
              <Option value="金卡会员">金卡会员</Option>
              <Option value="钻石会员">钻石会员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 