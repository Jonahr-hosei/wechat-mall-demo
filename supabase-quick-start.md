# 🚀 Supabase 快速开始指南

## 📋 步骤概览

1. 创建 Supabase 项目
2. 配置数据库表
3. 安装依赖
4. 配置环境变量
5. 迁移数据
6. 测试连接

## 🎯 详细步骤

### 步骤 1: 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 或 Google 账号登录
4. 点击 "New Project"
5. 选择组织（或创建新组织）
6. 填写项目信息：
   - **Name**: `mall-admin-system`
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离您最近的区域
7. 点击 "Create new project"
8. 等待项目创建完成（约 1-2 分钟）

### 步骤 2: 获取项目配置信息

1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 步骤 3: 创建数据库表

1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴以下 SQL 代码：

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

4. 点击 "Run" 执行 SQL

### 步骤 4: 安装项目依赖

在项目根目录执行：

```bash
cd backend-admin/admin-system
npm install @supabase/supabase-js
```

### 步骤 5: 配置环境变量

1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，填入您的 Supabase 配置：
```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here

# 服务器配置
PORT=5000
NODE_ENV=development
```

### 步骤 6: 迁移现有数据

如果您有现有的 SQLite 数据，运行迁移脚本：

```bash
npm run migrate
```

### 步骤 7: 测试连接

启动服务器：

```bash
npm start
```

访问 `http://localhost:5000` 测试连接。

## 🔧 验证配置

### 检查数据库连接

在 Supabase 仪表板的 "Table Editor" 中，您应该能看到所有创建的表。

### 测试 API

使用 Postman 或 curl 测试登录 API：

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## 🚨 常见问题

### Q: 连接失败怎么办？
A: 检查环境变量是否正确配置，确保 Supabase URL 和 API Key 正确。

### Q: 表创建失败？
A: 确保 SQL 语法正确，检查是否有重复的表名。

### Q: 迁移脚本报错？
A: 确保 SQLite 数据库文件存在，检查文件路径是否正确。

## 📞 获取帮助

- Supabase 文档: https://supabase.com/docs
- Supabase 社区: https://github.com/supabase/supabase/discussions
- 项目 Issues: [您的项目地址]

---

**恭喜！** 您已成功将数据库迁移到 Supabase 云端！🎉 