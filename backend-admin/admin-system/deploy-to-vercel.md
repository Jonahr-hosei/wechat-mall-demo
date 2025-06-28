# ⚡ 快速部署到 Vercel

## 🚀 一键部署步骤

### 1. 准备 GitHub 仓库

确保您的代码已推送到 GitHub：

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 2. 部署到 Vercel

1. **访问 Vercel**: https://vercel.com
2. **登录**: 使用 GitHub 账号
3. **创建项目**: 点击 "New Project"
4. **导入仓库**: 选择 "Import Git Repository"
5. **选择仓库**: 选择您的项目仓库
6. **配置设置**:
   - **Framework Preset**: `Node.js`
   - **Root Directory**: `backend-admin/admin-system`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

### 3. 环境变量配置

在 Vercel 项目设置的 "Environment Variables" 标签页添加：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | `https://bqhdklwlioshshtprujh.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaGRrbHdsaW9zaHNodHBydWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODI4NDUsImV4cCI6MjA2NjY1ODg0NX0.yGA9uxz9lJu4srG2cN7uoZ9eoPjylkq43yGnDMjLDYc` |
| `JWT_SECRET` | `mall_admin_system_jwt_secret_2024` |
| `NODE_ENV` | `production` |

### 4. 获取部署域名

部署完成后，Vercel 会提供类似这样的域名：
`https://your-project-name.vercel.app`

### 5. 测试部署

```bash
# 测试服务器状态
curl https://your-project-name.vercel.app

# 测试管理员登录
curl -X POST https://your-project-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📱 更新小程序配置

部署完成后，更新小程序中的 API 地址：

1. 打开 `miniprogram/utils/request.js`
2. 将 baseURL 更新为您的 Vercel 域名
3. 重新编译小程序

## 🔄 自动部署

每次推送到 GitHub 主分支时，Vercel 会自动重新部署您的应用。

## 📊 监控部署

在 Vercel 仪表板中可以：
- 查看部署状态
- 监控函数性能
- 查看错误日志
- 管理环境变量

## 🎯 Vercel 优势

- **完全免费**: 无限制的免费计划
- **全球 CDN**: 访问速度快
- **自动 HTTPS**: 免费 SSL 证书
- **Serverless**: 按需扩展
- **监控完善**: 详细的性能监控

---

**部署时间**: 约 1-2 分钟
**免费额度**: 完全免费
**支持**: 24/7 在线访问 