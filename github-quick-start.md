# 🚀 GitHub 快速上手指南

## 📋 5分钟快速部署到 GitHub

### 1. 准备工作（2分钟）

#### 检查 Git 是否已安装
```bash
git --version
```

如果没有安装，请访问：https://git-scm.com/downloads

#### 配置 Git 用户信息
```bash
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的邮箱地址"
```

### 2. 创建 GitHub 仓库（1分钟）

1. 访问 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `wechat-mall-demo`
   - **Description**: `微信商城小程序 + 管理后台 + Node.js后端`
   - **Visibility**: Public 或 Private
   - **不要**勾选任何初始化选项
4. 点击 "Create repository"

### 3. 上传项目（2分钟）

#### 在项目根目录执行以下命令：

```bash
# 1. 添加远程仓库（替换为您的仓库地址）
git remote add origin git@github.com:您的用户名/wechat-mall-demo.git

# 2. 添加所有文件
git add .

# 3. 创建首次提交
git commit -m "🎉 初始化项目：微信商城小程序 + 管理后台 + Node.js后端"

# 4. 推送到 GitHub
git push -u origin main
```

如果您的默认分支是 `master`，则使用：
```bash
git push -u origin master
```

## 🔧 常见问题解决

### 问题1：推送被拒绝
```bash
# 解决方案：先拉取远程更新
git pull origin main --allow-unrelated-histories
git push origin main
```

### 问题2：SSH 密钥问题
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "您的邮箱"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub: Settings > SSH and GPG keys > New SSH key
```

### 问题3：分支名称问题
```bash
# 查看当前分支
git branch

# 如果当前分支是 master，重命名为 main
git branch -M main
```

## 🎯 完成后的操作

### 1. 验证上传成功
访问您的 GitHub 仓库页面，确认所有文件都已上传。

### 2. 设置分支保护（可选）
1. 进入仓库 Settings → Branches
2. 添加规则保护 main 分支
3. 要求 Pull Request 审查

### 3. 邀请协作者（可选）
1. 进入仓库 Settings → Collaborators
2. 添加团队成员

## 📚 日常使用命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 拉取最新更新
git pull origin main

# 创建新分支
git checkout -b feature/新功能

# 切换分支
git checkout main

# 合并分支
git merge feature/新功能
```

## 🤖 自动化部署设置

### 1. 获取 Vercel 配置信息
```bash
# 在 backend-admin/admin-system 目录下
npx vercel --prod
```

### 2. 设置 GitHub Secrets
1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `VERCEL_TOKEN`: Vercel API Token
   - `ORG_ID`: Vercel 组织 ID
   - `PROJECT_ID`: Vercel 项目 ID

### 3. 测试自动部署
推送代码到 main 分支，GitHub Actions 将自动部署到 Vercel。

## 🎉 恭喜！

您的项目现在已经成功托管在 GitHub 上，并且配置了自动部署！

### 下一步建议：
1. 完善项目文档
2. 添加 README 说明
3. 设置 Issue 模板
4. 配置代码审查流程

---

💡 **需要帮助？** 如果遇到任何问题，请查看完整的 [GitHub 项目管理指南](./github-management-guide.md) 或联系我！ 