# 环境变量配置指南

## 快速配置步骤

### 1. 创建 .env 文件
在 `backend-admin/admin-system/` 目录下创建 `.env` 文件，内容如下：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here

# 服务器配置
PORT=5000
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# 微信小程序配置（可选）
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

### 2. 获取 Supabase 配置信息

1. 访问 [Supabase 控制台](https://app.supabase.com/project)
2. 选择您的项目
3. 进入 Settings > API
4. 复制以下信息：
   - **Project URL** → 填入 `SUPABASE_URL`
   - **anon public** → 填入 `SUPABASE_ANON_KEY`
   - **service_role secret** → 填入 `SUPABASE_SERVICE_ROLE_KEY`

### 3. 生成 JWT 密钥
可以使用任何随机字符串作为 JWT_SECRET，例如：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 测试配置
配置完成后，运行以下命令测试：

```bash
# 测试数据库连接
node test-announcements-data.js

# 测试公告API接口
node test-announcements-api.js
```

## 常见问题

### Q: 为什么需要配置环境变量？
A: 后端服务需要连接到 Supabase 数据库，这些配置信息用于建立数据库连接。

### Q: 配置完成后还是无法获取公告数据？
A: 请检查：
1. 数据库中的公告状态是否为 1（启用）
2. 公告表是否存在数据
3. 后端服务是否正常启动

### Q: 如何确认配置是否正确？
A: 运行测试脚本，如果能看到公告数据，说明配置正确。 