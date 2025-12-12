# SAPOR Production Deployment Script for Windows
# Run with: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 SAPOR Production Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path .env.production) {
    Write-Host "✓ Loading production environment..." -ForegroundColor Green
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "❌ Error: .env.production file not found!" -ForegroundColor Red
    Write-Host "   Copy .env.production.example to .env.production and configure it." -ForegroundColor Yellow
    exit 1
}

# Check Docker
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "✓ Docker and Docker Compose found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker or Docker Compose is not installed!" -ForegroundColor Red
    exit 1
}

# Build images
Write-Host ""
Write-Host "📦 Building production images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
Write-Host ""
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Start services
Write-Host ""
Write-Host "🚀 Starting production services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "🏥 Checking service health..." -ForegroundColor Yellow

function Test-ServiceHealth {
    param($ServiceName, $Url, $MaxAttempts = 30)
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ $ServiceName is healthy" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "  Waiting for $ServiceName... (attempt $i/$MaxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Host "❌ $ServiceName failed to start" -ForegroundColor Red
    return $false
}

Test-ServiceHealth "Backend" "http://localhost:3001/api/health"
Test-ServiceHealth "Frontend" "http://localhost:80"

# Show status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Show logs
Write-Host ""
Write-Host "📋 Recent logs:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs --tail=20

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   Kestra: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop services: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
