import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined,
  CarOutlined,
  GiftOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [overview, setOverview] = useState({});
  const [salesTrend, setSalesTrend] = useState([]);
  const [productRanking, setProductRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [overviewRes, salesRes, rankingRes] = await Promise.all([
        axios.get('/api/statistics/overview'),
        axios.get('/api/statistics/sales-trend?days=7'),
        axios.get('/api/statistics/product-ranking?limit=5')
      ]);

      setOverview(overviewRes.data.data);
      setSalesTrend(salesRes.data.data);
      setProductRanking(rankingRes.data.data);
    } catch (error) {
      console.error('获取数据失败:', error);
      setError('数据加载失败，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const productColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (category) => <Tag color="blue">{category || '未分类'}</Tag>,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{sales}</span>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`,
    },
  ];

  return (
    <div className="dashboard">
      <h2>仪表盘</h2>
      
      {error && (
        <div style={{ 
          marginBottom: 16, 
          padding: 16, 
          backgroundColor: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: 6,
          color: '#cf1322'
        }}>
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={overview.users?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              今日新增: {overview.users?.today || 0}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={overview.products?.total || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              上架商品: {overview.products?.active || 0}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={overview.orders?.total || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              今日订单: {overview.orders?.today || 0}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总营收"
              value={overview.orders?.revenue || 0}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              今日营收: ¥{overview.orders?.todayRevenue || 0}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="停车记录"
              value={overview.parking?.total || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              正在停车: {overview.parking?.now || 0}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="停车收入"
              value={overview.parking?.revenue || 0}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总积分"
              value={overview.points?.total || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              有积分用户: {overview.points?.users || 0}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 销售趋势和商品排行 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="销售趋势" loading={loading}>
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <RiseOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 16 }}>
                  近7天销售趋势
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
                  共 {salesTrend.length} 天有销售记录
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="商品销售排行" loading={loading}>
            <Table
              columns={productColumns}
              dataSource={productRanking}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 