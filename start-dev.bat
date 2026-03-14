@echo off
echo ========================================
echo   FitAI Pro - Development Servers
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Check if database exists
if not exist "dev.db" (
    echo Setting up database...
    call npx prisma generate
    call npx prisma migrate dev --name init
    echo.
)

:: Start Backend Server
echo [1/2] Starting backend server on port 3001...
start cmd /k "echo Backend Server Starting... && npm run server"

:: Wait 5 seconds for backend to initialize
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

:: Start Frontend Server
echo [2/2] Starting frontend server on port 3000...
start cmd /k "echo Frontend Server Starting... && npm run dev"

echo.
echo ========================================
echo   Servers Starting Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend:    http://localhost:3000
echo.
echo Login at: http://localhost:3000/login
echo Email: admin@fitaipro.com
echo Password: Admin123!
echo.
echo Keep both terminal windows OPEN!
echo Press any key to exit this window...
pause >nul
