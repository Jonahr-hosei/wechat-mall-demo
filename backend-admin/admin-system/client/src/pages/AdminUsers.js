import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AdminUsers.css';

const { Option } = Select;

const AdminUsers = () => {
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
  const [searchText, setSearchText] = useState('');
  const [searchRole, setSearchRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, searchRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/admin', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
          role: searchRole
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

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    setModalVisible(true);
    if (user) {
      form.setFieldsValue({
        ...user,
        password: undefined // 编辑时不显示密码
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await axios.put(`/api/users/admin/${editingUser.id}`, values);
        message.success('用户更新成功');
      } else {
        await axios.post('/api/users/admin', values);
        message.success('用户创建成功');
      }

      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/admin/${id}`);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers();
  };

  const handleReset = () => {
    setSearchText('');
    setSearchRole('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers();
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '普通用户', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-users-page">
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="用户总数" value={pagination.total} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="管理员" 
              value={users.filter(u => u.role === 'admin').length}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="普通用户" 
              value={users.filter(u => u.role === 'user').length}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic title="今日新增" value={0} />
          </Col>
        </Row>

        {/* 搜索与操作栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
          <Col>
            <Input
              placeholder="搜索用户名或姓名"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="角色"
              value={searchRole}
              onChange={v => setSearchRole(v)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="admin">管理员</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </Col>
          <Col>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Col>
          <Col style={{ marginLeft: 'auto' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              添加用户
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' }
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? '新密码（留空则不修改）' : '密码'}
            rules={[
              ...(editingUser ? [] : [{ required: true, message: '请输入密码' }]),
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改密码' : '请输入密码'} />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[
              { required: true, message: '请选择角色' }
            ]}
          >
            <Select placeholder="请选择角色">
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
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

export default AdminUsers; 