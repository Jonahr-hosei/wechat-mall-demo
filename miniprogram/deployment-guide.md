# 商场小程序部署指南

## 1. 小程序端部署

### 1.1 环境准备
- 微信开发者工具
- 微信小程序账号
- 微信支付商户号（可选）

### 1.2 配置步骤

#### 1.2.1 创建小程序
1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 选择"小程序"类型
3. 填写小程序基本信息
4. 获取AppID和AppSecret

#### 1.2.2 配置项目
1. 在 `project.config.json` 中修改AppID：
```json
{
  "appid": "your_appid_here"
}
```

2. 在 `app.js` 中配置后端API地址：
```javascript
globalData: {
  baseUrl: 'https://your-api-domain.com/api'
}
```

#### 1.2.3 上传代码
1. 使用微信开发者工具打开项目
2. 点击"上传"按钮
3. 填写版本号和项目备注
4. 提交审核

#### 1.2.4 发布上线
1. 审核通过后，在微信公众平台发布
2. 设置小程序可见范围
3. 配置服务器域名

### 1.3 域名配置
在微信公众平台配置以下域名：
- request合法域名：`https://your-api-domain.com`
- uploadFile合法域名：`https://your-api-domain.com`
- downloadFile合法域名：`https://your-api-domain.com`

## 2. 后端服务部署

### 2.1 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- Nginx

### 2.2 服务器配置

#### 2.2.1 安装Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
```

#### 2.2.2 安装MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# CentOS/RHEL
sudo yum install mysql-server
```

#### 2.2.3 安装Redis
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# CentOS/RHEL
sudo yum install redis
```

### 2.3 项目部署

#### 2.3.1 克隆项目
```bash
git clone https://github.com/your-repo/mall-miniprogram-backend.git
cd mall-miniprogram-backend
```

#### 2.3.2 安装依赖
```bash
npm install
```

#### 2.3.3 配置环境变量
创建 `.env` 文件：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mall_miniprogram

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# 微信支付配置
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key
WECHAT_NOTIFY_URL=https://your-api-domain.com/api/payment/notify

# JWT密钥
JWT_SECRET=your_jwt_secret

# 服务器配置
PORT=3000
NODE_ENV=production
```

#### 2.3.4 初始化数据库
```bash
npm run migrate
npm run seed
```

#### 2.3.5 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm run start
```

### 2.4 使用PM2管理进程
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 重启应用
pm2 restart mall-api

# 查看日志
pm2 logs mall-api
```

### 2.5 Nginx配置
创建Nginx配置文件 `/etc/nginx/sites-available/mall-api`：
```nginx
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/mall-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.6 SSL证书配置
使用Let's Encrypt免费SSL证书：
```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-api-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 3. 数据库部署

### 3.1 MySQL配置
```sql
-- 创建数据库
CREATE DATABASE mall_miniprogram CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'mall_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mall_miniprogram.* TO 'mall_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 数据库表结构
主要表结构包括：
- users（用户表）
- products（商品表）
- orders（订单表）
- order_items（订单商品表）
- parking_records（停车记录表）
- points_records（积分记录表）
- admin_users（管理员表）

## 4. 微信支付配置

### 4.1 申请微信支付
1. 登录微信商户平台：https://pay.weixin.qq.com/
2. 提交商户资料
3. 等待审核通过
4. 获取商户号和API密钥

### 4.2 配置支付参数
在环境变量中配置：
```env
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key
WECHAT_NOTIFY_URL=https://your-api-domain.com/api/payment/notify
```

### 4.3 上传证书
将微信支付证书上传到服务器安全目录。

## 5. 监控和日志

### 5.1 日志配置
使用Winston配置日志：
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 5.2 监控配置
使用PM2监控：
```bash
# 安装PM2监控
pm2 install pm2-server-monit

# 查看监控面板
pm2 monit
```

## 6. 安全配置

### 6.1 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 6.2 数据库安全
```sql
-- 删除匿名用户
DELETE FROM mysql.user WHERE User='';

-- 删除测试数据库
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 6.3 API安全
- 使用HTTPS
- 实现请求频率限制
- 验证用户权限
- 防止SQL注入
- 防止XSS攻击

## 7. 备份策略

### 7.1 数据库备份
```bash
#!/bin/bash
# 创建备份脚本
mysqldump -u root -p mall_miniprogram > /backup/mall_$(date +%Y%m%d_%H%M%S).sql
```

### 7.2 文件备份
```bash
# 备份上传文件
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /var/www/uploads/
```

### 7.3 自动备份
```bash
# 添加到crontab
0 2 * * * /path/to/backup_script.sh
```

## 8. 性能优化

### 8.1 数据库优化
- 添加索引
- 优化查询语句
- 配置连接池
- 定期清理日志

### 8.2 缓存配置
使用Redis缓存：
- 用户会话
- 商品信息
- 热门数据
- API响应

### 8.3 CDN配置
- 静态资源CDN
- 图片CDN
- API CDN

## 9. 故障排查

### 9.1 常见问题
1. 小程序无法连接服务器
   - 检查域名配置
   - 检查SSL证书
   - 检查防火墙设置

2. 支付失败
   - 检查商户号配置
   - 检查API密钥
   - 检查回调地址

3. 数据库连接失败
   - 检查数据库服务状态
   - 检查连接参数
   - 检查网络连接

### 9.2 日志查看
```bash
# 查看应用日志
pm2 logs mall-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MySQL日志
sudo tail -f /var/log/mysql/error.log
```

## 10. 更新维护

### 10.1 代码更新
```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 重启服务
pm2 restart mall-api
```

### 10.2 数据库迁移
```bash
# 运行数据库迁移
npm run migrate

# 回滚迁移
npm run migrate:rollback
```

### 10.3 监控告警
配置监控告警：
- 服务器资源监控
- 应用性能监控
- 错误日志监控
- 业务指标监控

## 11. 扩展部署

### 11.1 负载均衡
使用Nginx负载均衡：
```nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

### 11.2 集群部署
使用Docker容器化部署：
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 11.3 微服务架构
将不同功能拆分为独立服务：
- 用户服务
- 商品服务
- 订单服务
- 支付服务
- 停车服务
- 积分服务

## 12. 测试部署

### 12.1 功能测试
- 用户注册登录
- 商品浏览购买
- 订单管理
- 支付流程
- 停车管理
- 积分系统

### 12.2 性能测试
- 并发用户测试
- 响应时间测试
- 数据库性能测试
- 内存使用测试

### 12.3 安全测试
- 接口安全测试
- 数据加密测试
- 权限验证测试
- 支付安全测试

## 13. 上线检查清单

- [ ] 小程序审核通过
- [ ] 服务器配置完成
- [ ] 数据库初始化完成
- [ ] 域名解析正确
- [ ] SSL证书配置
- [ ] 微信支付配置
- [ ] 监控告警配置
- [ ] 备份策略配置
- [ ] 安全配置完成
- [ ] 性能测试通过
- [ ] 功能测试通过
- [ ] 文档完善

## 14. 联系方式

如有部署问题，请联系技术支持团队。 