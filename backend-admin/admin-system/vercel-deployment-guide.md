# 🚀 Vercel 部署指南

## 📋 部署概览

将您的微信商城后端服务部署到 Vercel 云平台，实现 24/7 在线访问。

## 🎯 为什么选择 Vercel？

1. **完全免费**: 无限制的免费计划
2. **部署快速**: 全球 CDN，访问速度快
3. **自动 HTTPS**: 免费 SSL 证书
4. **GitHub 集成**: 自动部署
5. **Serverless**: 按需扩展，成本低

## 📦 部署步骤

### 步骤 1: 准备代码

确保您的代码已经推送到 GitHub 仓库。

### 步骤 2: 注册 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"

### 步骤 3: 导入项目

1. 选择 "Import Git Repository"
2. 选择您的项目仓库
3. 配置项目设置：
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend-admin/admin-system`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

### 步骤 4: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | `https://bqhdklwlioshshtprujh.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaGRrbHdsaW9zaHNodHBydWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODI4NDUsImV4cCI6MjA2NjY1ODg0NX0.yGA9uxz9lJu4srG2cN7uoZ9eoPjylkq43yGnDMjLDYc` |
| `JWT_SECRET` | `mall_admin_system_jwt_secret_2024` |
| `NODE_ENV` | `production` |

### 步骤 5: 部署

1. 点击 "Deploy"
2. 等待部署完成（约 1-2 分钟）

### 步骤 6: 获取域名

部署完成后，Vercel 会提供域名，例如：
`https://your-project-name.vercel.app`

## 🔧 配置说明

### 自动部署

每次推送到 GitHub 主分支时，Vercel 会自动重新部署。

### 环境变量

在 Vercel 项目设置的 "Environment Variables" 标签页添加环境变量。

### 域名配置

Vercel 提供免费的子域名，也可以配置自定义域名。

## 📱 更新小程序配置

部署完成后，需要更新小程序的 API 地址：

1. 打开小程序项目
2. 更新 `utils/request.js` 中的 baseURL
3. 重新编译小程序

## 🔍 测试部署

部署完成后，可以测试以下接口：

```bash
# 测试服务器状态
curl https://your-project-name.vercel.app

# 测试管理员登录
curl -X POST https://your-project-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## 📊 监控和日志

### 查看日志

在 Vercel 仪表板中可以查看：
- 部署日志
- 函数日志
- 错误日志

### 性能监控

Vercel 提供详细的性能监控：
- 函数执行时间
- 内存使用情况
- 请求统计

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 检查环境变量是否正确配置，查看部署日志。

### Q: 如何更新代码？
A: 推送代码到 GitHub 主分支，Vercel 会自动重新部署。

### Q: 如何查看日志？
A: 在 Vercel 仪表板的 "Functions" 标签页查看。

### Q: 如何配置自定义域名？
A: 在项目设置的 "Domains" 标签页配置。

## 💰 费用说明

- **免费计划**: 完全免费
- **Hobby 计划**: $20/月（更多功能）
- **Pro 计划**: $40/月（团队功能）

## 📞 技术支持

- Vercel 文档: https://vercel.com/docs
- Vercel 社区: https://github.com/vercel/vercel/discussions
- 项目 GitHub Issues: [您的项目地址]

---

**恭喜！** 您的后端服务现在可以 24/7 在线访问了！🎉

## 问题诊断

根据测试结果，云端API出现超时问题，说明Vercel部署可能存在问题。

## 解决方案

### 1. 检查Vercel部署状态

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目 `wechat-mall-demo`
3. 检查部署状态和日志

### 2. 环境变量配置

在Vercel项目设置中配置以下环境变量：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# 服务器配置
NODE_ENV=production
PORT=5000

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 3. 重新部署

#### 方法一：通过GitHub重新部署
1. 推送代码到GitHub
2. Vercel会自动重新部署

#### 方法二：手动重新部署
1. 在Vercel Dashboard中点击"Redeploy"
2. 选择"Redeploy with Existing Build Cache"

### 4. 检查部署日志

在Vercel Dashboard中查看部署日志，检查是否有错误：
- 构建错误
- 环境变量错误
- 依赖安装错误

### 5. 验证部署

部署完成后，测试以下端点：
- `https://wechat-mall-demo.vercel.app/` - 根路径
- `https://wechat-mall-demo.vercel.app/health` - 健康检查
- `https://wechat-mall-demo.vercel.app/api/announcements` - 公告接口

## 常见问题

### Q: 部署超时
A: 可能是环境变量未配置或数据库连接失败

### Q: 接口返回404
A: 检查vercel.json配置和路由注册

### Q: 数据库连接失败
A: 确认Supabase环境变量配置正确

## 本地测试

在重新部署前，建议先在本地测试：

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑.env文件，填入正确的配置

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 4. 测试接口
node test-announcements-api.js
```

## 部署检查清单

- [ ] 环境变量已配置
- [ ] 代码无语法错误
- [ ] 依赖包已安装
- [ ] 数据库连接正常
- [ ] 路由正确注册
- [ ] vercel.json配置正确
- [ ] 部署日志无错误
- [ ] 接口响应正常 