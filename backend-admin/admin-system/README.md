# 商场小程序后台管理系统

这是一个完整的商场小程序后台管理系统，提供商品管理、订单管理、用户管理、积分管理、停车管理等功能。

## 功能特性

### 后台管理系统
- 🔐 管理员登录认证
- 📦 商品管理（增删改查、分类管理、库存管理）
- 📋 订单管理（订单状态、支付管理）
- 👥 用户管理（用户信息、会员等级）
- 🎁 积分管理（积分记录、积分规则）
- 🚗 停车管理（停车记录、费用计算）
- 📊 数据统计（销售统计、用户统计）

### 小程序API
- 🛍️ 商品展示和搜索
- 🛒 购物车和订单管理
- 💳 支付集成
- 🎯 积分系统
- 🚗 停车服务
- 👤 用户中心

## 技术栈

### 后端
- Node.js + Express
- SQLite 数据库
- JWT 认证
- Multer 文件上传

### 前端
- React + Ant Design
- React Router
- Axios
- Recharts 图表

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

### 2. 启动服务

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或者分别启动
npm start  # 启动后端
cd client && npm start  # 启动前端
```

### 3. 访问系统

- 后台管理系统: http://localhost:5000
- 小程序API: http://localhost:5000/api/mall

### 4. 默认账号

- 用户名: admin
- 密码: admin123

## 项目结构

```
admin-system/
├── client/                 # React前端
│   ├── public/
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   ├── contexts/      # 上下文
│   │   └── App.js
│   └── package.json
├── database/              # 数据库
│   ├── init.js           # 数据库初始化
│   └── mall.db           # SQLite数据库文件
├── routes/               # API路由
│   ├── auth.js          # 认证相关
│   ├── products.js      # 商品管理
│   ├── orders.js        # 订单管理
│   ├── users.js         # 用户管理
│   ├── points.js        # 积分管理
│   ├── parking.js       # 停车管理
│   ├── statistics.js    # 数据统计
│   └── mall.js          # 小程序API
├── uploads/             # 文件上传目录
├── server.js           # 服务器入口
└── package.json
```

## API文档

### 后台管理API

#### 认证
- `POST /api/auth/login` - 管理员登录
- `GET /api/auth/me` - 获取当前管理员信息
- `PUT /api/auth/change-password` - 修改密码

#### 商品管理
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

#### 订单管理
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id/status` - 更新订单状态

### 小程序API

#### 商品
- `GET /api/mall/categories` - 获取商品分类
- `GET /api/mall/products` - 获取商品列表
- `GET /api/mall/products/:id` - 获取商品详情

#### 订单
- `POST /api/mall/orders` - 创建订单
- `POST /api/mall/orders/:id/pay` - 支付订单
- `GET /api/mall/users/:user_id/orders` - 获取用户订单

## 小程序对接

小程序通过 `utils/request.js` 中的API方法与后台系统进行数据交互：

```javascript
const { api } = require('../../utils/request.js');

// 获取商品列表
api.getProducts({ page: 1, limit: 10 })
  .then(res => {
    console.log(res.data);
  });

// 创建订单
api.createOrder({
  user_id: 1,
  items: [...],
  total_amount: 299.00,
  payment_method: 'wechat'
});
```

## 部署说明

### 开发环境
1. 确保Node.js版本 >= 14
2. 安装依赖并启动服务
3. 配置小程序开发工具中的服务器域名

### 生产环境
1. 设置环境变量 `NODE_ENV=production`
2. 构建前端: `npm run build`
3. 使用PM2或Docker部署
4. 配置HTTPS和域名

## 注意事项

1. 首次运行会自动创建数据库和默认数据
2. 文件上传功能需要确保 `uploads` 目录存在
3. 小程序需要在微信开发者工具中配置服务器域名
4. 生产环境建议使用MySQL或PostgreSQL替代SQLite

## 许可证

MIT License 