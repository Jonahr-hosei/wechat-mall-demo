const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 调试信息
console.log('🚀 服务器启动中...');
console.log('📊 环境变量检查:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '已设置' : '未设置');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 根路径处理
app.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      message: '微信商城后端API服务',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        orders: '/api/orders',
        users: '/api/users',
        points: '/api/points',
        parking: '/api/parking',
        statistics: '/api/statistics',
        mall: '/api/mall'
      }
    });
  } catch (error) {
    console.error('根路径处理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('健康检查错误:', error);
    res.status(500).json({
      success: false,
      message: '服务异常',
      error: error.message
    });
  }
});

// 测试数据库连接
app.get('/test-db', async (req, res) => {
  try {
    const supabase = require('./config/database');
    
    // 测试连接
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('数据库连接测试失败:', error);
      return res.status(500).json({
        success: false,
        message: '数据库连接失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: '数据库连接正常',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('数据库测试错误:', error);
    res.status(500).json({
      success: false,
      message: '数据库测试失败',
      error: error.message
    });
  }
});

// 路由
try {
  console.log('📁 加载路由...');
  
  // 认证路由
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ 认证路由加载完成');

  // 商品路由
  const productsRoutes = require('./routes/products');
  app.use('/api/products', productsRoutes);
  console.log('✅ 商品路由加载完成');

  // 用户路由
  const usersRoutes = require('./routes/users');
  app.use('/api/users', usersRoutes);
  console.log('✅ 用户路由加载完成');

  // 订单路由
  const ordersRoutes = require('./routes/orders');
  app.use('/api/orders', ordersRoutes);
  console.log('✅ 订单路由加载完成');

  // 积分路由
  const pointsRoutes = require('./routes/points');
  app.use('/api/points', pointsRoutes);
  console.log('✅ 积分路由加载完成');

  // 停车路由
  const parkingRoutes = require('./routes/parking');
  app.use('/api/parking', parkingRoutes);
  console.log('✅ 停车路由加载完成');

  // 统计路由
  const statisticsRoutes = require('./routes/statistics');
  app.use('/api/statistics', statisticsRoutes);
  console.log('✅ 统计路由加载完成');

  // 商城路由
  const mallRoutes = require('./routes/mall');
  app.use('/api/mall', mallRoutes);
  console.log('✅ 商城路由加载完成');

} catch (error) {
  console.error('❌ 路由加载失败:', error);
  app.use('/api/*', (req, res) => {
    res.status(500).json({
      success: false,
      message: '路由加载失败',
      error: error.message
    });
  });
}

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
  });
});

// 启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    console.log(`🔗 API文档: http://localhost:${PORT}/`);
  });
}

module.exports = app; 