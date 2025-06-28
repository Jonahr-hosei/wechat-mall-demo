import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Popconfirm } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('获取订单列表失败');
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

  const showOrderDetail = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setCurrentOrder(response.data.data);
        setDetailVisible(true);
      }
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('订单状态更新失败');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/cancel`);
      message.success('订单已取消');
      fetchOrders();
    } catch (error) {
      message.error('取消订单失败');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'orange',
      'processing': 'blue',
      'completed': 'green',
      'cancelled': 'red',
      'timeout': 'red'
    };
    return statusMap[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待支付',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消',
      'timeout': '已超时'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'wechat': '微信支付',
      'alipay': '支付宝'
    };
    return methodMap[method] || method || '未支付';
  };

  const getPaymentMethodColor = (method) => {
    const methodMap = {
      'wechat': 'green',
      'alipay': 'blue'
    };
    return methodMap[method] || 'default';
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 200,
      render: (orderNo) => (
        <Tag color="blue">{orderNo}</Tag>
      ),
    },
    {
      title: '用户信息',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId) => `用户${userId}`,
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
          ¥{amount}
        </span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = getStatusColor(status);
        const text = getStatusText(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        const color = getPaymentMethodColor(method);
        const text = getPaymentMethodText(method);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '支付时间',
      dataIndex: 'payment_time',
      key: 'payment_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record.id)}
          >
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要取消这个订单吗？"
              onConfirm={() => cancelOrder(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                取消订单
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>订单管理</h2>
      
      <Table
        columns={columns}
        dataSource={orders}
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
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentOrder && (
          <div>
            <Descriptions title="基本信息" bordered>
              <Descriptions.Item label="订单号">{currentOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="用户">{currentOrder.nickname}</Descriptions.Item>
              <Descriptions.Item label="手机号">{currentOrder.phone}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{currentOrder.total_amount}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={getStatusColor(currentOrder.status)}>
                  {getStatusText(currentOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentOrder.payment_method || '未支付'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(currentOrder.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {currentOrder.payment_time ? new Date(currentOrder.payment_time).toLocaleString() : '未支付'}
              </Descriptions.Item>
            </Descriptions>

            {currentOrder.items && currentOrder.items.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>商品详情</h4>
                <Table
                  columns={[
                    { title: '商品名称', dataIndex: 'product_name' },
                    { title: '单价', dataIndex: 'product_price', render: (price) => `¥${price}` },
                    { title: '数量', dataIndex: 'quantity' },
                    { title: '小计', dataIndex: 'subtotal', render: (subtotal) => `¥${subtotal}` },
                  ]}
                  dataSource={currentOrder.items}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders; 