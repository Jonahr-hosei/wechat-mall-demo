@echo off
echo 正在查找占用5000端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo 找到进程PID: %%a
    taskkill /f /pid %%a
    echo 已停止进程 %%a
    goto :end
)
echo 未找到占用5000端口的进程
:end
pause 