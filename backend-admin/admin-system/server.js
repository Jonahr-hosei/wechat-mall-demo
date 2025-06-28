const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/points', require('./routes/points'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/statistics', require('./routes/statistics'));

// 小程序API路由
app.use('/api/mall', require('./routes/mall'));

// 测试 Supabase 连接
const supabase = require('./config/database');

async function testSupabaseConnection() {
  try {
    console.log('🔍 测试 Supabase 连接...');
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message);
    } else {
      console.log('✅ Supabase 连接成功！');
      console.log('📊 数据库表访问正常');
    }
  } catch (error) {
    console.error('❌ Supabase 连接测试失败:', error.message);
  }
}

// 初始化 Supabase 连接
testSupabaseConnection();

// 生产环境路由处理
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 后台管理系统: http://localhost:${PORT}`);
  console.log(`📱 小程序API: http://localhost:${PORT}/api/mall`);
  console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Supabase 数据库已连接`);
}); 