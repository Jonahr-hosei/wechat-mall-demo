# 后端API接口文档

## 基础信息

- 基础URL: `https://your-api-domain.com/api`
- 请求格式: JSON
- 响应格式: JSON
- 认证方式: Bearer Token

## 通用响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "code": 200
}
```

## 用户认证

### 1. 用户登录
- **接口**: `POST /auth/login`
- **描述**: 微信小程序用户登录
- **请求参数**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "token": "用户token",
    "openId": "用户openId",
    "userInfo": {
      "id": 1,
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "phone": "手机号"
    }
  }
}
```

## 商品管理

### 1. 获取商品列表
- **接口**: `GET /products`
- **描述**: 获取商品列表，支持分页和筛选
- **请求参数**:
```
mallId: 商场ID
category: 商品分类
keyword: 搜索关键词
page: 页码
pageSize: 每页数量
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "商品名称",
        "description": "商品描述",
        "price": 99.00,
        "originalPrice": 129.00,
        "image": "商品图片",
        "category": "商品分类",
        "sales": 100,
        "points": 10,
        "status": "on_sale"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 获取商品详情
- **接口**: `GET /products/{id}`
- **描述**: 获取单个商品详细信息
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "商品名称",
    "description": "商品描述",
    "price": 99.00,
    "originalPrice": 129.00,
    "images": ["图片1", "图片2"],
    "category": "商品分类",
    "sales": 100,
    "points": 10,
    "stock": 50,
    "specifications": [
      {
        "name": "颜色",
        "values": ["红色", "蓝色"]
      }
    ],
    "reviews": [
      {
        "id": 1,
        "userName": "用户昵称",
        "rating": 5,
        "content": "评价内容",
        "createTime": "2024-01-15 14:30:00"
      }
    ]
  }
}
```

### 3. 获取热门商品
- **接口**: `GET /products/hot`
- **描述**: 获取热门商品列表
- **请求参数**:
```
mallId: 商场ID
limit: 返回数量
```

## 订单管理

### 1. 创建订单
- **接口**: `POST /orders`
- **描述**: 创建新订单
- **请求参数**:
```json
{
  "openId": "用户openId",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "specifications": {
        "颜色": "红色",
        "尺寸": "L"
      }
    }
  ],
  "address": {
    "name": "收货人",
    "phone": "手机号",
    "address": "详细地址"
  },
  "remark": "订单备注"
}
```

### 2. 获取订单列表
- **接口**: `GET /orders`
- **描述**: 获取用户订单列表
- **请求参数**:
```
openId: 用户openId
status: 订单状态
page: 页码
pageSize: 每页数量
```

### 3. 更新订单状态
- **接口**: `PUT /orders/{id}/status`
- **描述**: 更新订单状态
- **请求参数**:
```json
{
  "status": "paid",
  "remark": "状态备注"
}
```

## 停车管理

### 1. 获取停车状态
- **接口**: `GET /parking/status`
- **描述**: 获取用户当前停车状态
- **请求参数**:
```
openId: 用户openId
parkingLotId: 停车场ID
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "plateNumber": "京A12345",
    "entryTime": "2024-01-15 10:30:00",
    "duration": "2小时30分钟",
    "fee": 15.00,
    "isParking": true
  }
}
```

### 2. 添加车牌
- **接口**: `POST /parking/plates`
- **描述**: 添加用户车牌信息
- **请求参数**:
```json
{
  "openId": "用户openId",
  "plateNumber": "京A12345",
  "type": "小型车"
}
```

### 3. 获取停车记录
- **接口**: `GET /parking/history`
- **描述**: 获取用户停车记录
- **请求参数**:
```
openId: 用户openId
limit: 返回数量
```

## 积分系统

### 1. 获取积分余额
- **接口**: `GET /points/balance`
- **描述**: 获取用户积分余额
- **请求参数**:
```
openId: 用户openId
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "points": 1250,
    "totalEarned": 2000,
    "totalSpent": 750
  }
}
```

### 2. 获取任务列表
- **接口**: `GET /points/tasks`
- **描述**: 获取用户可完成的任务
- **请求参数**:
```
openId: 用户openId
```
- **响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "每日签到",
      "description": "连续签到可获得更多积分",
      "points": 10,
      "completed": false,
      "type": "daily"
    }
  ]
}
```

### 3. 完成任务
- **接口**: `POST /points/complete-task`
- **描述**: 完成指定任务获得积分
- **请求参数**:
```json
{
  "openId": "用户openId",
  "taskId": 1
}
```

### 4. 获取兑换商品
- **接口**: `GET /points/exchange-items`
- **描述**: 获取可兑换的商品列表
- **请求参数**:
```
limit: 返回数量
```

### 5. 兑换商品
- **接口**: `POST /points/exchange`
- **描述**: 使用积分兑换商品
- **请求参数**:
```json
{
  "openId": "用户openId",
  "itemId": 1
}
```

## 支付系统

### 1. 创建支付订单
- **接口**: `POST /payment/create`
- **描述**: 创建微信支付订单
- **请求参数**:
```json
{
  "openId": "用户openId",
  "orderId": "订单ID",
  "amount": 99.00,
  "type": "order"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "timeStamp": "时间戳",
    "nonceStr": "随机字符串",
    "package": "预支付交易会话标识",
    "signType": "签名类型",
    "paySign": "签名"
  }
}
```

### 2. 支付回调
- **接口**: `POST /payment/notify`
- **描述**: 微信支付结果回调
- **请求参数**: 微信支付回调参数

## 后台管理

### 1. 管理员登录
- **接口**: `POST /admin/login`
- **描述**: 管理员登录
- **请求参数**:
```json
{
  "username": "管理员用户名",
  "password": "密码"
}
```

### 2. 获取统计数据
- **接口**: `GET /admin/stats`
- **描述**: 获取后台统计数据
- **响应**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalOrders": 3680,
    "totalRevenue": 125680.50,
    "todayOrders": 45,
    "todayRevenue": 2340.00
  }
}
```

### 3. 获取最近订单
- **接口**: `GET /admin/orders/recent`
- **描述**: 获取最近的订单列表
- **请求参数**:
```
limit: 返回数量
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证说明

除了登录接口外，其他接口都需要在请求头中携带token：

```
Authorization: Bearer {token}
```

## 注意事项

1. 所有金额字段单位为元，保留两位小数
2. 时间字段格式为：YYYY-MM-DD HH:mm:ss
3. 分页参数page从1开始
4. 文件上传使用multipart/form-data格式
5. 支付相关接口需要配置微信支付商户信息 