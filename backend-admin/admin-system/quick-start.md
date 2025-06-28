# 快速启动指南

## 🚀 一键启动

1. **双击运行启动脚本**
   ```
   admin-system/start.bat
   ```

2. **等待自动安装和启动**
   - 自动安装后端依赖
   - 自动安装前端依赖
   - 自动创建数据库
   - 自动启动开发服务器

3. **访问系统**
   - 后台管理系统: http://localhost:5000
   - 默认账号: admin
   - 默认密码: admin123

## 📋 手动启动步骤

如果自动启动失败，请按以下步骤手动启动：

### 1. 安装后端依赖
```bash
cd admin-system
npm install
```

### 2. 安装前端依赖
```bash
cd client
npm install
cd ..
```

### 3. 创建uploads目录
```bash
mkdir uploads
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 🔧 功能说明

### 后台管理系统功能
- ✅ 管理员登录认证
- ✅ 商品管理（增删改查、分类、库存）
- ✅ 订单管理（订单状态、支付管理）
- ✅ 用户管理（用户信息、会员等级）
- ✅ 积分管理（积分记录、手动调整）
- ✅ 停车管理（停车记录、费用计算）
- ✅ 数据统计（销售、用户、积分、停车）

### 小程序API对接
- ✅ 商品展示和搜索
- ✅ 购物车和订单管理
- ✅ 支付集成
- ✅ 积分系统
- ✅ 停车服务
- ✅ 用户中心

## 📱 小程序对接

小程序已通过 `utils/request.js` 对接后台API：

```javascript
const { api } = require('../../utils/request.js');

// 获取商品列表
api.getProducts({ page: 1, limit: 10 })
  .then(res => {
    console.log(res.data);
  });
```

## 🛠️ 技术栈

- **后端**: Node.js + Express + SQLite
- **前端**: React + Ant Design
- **认证**: JWT
- **文件上传**: Multer
- **数据库**: SQLite（开发）/ MySQL（生产）

## 📁 项目结构

```
admin-system/
├── client/                 # React前端
│   ├── src/
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
├── start.bat          # 启动脚本
└── package.json
```

## 🔍 常见问题

### Q: 启动失败怎么办？
A: 检查Node.js版本（建议14+），确保端口5000未被占用

### Q: 数据库连接失败？
A: 确保有写入权限，首次运行会自动创建数据库

### Q: 前端页面空白？
A: 检查控制台错误，确保所有依赖已安装

### Q: 小程序无法连接？
A: 检查网络请求地址，确保后台服务正常运行

## 📞 技术支持

如有问题，请检查：
1. Node.js版本 >= 14
2. 端口5000未被占用
3. 网络连接正常
4. 控制台错误信息 