@echo off
REM RTO Queue System Setup Script for Windows
REM This script sets up the entire project for development

echo 🚀 Setting up RTO Automated Queue System...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo 📦 Setting up backend...
cd backend

REM Install dependencies
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit backend\.env with your database credentials
)

cd ..

REM Setup Frontend
echo 📦 Setting up frontend...
cd frontend

REM Install dependencies
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
)

cd ..

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Create PostgreSQL database: createdb rto_queue_system
echo 2. Edit backend\.env with your database credentials
echo 3. Run database schema: psql -U your_user -d rto_queue_system -f backend\src\DB\schema.sql
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm start
echo.
echo For detailed instructions, see README.md
pause
