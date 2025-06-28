# 数据库迁移指南 - SQLite 到 Supabase

## 📋 迁移概览

将您的微信商城项目从本地 SQLite 数据库迁移到云端 Supabase PostgreSQL 数据库。

## 🎯 为什么选择 Supabase？

1. **免费额度充足**: 500MB 数据库 + 2GB 带宽/月
2. **PostgreSQL 强大**: 比 SQLite 功能更强大
3. **内置功能**: 身份认证、实时订阅、存储等
4. **易于迁移**: 支持从 SQLite 导入数据
5. **开发友好**: 完整的 REST API 和客户端库

## 📦 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

## 🔧 迁移步骤

### 步骤 1: 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册账号并创建新项目
3. 记录项目 URL 和 API Key

### 步骤 2: 创建数据库表结构

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 创建管理员表
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  openid TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  points INTEGER DEFAULT 0,
  member_level TEXT DEFAULT '普通会员',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品分类表
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT,
  category_id INTEGER REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单详情表
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- 创建积分记录表
CREATE TABLE point_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建停车记录表
CREATE TABLE parking_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plate_number TEXT NOT NULL,
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  duration_minutes INTEGER,
  fee DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'parking',
  payment_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建优惠券表
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  total_count INTEGER DEFAULT -1,
  used_count INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户优惠券表
CREATE TABLE user_coupons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  status TEXT DEFAULT 'unused',
  used_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_point_records_user ON point_records(user_id);
CREATE INDEX idx_parking_records_user ON parking_records(user_id);
CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
```

### 步骤 3: 创建数据库配置文件

创建 `config/database.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### 步骤 4: 创建数据迁移脚本

创建 `scripts/migrate-to-supabase.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateData() {
  console.log('开始迁移数据到 Supabase...');

  try {
    // 迁移管理员数据
    await migrateAdmins();
    
    // 迁移用户数据
    await migrateUsers();
    
    // 迁移分类数据
    await migrateCategories();
    
    // 迁移商品数据
    await migrateProducts();
    
    // 迁移订单数据
    await migrateOrders();
    
    // 迁移积分记录
    await migratePointRecords();
    
    // 迁移停车记录
    await migrateParkingRecords();
    
    // 迁移优惠券数据
    await migrateCoupons();
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
  } finally {
    db.close();
  }
}

async function migrateAdmins() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM admins', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('admins')
            .insert({
              username: row.username,
              password: row.password,
              name: row.name,
              role: row.role,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入管理员数据失败:', error);
          }
        } catch (error) {
          console.error('处理管理员数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条管理员数据`);
      resolve();
    });
  });
}

async function migrateUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('users')
            .insert({
              openid: row.openid,
              nickname: row.nickname,
              avatar_url: row.avatar_url,
              phone: row.phone,
              points: row.points,
              member_level: row.member_level,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入用户数据失败:', error);
          }
        } catch (error) {
          console.error('处理用户数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条用户数据`);
      resolve();
    });
  });
}

async function migrateCategories() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('categories')
            .insert({
              name: row.name,
              description: row.description,
              sort_order: row.sort_order,
              status: row.status,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入分类数据失败:', error);
          }
        } catch (error) {
          console.error('处理分类数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条分类数据`);
      resolve();
    });
  });
}

async function migrateProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('products')
            .insert({
              name: row.name,
              description: row.description,
              price: row.price,
              original_price: row.original_price,
              image: row.image,
              category_id: row.category_id,
              stock: row.stock,
              sales: row.sales,
              points: row.points,
              status: row.status,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入商品数据失败:', error);
          }
        } catch (error) {
          console.error('处理商品数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条商品数据`);
      resolve();
    });
  });
}

async function migrateOrders() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('orders')
            .insert({
              order_no: row.order_no,
              user_id: row.user_id,
              total_amount: row.total_amount,
              status: row.status,
              payment_method: row.payment_method,
              payment_time: row.payment_time,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入订单数据失败:', error);
          }
        } catch (error) {
          console.error('处理订单数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条订单数据`);
      resolve();
    });
  });
}

async function migratePointRecords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM point_records', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('point_records')
            .insert({
              user_id: row.user_id,
              type: row.type,
              points: row.points,
              description: row.description,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入积分记录失败:', error);
          }
        } catch (error) {
          console.error('处理积分记录失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条积分记录`);
      resolve();
    });
  });
}

async function migrateParkingRecords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM parking_records', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('parking_records')
            .insert({
              user_id: row.user_id,
              plate_number: row.plate_number,
              entry_time: row.entry_time,
              exit_time: row.exit_time,
              duration_minutes: row.duration_minutes,
              fee: row.fee,
              status: row.status,
              payment_time: row.payment_time,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入停车记录失败:', error);
          }
        } catch (error) {
          console.error('处理停车记录失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条停车记录`);
      resolve();
    });
  });
}

async function migrateCoupons() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM coupons', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('coupons')
            .insert({
              name: row.name,
              type: row.type,
              value: row.value,
              min_amount: row.min_amount,
              start_date: row.start_date,
              end_date: row.end_date,
              total_count: row.total_count,
              used_count: row.used_count,
              status: row.status,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入优惠券数据失败:', error);
          }
        } catch (error) {
          console.error('处理优惠券数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条优惠券数据`);
      resolve();
    });
  });
}

// 运行迁移
migrateData();
```

### 步骤 5: 更新环境变量

创建 `.env` 文件：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 其他配置
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 步骤 6: 更新路由文件

以 `routes/auth.js` 为例，更新为使用 Supabase：

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 管理员登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名和密码不能为空'
    });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
```

## 🚀 部署步骤

### 1. 安装依赖
```bash
npm install @supabase/supabase-js
```

### 2. 配置环境变量
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
# 填入您的 Supabase 项目 URL 和 API Key
```

### 3. 运行迁移脚本
```bash
node scripts/migrate-to-supabase.js
```

### 4. 测试连接
```bash
npm start
```

## 🔒 安全配置

### 1. 设置 Row Level Security (RLS)
在 Supabase 中为每个表启用 RLS 并设置适当的策略。

### 2. 配置 CORS
在 Supabase 项目设置中配置允许的域名。

### 3. API Key 管理
- 使用 `anon` key 用于客户端
- 使用 `service_role` key 用于服务器端（仅在必要时）

## 📊 监控和维护

### 1. 数据库监控
- 使用 Supabase Dashboard 监控数据库性能
- 设置查询性能警报

### 2. 备份策略
- Supabase 自动备份
- 定期导出数据作为额外备份

### 3. 性能优化
- 创建适当的索引
- 优化查询语句
- 使用连接池

## 🆘 常见问题

### Q: 迁移过程中数据丢失怎么办？
A: 迁移前备份 SQLite 数据库文件，迁移后验证数据完整性。

### Q: 如何处理大文件上传？
A: 使用 Supabase Storage 功能存储文件，数据库中只存储文件路径。

### Q: 如何优化查询性能？
A: 创建适当的索引，使用分页查询，避免 N+1 查询问题。

## 📞 技术支持

- Supabase 文档: https://supabase.com/docs
- Supabase 社区: https://github.com/supabase/supabase/discussions
- 项目 GitHub Issues: [您的项目地址]

---

**注意**: 迁移前请务必备份现有数据，并在测试环境中先进行迁移测试。 