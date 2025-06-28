# 🚀 GitHub 项目管理指南

## 📋 目录
1. [准备工作](#准备工作)
2. [创建 GitHub 仓库](#创建-github-仓库)
3. [本地 Git 配置](#本地-git-配置)
4. [上传项目到 GitHub](#上传项目到-github)
5. [分支管理策略](#分支管理策略)
6. [协作开发流程](#协作开发流程)
7. [自动化部署](#自动化部署)
8. [常见问题解决](#常见问题解决)

## 🔧 准备工作

### 1. 安装 Git（如果还没有）
```bash
# Windows 用户可以从官网下载：https://git-scm.com/
# 或者使用 winget
winget install Git.Git
```

### 2. 配置 Git 用户信息
```bash
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的邮箱地址"
```

### 3. 生成 SSH 密钥（推荐）
```bash
ssh-keygen -t ed25519 -C "您的邮箱地址"
# 按回车使用默认设置
```

将公钥添加到 GitHub：
```bash
# 复制公钥内容
cat ~/.ssh/id_ed25519.pub
# 然后粘贴到 GitHub Settings > SSH and GPG keys > New SSH key
```

## 📦 创建 GitHub 仓库

### 1. 在 GitHub 上创建新仓库
1. 登录 GitHub
2. 点击右上角 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `wechat-mall-demo`
   - **Description**: `微信商城小程序 + 管理后台 + Node.js后端`
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选 "Add a README file"（因为您已有项目）
   - **不要**勾选 "Add .gitignore"（我们会手动创建）

### 2. 复制仓库地址
创建完成后，复制仓库的 SSH 地址：
```
git@github.com:您的用户名/wechat-mall-demo.git
```

## 💻 本地 Git 配置

### 1. 创建 .gitignore 文件
在项目根目录创建 `.gitignore` 文件：

```bash
# 在项目根目录执行
touch .gitignore
```

`.gitignore` 内容：
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build/
dist/
.next/
out/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Database files
*.db
*.sqlite
*.sqlite3

# Upload files
uploads/
public/uploads/

# Temporary files
tmp/
temp/

# Cache
.cache/
.parcel-cache/

# Vercel
.vercel/

# Railway
.railway/
```

### 2. 初始化 Git 仓库（如果还没有）
```bash
# 检查是否已初始化
ls -la | grep .git

# 如果没有 .git 目录，则初始化
git init
```

### 3. 添加远程仓库
```bash
git remote add origin git@github.com:您的用户名/wechat-mall-demo.git
```

## 📤 上传项目到 GitHub

### 1. 添加所有文件到暂存区
```bash
git add .
```

### 2. 创建首次提交
```bash
git commit -m "🎉 初始化项目：微信商城小程序 + 管理后台 + Node.js后端

- 微信小程序：商品展示、购物车、订单管理
- 管理后台：商品管理、订单管理、用户管理
- Node.js后端：RESTful API、Supabase数据库
- 部署配置：Vercel部署、环境变量管理"
```

### 3. 推送到 GitHub
```bash
git push -u origin main
```

如果您的默认分支是 `master`，则使用：
```bash
git push -u origin master
```

## 🌿 分支管理策略

### 1. 创建开发分支
```bash
# 创建并切换到开发分支
git checkout -b develop

# 推送开发分支到远程
git push -u origin develop
```

### 2. 创建功能分支
```bash
# 从开发分支创建功能分支
git checkout develop
git checkout -b feature/新功能名称

# 开发完成后合并回开发分支
git checkout develop
git merge feature/新功能名称
git branch -d feature/新功能名称
```

### 3. 发布流程
```bash
# 从开发分支创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 修复发布问题后合并到主分支
git checkout main
git merge release/v1.0.0
git tag v1.0.0

# 删除发布分支
git branch -d release/v1.0.0
```

## 👥 协作开发流程

### 1. Fork 仓库（如果是开源项目）
1. 在 GitHub 上点击 "Fork" 按钮
2. 克隆您的 Fork 仓库
3. 添加上游仓库：
```bash
git remote add upstream git@github.com:原作者/wechat-mall-demo.git
```

### 2. 同步上游更新
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 3. 创建 Pull Request
1. 在您的 Fork 仓库中创建功能分支
2. 开发完成后推送到您的仓库
3. 在 GitHub 上创建 Pull Request

## 🤖 自动化部署

### 1. GitHub Actions 配置
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend-admin/admin-system/package-lock.json
    
    - name: Install dependencies
      run: |
        cd backend-admin/admin-system
        npm ci
    
    - name: Run tests
      run: |
        cd backend-admin/admin-system
        npm test
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./backend-admin/admin-system
```

### 2. 设置 GitHub Secrets
在 GitHub 仓库设置中添加：
- `VERCEL_TOKEN`: Vercel API Token
- `ORG_ID`: Vercel 组织 ID
- `PROJECT_ID`: Vercel 项目 ID

## 🔧 常见问题解决

### 1. 推送被拒绝
```bash
# 如果远程有更新，先拉取
git pull origin main

# 如果有冲突，解决后重新提交
git add .
git commit -m "解决冲突"
git push origin main
```

### 2. 撤销提交
```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1
```

### 3. 查看提交历史
```bash
# 查看提交历史
git log --oneline

# 查看文件变更
git diff HEAD~1
```

### 4. 切换分支
```bash
# 查看所有分支
git branch -a

# 切换分支
git checkout 分支名

# 创建并切换分支
git checkout -b 新分支名
```

## 📚 最佳实践

### 1. 提交信息规范
```
类型(范围): 简短描述

详细描述（可选）

- 功能点1
- 功能点2
```

类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 2. 分支命名规范
- `main/master`: 主分支
- `develop`: 开发分支
- `feature/功能名`: 功能分支
- `bugfix/问题描述`: 修复分支
- `release/版本号`: 发布分支
- `hotfix/问题描述`: 热修复分支

### 3. 定期同步
```bash
# 每天开始工作前
git pull origin main

# 工作结束后
git add .
git commit -m "描述今天的更改"
git push origin main
```

## 🎯 下一步

1. **完成 GitHub 仓库创建**
2. **配置 GitHub Actions 自动部署**
3. **邀请团队成员协作**
4. **设置分支保护规则**
5. **配置代码审查流程**

---

💡 **提示**: 如果您在操作过程中遇到任何问题，请查看 GitHub 的官方文档或联系我获取帮助！ 