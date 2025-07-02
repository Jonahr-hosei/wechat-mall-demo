# 公告功能调试指南

## 问题描述
小程序端没有显示商场公告，需要逐步排查问题。

## 调试步骤

### 1. 检查数据库数据
首先确认数据库中是否有公告数据：

1. 登录您的Supabase项目
2. 进入Table Editor
3. 查看 `announcements` 表
4. 确认有以下数据：
   - 公告记录存在
   - `status` 字段为 `1`（启用状态）
   - `title` 和 `content` 字段有内容

### 2. 测试数据库连接
运行测试脚本检查数据库连接：

```bash
cd backend-admin/admin-system
node test-announcements.js
```

### 3. 测试API接口
启动测试服务器：

```bash
cd backend-admin/admin-system
node test-announcements-api.js
```

然后在浏览器中访问：
- `http://localhost:3001/test-announcements` - 测试公告数据
- `http://localhost:3001/test-home` - 测试首页数据

### 4. 检查小程序网络请求
在微信开发者工具中：

1. 打开调试器
2. 查看Network面板
3. 刷新小程序首页
4. 查看是否有对 `/api/mall/home` 的请求
5. 检查请求响应是否包含 `announcements` 数据

### 5. 检查小程序控制台
在微信开发者工具的控制台中查看：
- 是否有错误信息
- 首页数据加载的日志
- 公告数据的数量

### 6. 手动测试API
使用curl或Postman测试API：

```bash
curl https://your-domain.vercel.app/api/mall/home
```

检查响应中是否包含：
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": 1,
        "title": "欢迎光临我们的商场",
        "type": "general",
        "time": "2024-01-01"
      }
    ]
  }
}
```

## 常见问题及解决方案

### 问题1: 数据库中没有数据
**解决方案**: 执行SQL脚本创建表和插入数据

### 问题2: API返回错误
**可能原因**:
- 环境变量未配置
- 数据库连接失败
- 表不存在

**解决方案**:
1. 检查 `.env` 文件配置
2. 确认Supabase项目设置
3. 验证表结构

### 问题3: 小程序显示"加载失败"
**可能原因**:
- 网络请求失败
- API返回错误
- 域名未配置

**解决方案**:
1. 检查网络连接
2. 查看API响应
3. 配置微信小程序域名白名单

### 问题4: 公告数量显示为0
**可能原因**:
- 数据格式不匹配
- 条件判断错误
- 缓存问题

**解决方案**:
1. 清除小程序缓存
2. 检查数据格式
3. 重新加载页面

## 调试工具

### 1. 小程序调试
- 微信开发者工具
- 控制台日志
- Network面板

### 2. 后端调试
- 测试脚本: `test-announcements.js`
- 测试API: `test-announcements-api.js`
- 服务器日志

### 3. 数据库调试
- Supabase Dashboard
- SQL Editor
- Table Editor

## 修复后的验证

修复完成后，请验证：

1. ✅ 数据库中公告表存在且有数据
2. ✅ API接口正常返回公告数据
3. ✅ 小程序首页显示公告列表
4. ✅ 点击公告可跳转到详情页
5. ✅ 公告列表页面正常工作

## 联系支持

如果按照以上步骤仍无法解决问题，请提供：

1. 数据库截图（显示announcements表数据）
2. API响应截图
3. 小程序控制台错误信息
4. 网络请求日志

这样我可以更准确地帮您定位问题。 