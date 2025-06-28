# 图片资源目录

这个目录用于存放小程序所需的图片资源。

## 当前状态

由于图标文件缺失，我已经在 `app.json` 中移除了图标引用，只保留文字导航。这样可以避免图标文件缺失导致的错误。

## 需要的图片文件

### 底部导航图标 (已移除引用)
- `home.png` / `home-active.png` - 首页图标
- `mall.png` / `mall-active.png` - 商城图标  
- `parking.png` / `parking-active.png` - 停车图标
- `points.png` / `points-active.png` - 积分图标
- `user.png` / `user-active.png` - 用户图标

### 功能图标
- `mall-icon.png` - 商城功能图标
- `parking-icon.png` - 停车功能图标
- `points-icon.png` - 积分功能图标
- `user-icon.png` - 用户功能图标
- `cart-icon.png` - 购物车图标
- `order-icon.png` - 订单图标
- `coupon-icon.png` - 优惠券图标
- `favorite-icon.png` - 收藏图标
- `address-icon.png` - 地址图标
- `service-icon.png` - 客服图标
- `settings-icon.png` - 设置图标

### 其他图片
- `banner1.jpg` / `banner2.jpg` / `banner3.jpg` - 轮播图
- `product1.jpg` / `product2.jpg` / `product3.jpg` / `product4.jpg` - 商品图片
- `empty-cart.png` - 空购物车图片
- `no-parking.png` - 无停车记录图片

## 解决方案

### 方案一：使用文字导航（当前采用）
- 优点：简单快速，无需额外资源
- 缺点：视觉效果相对简单
- 状态：✅ 已实施

### 方案二：生成图标文件
1. 打开 `images/icon-generator.html` 文件
2. 在浏览器中右键点击图标
3. 选择"图片另存为"下载图标
4. 将图标文件放入 `images/` 目录
5. 在 `app.json` 中重新添加图标引用

### 方案三：使用在线图标服务
- 使用 iconfont、FontAwesome 等图标库
- 下载 SVG 或 PNG 格式的图标
- 确保图标尺寸为 81x81px

### 方案四：使用占位图片服务
```javascript
// 在 app.json 中使用在线占位图片
"iconPath": "https://via.placeholder.com/81x81/7A7E83/ffffff?text=🏠",
"selectedIconPath": "https://via.placeholder.com/81x81/3cc51f/ffffff?text=🏠"
```

## 图片规格建议

- 底部导航图标：81x81px
- 功能图标：40x40px
- 轮播图：750x400px
- 商品图片：300x300px
- 其他图标：根据实际需要调整

## 当前状态说明

✅ 已完成：
- 移除了图标引用，避免错误
- 使用 emoji 和渐变背景替代图片
- 创建了图标生成器工具

🔄 待完成：
- 如需图标，请按照方案二生成图标文件
- 替换页面中的占位符为真实图片
- 优化视觉效果 