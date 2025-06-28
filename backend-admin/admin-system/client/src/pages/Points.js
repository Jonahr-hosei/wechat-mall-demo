import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const Points = () => {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchRecords();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/points/records', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      
      if (response.data.success) {
        setRecords(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('获取积分记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/points/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  const showModal = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      await axios.post('/api/points/adjust', values);
      message.success('积分调整成功');
      setModalVisible(false);
      fetchRecords();
      fetchStatistics();
    } catch (error) {
      message.error('积分调整失败');
    }
  };

  const getTypeColor = (type) => {
    const typeMap = {
      'purchase': 'green',
      'task': 'blue',
      'exchange': 'orange',
      'adjust': 'purple',
      'expire': 'red'
    };
    return typeMap[type] || 'default';
  };

  const getTypeText = (type) => {
    const typeMap = {
      'purchase': '购物获得',
      'task': '任务奖励',
      'exchange': '积分兑换',
      'adjust': '手动调整',
      'expire': '积分过期'
    };
    return typeMap[type] || type;
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname) => nickname || '未知用户',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '积分变动',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <span style={{ 
          color: points > 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {points > 0 ? '+' : ''}{points}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2>积分管理</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总积分"
              value={statistics.totalPoints || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="有积分用户"
              value={statistics.totalUsers || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日获得"
              value={statistics.todayPoints || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日使用"
              value={statistics.todayUsed || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          调整积分
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={records}
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
        title="调整积分"
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
            name="user_id"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入用户ID"
            />
          </Form.Item>

          <Form.Item
            name="points"
            label="积分变动"
            rules={[{ required: true, message: '请输入积分变动' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="正数为增加，负数为减少"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="变动类型"
            rules={[{ required: true, message: '请选择变动类型' }]}
          >
            <Select placeholder="请选择变动类型">
              <Option value="adjust">手动调整</Option>
              <Option value="task">任务奖励</Option>
              <Option value="exchange">积分兑换</Option>
              <Option value="expire">积分过期</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入积分变动描述"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认调整
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

export default Points; 