# FitAI Pro - Setup Script for Windows PowerShell
# This script helps you quickly set up the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitAI Pro - Database Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask user which database they want to use
Write-Host "Which database would you like to use?" -ForegroundColor Yellow
Write-Host "[1] SQLite (Easiest - No installation, recommended for testing)" -ForegroundColor White
Write-Host "[2] PostgreSQL via Docker (Recommended for development)" -ForegroundColor White
Write-Host "[3] PostgreSQL installed locally" -ForegroundColor White
Write-Host "[4] Cloud database (Neon/Supabase)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nSetting up SQLite..." -ForegroundColor Green
        
        # Backup current .env
        if (Test-Path ".env") {
            Copy-Item ".env" ".env.backup.postgresql"
            Write-Host "✓ Backed up PostgreSQL .env to .env.backup.postgresql" -ForegroundColor Green
        }
        
        # Update .env for SQLite
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace 'DATABASE_URL="postgresql://.*"', 'DATABASE_URL="file:./dev.db"'
        Set-Content ".env" $envContent
        Write-Host "✓ Updated .env for SQLite" -ForegroundColor Green
        
        # Update Prisma schema for SQLite
        $schemaContent = Get-Content "prisma/schema.prisma" -Raw
        $schemaContent = $schemaContent -replace 'provider\s*=\s*"postgresql"', 'provider = "sqlite"'
        Set-Content "prisma/schema.prisma" $schemaContent
        Write-Host "✓ Updated Prisma schema for SQLite" -ForegroundColor Green
        
        # Generate Prisma client
        Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
        npx prisma generate
        Write-Host "✓ Prisma client generated" -ForegroundColor Green
        
        # Run migrations
        Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
        npx prisma migrate dev --name init
        Write-Host "✓ Database initialized" -ForegroundColor Green
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  ✅ SQLite Setup Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now start the server:" -ForegroundColor Yellow
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Login credentials:" -ForegroundColor Yellow
        Write-Host "  Email: admin@fitaipro.com" -ForegroundColor White
        Write-Host "  Password: Admin123!" -ForegroundColor White
        Write-Host ""
    }
    
    "2" {
        Write-Host "`nSetting up PostgreSQL with Docker..." -ForegroundColor Green
        
        # Check if Docker is installed
        $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
        if (-not $dockerInstalled) {
            Write-Host "❌ Docker is not installed!" -ForegroundColor Red
            Write-Host "Please install Docker Desktop from:" -ForegroundColor Yellow
            Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor White
            exit 1
        }
        
        Write-Host "✓ Docker detected" -ForegroundColor Green
        
        # Remove old container if exists
        docker rm -f fitai-postgres 2>$null
        Write-Host "✓ Cleaned up old containers" -ForegroundColor Green
        
        # Start PostgreSQL container
        Write-Host "`nStarting PostgreSQL container..." -ForegroundColor Yellow
        docker run -d `
          --name fitai-postgres `
          -e POSTGRES_USER=postgres `
          -e POSTGRES_PASSWORD=password `
          -e POSTGRES_DB=fitai-pro `
          -p 5432:5432 `
          postgres:15-alpine
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ PostgreSQL container started" -ForegroundColor Green
            
            # Wait for PostgreSQL to be ready
            Write-Host "`nWaiting for PostgreSQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            # Verify container is running
            docker ps | Select-String "fitai-postgres" > $null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ PostgreSQL is running on localhost:5432" -ForegroundColor Green
                
                # Generate Prisma client
                Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
                npx prisma generate
                Write-Host "✓ Prisma client generated" -ForegroundColor Green
                
                # Run migrations
                Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
                npx prisma migrate deploy
                Write-Host "✓ Database migrated" -ForegroundColor Green
                
                Write-Host "`n========================================" -ForegroundColor Cyan
                Write-Host "  ✅ PostgreSQL + Docker Setup Complete!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "Database connection:" -ForegroundColor Yellow
                Write-Host "  Host: localhost:5432" -ForegroundColor White
                Write-Host "  Database: fitai-pro" -ForegroundColor White
                Write-Host "  User: postgres" -ForegroundColor White
                Write-Host "  Password: password" -ForegroundColor White
                Write-Host ""
                Write-Host "To stop PostgreSQL later:" -ForegroundColor Yellow
                Write-Host "  docker stop fitai-postgres" -ForegroundColor White
                Write-Host ""
                Write-Host "To start it again:" -ForegroundColor Yellow
                Write-Host "  docker start fitai-postgres" -ForegroundColor White
                Write-Host ""
            } else {
                Write-Host "❌ Container failed to start" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "`nUsing locally installed PostgreSQL..." -ForegroundColor Green
        
        # Check if .env needs updating
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match 'DATABASE_URL="postgresql://user:password@localhost:5432/fitai-pro') {
            Write-Host "✓ .env already configured for local PostgreSQL" -ForegroundColor Green
        } else {
            Write-Host "⚠ Make sure your .env has:" -ForegroundColor Yellow
            Write-Host '  DATABASE_URL="postgresql://user:password@localhost:5432/fitai-pro?sslmode=disable"' -ForegroundColor White
        }
        
        # Generate Prisma client
        Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
        npx prisma generate
        Write-Host "✓ Prisma client generated" -ForegroundColor Green
        
        # Try to run migrations
        Write-Host "`nAttempting database migration..." -ForegroundColor Yellow
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database migrated successfully" -ForegroundColor Green
            
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "  ✅ Local PostgreSQL Setup Complete!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
        } else {
            Write-Host "`n⚠ Migration failed. Is PostgreSQL running?" -ForegroundColor Yellow
            Write-Host "Check:" -ForegroundColor Yellow
            Write-Host "  1. PostgreSQL service is running (services.msc)" -ForegroundColor White
            Write-Host "  2. Database 'fitai-pro' exists" -ForegroundColor White
            Write-Host "  3. Credentials in .env are correct" -ForegroundColor White
            Write-Host ""
            Write-Host "See DATABASE_QUICK_FIX.md for troubleshooting" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host "`nCloud Database Setup Guide" -ForegroundColor Green
        Write-Host ""
        Write-Host "For Neon (Free Serverless PostgreSQL):" -ForegroundColor Yellow
        Write-Host "  1. Go to https://neon.tech" -ForegroundColor White
        Write-Host "  2. Sign up with GitHub" -ForegroundColor White
        Write-Host "  3. Create new project" -ForegroundColor White
        Write-Host "  4. Copy connection string" -ForegroundColor White
        Write-Host "  5. Update .env with your connection string" -ForegroundColor White
        Write-Host ""
        Write-Host "For Supabase (Free PostgreSQL + extras):" -ForegroundColor Yellow
        Write-Host "  1. Go to https://supabase.com" -ForegroundColor White
        Write-Host "  2. Sign up with GitHub" -ForegroundColor White
        Write-Host "  3. Create new project" -ForegroundColor White
        Write-Host "  4. Get connection string from Settings" -ForegroundColor White
        Write-Host "  5. Update .env with your connection string" -ForegroundColor White
        Write-Host ""
        Write-Host "After updating .env, run:" -ForegroundColor Yellow
        Write-Host "  npx prisma generate" -ForegroundColor White
        Write-Host "  npx prisma migrate deploy" -ForegroundColor White
        Write-Host ""
        Write-Host "See DATABASE_QUICK_FIX.md for detailed instructions" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
        Write-Host "Defaulting to SQLite setup..." -ForegroundColor Yellow
        
        # Run SQLite setup as default
        & $PSCommandPath.Replace(".ps1", "_sqlite.ps1")
    }
}

Write-Host "`nFor more details, see:" -ForegroundColor Yellow
Write-Host "  DATABASE_QUICK_FIX.md" -ForegroundColor White
Write-Host ""
