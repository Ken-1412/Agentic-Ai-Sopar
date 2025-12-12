#!/bin/bash
# SAPOR Production Deployment Script

set -e  # Exit on error

echo "🚀 SAPOR Production Deployment"
echo "================================"

# Load environment variables
if [ -f .env.production ]; then
    echo "✓ Loading production environment..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.production file not found!"
    echo "   Copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    exit 1
fi

echo "✓ Docker and Docker Compose found"

# Build images
echo ""
echo "📦 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo ""
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✓ $service is healthy"
            return 0
        fi
        echo "  Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service failed to start"
    return 1
}

check_service "Backend" "http://localhost:3001/api/health"
check_service "Frontend" "http://localhost:80"

# Show status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3001"
echo "   Kestra: http://localhost:8080"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services: docker-compose -f docker-compose.prod.yml down"
