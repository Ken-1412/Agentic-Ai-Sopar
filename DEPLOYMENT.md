# 🚀 SAPOR Production Deployment Guide

Complete guide for deploying SAPOR to production environments.

## 📋 Prerequisites

### Required
- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0
- **4GB RAM** minimum (8GB recommended)
- **20GB disk space**

### Optional
- Domain name with DNS configured
- SSL certificate (Let's Encrypt or custom)
- Monitoring tools (Prometheus, Grafana)

## 🎯 Quick Deployment

### 1. Clone & Configure

```bash
# Clone repository
git clone https://github.com/Ken-1412/Agentic-Ai-Sopar.git
cd Agentic-Ai-Sopar

# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Critical Variables to Change:**
```env
MONGO_PASSWORD=your-secure-password
JWT_SECRET=your-random-secret-key
HF_API_KEY=your-huggingface-key
CORS_ORIGIN=https://yourdomain.com
```

### 2. Deploy

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```powershell
.\deploy.ps1
```

### 3. Verify

```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Test endpoints
curl http://localhost/api/health
curl http://localhost
```

---

## 📦 Manual Deployment

### Step-by-Step

#### 1. Build Images

```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Initialize Database

```bash
# Seed initial data (optional)
docker exec sapor-backend-prod node seeder.js
```

#### 4. Configure Kestra Workflows

```bash
# Access Kestra UI
open http://localhost:8080

# Upload workflows from /flows directory
```

---

## 🔒 Security Hardening

### 1. Environment Variables

Never commit these to Git:
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `MONGO_PASSWORD` - Use strong password
- `REDIS_PASSWORD` - Generate: `openssl rand -base64 24`
- API keys (HuggingFace, OpenAI, etc.)

### 2. MongoDB Authentication

```bash
# Connect to MongoDB
docker exec -it sapor-mongodb-prod mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["root"]
})

# Create app user
use sapor
db.createUser({
  user: "sapor_app",
  pwd: "app-password",
  roles: [{ role: "readWrite", db: "sapor" }]
})
```

Update connection string:
```env
MONGODB_URI=mongodb://sapor_app:app-password@mongodb:27017/sapor?authSource=sapor
```

### 3. SSL/TLS Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/
```

#### Option B: Self-Signed (Development)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem
```

Update `frontend/nginx.conf` to enable HTTPS block.

### 4. Firewall Rules

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct database access
sudo ufw deny 27017/tcp
sudo ufw deny 6379/tcp

# Enable firewall
sudo ufw enable
```

---

## 🌐 Domain Configuration

### DNS Records

```
A     @              <YOUR_SERVER_IP>
A     www            <YOUR_SERVER_IP>
CNAME api            @
```

### Nginx Configuration

Update `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # ... rest of configuration
}
```

---

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost/

# Database connection
docker exec sapor-mongodb-prod mongosh --eval "db.adminCommand('ping')"
```

---

## 🔄 CI/CD with GitHub Actions

### Setup Secrets

Go to GitHub → Settings → Secrets and add:

```
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=deploy
SSH_PRIVATE_KEY=<your-ssh-key>
PRODUCTION_URL=https://yourdomain.com
SLACK_WEBHOOK_URL=<optional>
```

### Workflow Triggers

- **Push to main**: Automatic deployment
- **Tag push** (`v*`): Versioned deployment
- **Manual**: Dispatch from GitHub UI

---

## 🔧 Maintenance

### Backup Database

```bash
# Create backup
docker exec sapor-mongodb-prod mongodump --out /backups/$(date +%Y%m%d)

# Copy to host
docker cp sapor-mongodb-prod:/backups ./backups
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backups/20231215 sapor-mongodb-prod:/backups/

# Restore
docker exec sapor-mongodb-prod mongorestore /backups/20231215
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy.sh
```

### Scale Services

```bash
# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balancer needed for multiple backends
```

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs sapor-backend-prod

# Common issues:
# 1. MongoDB not ready - wait 30 seconds
# 2. Wrong credentials - check .env.production
# 3. Port conflict - change PORT in .env.production
```

### Frontend 502 Error

```bash
# Check backend health
curl http://backend:3001/api/health

# Check nginx logs
docker logs sapor-frontend-prod

# Restart services
docker-compose -f docker-compose.prod.yml restart backend frontend
```

### Database Connection Failed

```bash
# Check MongoDB
docker exec sapor-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Check credentials
echo $MONGODB_URI

# Restart MongoDB
docker-compose -f docker-compose.prod.yml restart mongodb
```

### Out of Memory

```bash
# Check usage
docker stats

# Increase limits in docker-compose.prod.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## 📈 Performance Optimization

### Enable Redis Caching

```env
REDIS_ENABLED=true
REDIS_URL=redis://:password@redis:6379
```

### Database Indexing

```javascript
// Connect to MongoDB
docker exec -it sapor-mongodb-prod mongosh sapor

// Create indexes
db.meals.createIndex({ name: 1 })
db.meals.createIndex({ calories: 1 })
db.feedbacks.createIndex({ mealId: 1, userId: 1 })
```

### Nginx Caching

Update `frontend/nginx.conf`:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest
}
```

---

## 🎓 Production Checklist

### Pre-Deployment
- [ ] All secrets configured in `.env.production`
- [ ] SSL certificates obtained
- [ ] Database backups automated
- [ ] Monitoring tools configured
- [ ] Health check endpoints working
- [ ] Load testing completed

### Post-Deployment
- [ ] All services running (`docker-compose ps`)
- [ ] Health endpoints responding
- [ ] Frontend accessible on domain
- [ ] API endpoints working
- [ ] Kestra workflows uploaded
- [ ] Logs being collected
- [ ] Backup system active
- [ ] Monitoring dashboards set up

### Security
- [ ] Firewall configured
- [ ] MongoDB authentication enabled
- [ ] Redis password set
- [ ] JWT secret randomized
- [ ] CORS configured for production domain
- [ ] HTTPS/SSL enabled
- [ ] Security headers active
- [ ] Rate limiting enabled

---

## 🌟 Cloud Deployment

### AWS

```bash
# EC2 instance
# Recommended: t3.medium (2 vCPU, 4GB RAM)

# Install Docker
sudo yum update -y
sudo amazon-linux-extras install docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy
git clone <repo>
cd Agentic-Ai-Sopar
cp .env.production.example .env.production
# Edit .env.production
./deploy.sh
```

### DigitalOcean

Use Docker one-click droplet or:

```bash
# Create droplet (Docker pre-installed)
doctl compute droplet create sapor \
  --image docker-20-04 \
  --size s-2vcpu-4gb \
  --region nyc3

# SSH and deploy
ssh root@<droplet-ip>
# Same as above
```

### Google Cloud Platform

```bash
# Create VM with Docker
gcloud compute instances create sapor \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --machine-type=e2-medium \
  --boot-disk-size=20GB

# SSH and deploy
gcloud compute ssh sapor
```

---

## 📞 Support

- 📧 GitHub Issues: [Report Bug](https://github.com/Ken-1412/Agentic-Ai-Sopar/issues)
- 💬 Discussions: [Ask Question](https://github.com/Ken-1412/Agentic-Ai-Sopar/discussions)
- 📚 Documentation: [Full Docs](./docs/)

---

**🚀 SAPOR is production-ready!** Deploy with confidence!
