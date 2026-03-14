# FitAI Pro Deployment Script for Windows
# Run this to prepare for production deployment

Write-Host "🚀 FitAI Pro - Preparing for Production Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ Found .env file" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please update .env with your production values!" -ForegroundColor Red
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Generate Prisma client
Write-Host ""
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Cyan
npm run prisma:generate

# Build Next.js frontend
Write-Host ""
Write-Host "🏗️  Building Next.js frontend..." -ForegroundColor Cyan
npm run build

# Build backend
Write-Host ""
Write-Host "🔧 Building backend server..." -ForegroundColor Cyan
npm run server:build

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with production values (especially JWT secrets!)"
Write-Host "2. Set up production database (PostgreSQL recommended)"
Write-Host "3. Run: npm run prisma:migrate deploy"
Write-Host "4. Start services:"
Write-Host "   Frontend: npm start"
Write-Host "   Backend: npm run server:start"
Write-Host ""
Write-Host "🎯 Your app is ready for deployment!" -ForegroundColor Green
