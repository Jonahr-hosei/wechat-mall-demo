# 商场微信小程序

这是一个功能完整的商场微信小程序，包含商城购物、停车管理和积分系统三大核心功能。

## 功能特性

### 1. 商城系统
- 商品展示和搜索
- 商品分类浏览
- 购物车功能
- 在线支付
- 订单管理
- 商品评价

### 2. 停车管理系统
- 实时停车状态查询
- 车牌绑定管理
- 停车费用计算
- 在线缴费
- 停车记录查询

### 3. 积分系统
- 积分获取和消费
- 每日任务系统
- 积分兑换商品
- 积分明细查询
- 积分规则说明

## 技术架构

### 前端
- 微信小程序原生开发
- WXML + WXSS + JavaScript
- 响应式设计
- 模块化组件

### 后端API接口
- RESTful API设计
- 用户认证和授权
- 支付集成
- 数据持久化

## 项目结构

```
demo/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── project.config.json   # 项目配置文件
├── sitemap.json          # 站点地图配置
├── pages/                # 页面目录
│   ├── index/           # 首页
│   ├── mall/            # 商城页面
│   ├── parking/         # 停车管理
│   ├── points/          # 积分系统
│   ├── cart/            # 购物车
│   ├── order/           # 订单页面
│   ├── user/            # 用户中心
│   └── admin/           # 后台管理
├── components/          # 自定义组件
├── utils/               # 工具函数
├── images/              # 图片资源
└── README.md            # 项目说明
```

## 安装和运行

### 1. 环境要求
- 微信开发者工具
- Node.js (后端开发)
- 微信小程序账号

### 2. 安装步骤
1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置小程序AppID
4. 配置后端API地址
5. 编译运行

### 3. 配置说明

#### 小程序配置
在 `app.js` 中修改以下配置：
```javascript
globalData: {
  baseUrl: 'https://your-api-domain.com/api', // 后端API地址
  mallId: 'mall_001', // 商场ID
  parkingLotId: 'parking_001', // 停车场ID
  paymentConfig: {
    appId: 'your_appid_here', // 微信支付AppID
    mchId: 'your_mch_id', // 商户号
    apiKey: 'your_api_key' // API密钥
  }
}
```

#### 项目配置
在 `project.config.json` 中修改：
```json
{
  "appid": "your_appid_here",
  "projectname": "商场小程序"
}
```

## API接口文档

### 用户相关
- `POST /api/auth/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息

### 商品相关
- `GET /api/products` - 获取商品列表
- `GET /api/products/{id}` - 获取商品详情
- `GET /api/products/hot` - 获取热门商品

### 订单相关
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `PUT /api/orders/{id}/status` - 更新订单状态

### 停车相关
- `GET /api/parking/status` - 获取停车状态
- `POST /api/parking/plates` - 添加车牌
- `GET /api/parking/history` - 获取停车记录
- `POST /api/payment/create` - 创建支付订单

### 积分相关
- `GET /api/points/balance` - 获取积分余额
- `GET /api/points/tasks` - 获取任务列表
- `POST /api/points/complete-task` - 完成任务
- `GET /api/points/exchange-items` - 获取兑换商品
- `POST /api/points/exchange` - 兑换商品

## 支付集成

### 微信支付
1. 申请微信支付商户号
2. 配置支付参数
3. 实现支付回调处理
4. 测试支付流程

### 支付流程
1. 用户选择商品/服务
2. 创建支付订单
3. 调用微信支付
4. 处理支付结果
5. 更新订单状态

## 部署说明

### 小程序发布
1. 代码审查
2. 提交审核
3. 发布上线

### 后端部署
1. 服务器环境配置
2. 数据库部署
3. API服务部署
4. 域名和SSL配置

## 开发规范

### 代码规范
- 使用ES6语法
- 遵循微信小程序开发规范
- 代码注释完整
- 错误处理完善

### 命名规范
- 文件名使用小写字母和下划线
- 变量和函数使用驼峰命名
- 常量使用大写字母和下划线

### 目录规范
- 页面文件放在pages目录
- 公共组件放在components目录
- 工具函数放在utils目录
- 图片资源放在images目录

## 常见问题

### 1. 支付失败
- 检查支付配置是否正确
- 确认商户号状态
- 查看支付日志

### 2. 接口调用失败
- 检查网络连接
- 确认API地址正确
- 查看错误日志

### 3. 小程序无法运行
- 检查AppID配置
- 确认开发者权限
- 查看控制台错误

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实现基础商城功能
- 实现停车管理功能
- 实现积分系统功能

## 联系方式

如有问题或建议，请联系开发团队。

## 许可证

本项目采用 MIT 许可证。 