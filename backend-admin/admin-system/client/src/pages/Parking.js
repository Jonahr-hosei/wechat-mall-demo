import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Card, Row, Col, Statistic } from 'antd';
import { CarOutlined, CheckOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const Parking = () => {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
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
      const response = await axios.get('/api/parking/records', {
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
      message.error('获取停车记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/parking/statistics');
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

  const endParking = async (recordId) => {
    try {
      await axios.post(`/api/parking/records/${recordId}/end`);
      message.success('停车结束成功');
      fetchRecords();
      fetchStatistics();
    } catch (error) {
      message.error('停车结束失败');
    }
  };

  const payParking = async (recordId) => {
    try {
      await axios.post(`/api/parking/records/${recordId}/pay`, {
        payment_method: 'manual'
      });
      message.success('支付成功');
      fetchRecords();
      fetchStatistics();
    } catch (error) {
      message.error('支付失败');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'parking': 'orange',
      'completed': 'green',
      'paid': 'blue'
    };
    return statusMap[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'parking': '停车中',
      'completed': '已完成',
      'paid': '已支付'
    };
    return statusMap[status] || status;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'plate_number',
      key: 'plate_number',
      width: 120,
    },
    {
      title: '用户',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname) => nickname || '未绑定用户',
    },
    {
      title: '入场时间',
      dataIndex: 'entry_time',
      key: 'entry_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '出场时间',
      dataIndex: 'exit_time',
      key: 'exit_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '停车时长',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (minutes) => formatDuration(minutes),
    },
    {
      title: '费用',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => (
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
          ¥{fee || 0}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'parking' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => endParking(record.id)}
            >
              结束停车
            </Button>
          )}
          {record.status === 'completed' && !record.payment_time && (
            <Button
              type="link"
              icon={<DollarOutlined />}
              onClick={() => payParking(record.id)}
            >
              确认支付
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>停车管理</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总停车记录"
              value={statistics.totalRecords || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日停车"
              value={statistics.todayRecords || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正在停车"
              value={statistics.parkingNow || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="停车收入"
              value={statistics.totalRevenue || 0}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default Parking; 