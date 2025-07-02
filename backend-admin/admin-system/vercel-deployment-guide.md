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