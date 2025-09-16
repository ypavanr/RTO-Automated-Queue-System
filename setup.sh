#!/bin/bash

# RTO Queue System Setup Script
# This script sets up the entire project for development

echo "🚀 Setting up RTO Automated Queue System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

cd ..

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
fi

cd ..

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database: createdb rto_queue_system"
echo "2. Edit backend/.env with your database credentials"
echo "3. Run database schema: psql -U your_user -d rto_queue_system -f backend/src/DB/schema.sql"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm start"
echo ""
echo "For detailed instructions, see README.md"
