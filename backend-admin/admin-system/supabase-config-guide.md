# 🔧 Supabase 配置指南

## 📋 当前状态

✅ 已完成：
- 安装 Supabase 依赖
- 创建环境变量文件
- 创建迁移脚本
- 创建测试脚本

❌ 待完成：
- 配置 Supabase 项目信息

## 🎯 下一步操作

### 1. 获取 Supabase 项目信息

1. 登录您的 Supabase 项目：https://supabase.com
2. 进入项目仪表板
3. 点击左侧菜单的 **Settings**
4. 点击 **API**
5. 复制以下信息：
   - **Project URL** (例如: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (以 `eyJ` 开头的长字符串)

### 2. 更新环境变量

编辑 `.env` 文件，将以下两行替换为您的实际值：

```env
# 将这行
SUPABASE_URL=your_supabase_project_url
# 替换为
SUPABASE_URL=https://your-actual-project-id.supabase.co

# 将这行  
SUPABASE_ANON_KEY=your_supabase_anon_key
# 替换为
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 验证配置

配置完成后，运行测试脚本：

```bash
node scripts/test-supabase-connection.js
```

如果看到 "✅ Supabase 连接成功！" 就说明配置正确。

### 4. 创建数据库表

如果连接测试成功，但表不存在，请在 Supabase SQL Editor 中执行以下 SQL：

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

### 5. 运行数据迁移

配置完成后，运行迁移脚本：

```bash
npm run migrate
```

## 🆘 常见问题

### Q: 如何找到 Supabase 项目信息？
A: 登录 https://supabase.com → 选择项目 → Settings → API

### Q: 连接失败怎么办？
A: 检查 URL 和 API Key 是否正确，确保网络连接正常

### Q: 表不存在怎么办？
A: 在 Supabase SQL Editor 中执行上面的 SQL 语句创建表

## 📞 需要帮助？

如果您在配置过程中遇到问题，请：
1. 检查 Supabase 项目是否已创建
2. 确认 URL 和 API Key 是否正确
3. 查看错误信息并参考常见问题 