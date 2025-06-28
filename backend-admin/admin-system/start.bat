@echo off
echo 正在启动商场后台管理系统...
echo.

echo 1. 安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)

echo.
echo 2. 安装前端依赖...
cd client
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)
cd ..

echo.
echo 3. 创建uploads目录...
if not exist uploads mkdir uploads

echo.
echo 4. 启动开发服务器...
echo 后台管理系统将在 http://localhost:5000 启动
echo 小程序API地址: http://localhost:5000/api/mall
echo.
echo 默认管理员账号: admin
echo 默认管理员密码: admin123
echo.

call npm run dev

pause 