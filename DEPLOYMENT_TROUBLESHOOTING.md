# 🔧 Fixing Deployment Issues

## ❌ Current Error

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
```

This error means Vercel cannot find your deployment. Here's how to fix it:

---

## ✅ Quick Fix Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# From project root
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No (first time)
- **Project name?** agentic-ai-sapor
- **Directory?** `./` (root)

### 4. Set Environment Variables

```bash
# Add secrets to Vercel
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add HF_API_KEY
```

---

## 🎯 Alternative: Deploy to Vercel from GitHub

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `Ken-1412/Agentic-Ai-Sopar`
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=your_secret_key
   HF_API_KEY=your_hf_key
   LLM_DEPLOYMENT_MODE=online
   REDIS_ENABLED=false
   NODE_ENV=production
   ```

6. Click "Deploy"

### Option B: Vercel CLI with GitHub

```bash
# Link to GitHub repo
vercel --prod

# Or specify branch
vercel --prod --branch main
```

---

## 🗄️ MongoDB Atlas Setup (Required for Cloud)

Your local MongoDB won't work on Vercel. Use MongoDB Atlas:

### 1. Create Free Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Create FREE cluster
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (allow all)

### 2. Get Connection String

```
mongodb+srv://username:password@cluster.mongodb.net/sapor?retryWrites=true&w=majority
```

### 3. Add to Vercel

```bash
vercel env add MONGODB_URI production
# Paste your MongoDB Atlas connection string
```

---

## 🚨 Common Deployment Issues

### Issue 1: Build Fails

**Error**: `Module not found` or `Build failed`

**Fix**:
```bash
# Test build locally first
cd frontend
npm run build

# If it works, commit and push
git add .
git commit -m "fix: Update build configuration"
git push origin main
```

### Issue 2: API Routes Not Working

**Fix**: Update `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/server.js" }
  ]
}
```

### Issue 3: Environment Variables Not Loading

**Fix**:
```bash
# Check current env vars
vercel env ls

# Pull env vars to local
vercel env pull .env.local
```

---

## 📦 Better Alternative: Deploy Full Stack

Since SAPOR has backend + MongoDB + Redis, Vercel isn't ideal. Try these:

### Option 1: Railway.app (Best for Full Stack)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Advantages**:
- Supports Docker
- Built-in MongoDB
- Built-in Redis
- Automatic deployments

### Option 2: Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Select `docker-compose.prod.yml`
5. Add environment variables
6. Deploy

### Option 3: DigitalOcean App Platform

```bash
# Install doctl
# Connect GitHub
# Deploy from docker-compose.prod.yml
```

---

## ✅ Recommended Deployment Strategy

**For SAPOR with all features:**

### Use Railway (Easiest)

```bash
# 1. Install
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Add MongoDB
railway add -d mongodb

# 5. Add Redis
railway add -d redis

# 6. Deploy
railway up

# 7. Set custom domain
railway domain
```

### Or Use Docker on any VPS

```bash
# 1. Get a VPS (DigitalOcean, Linode, AWS)
# 2. SSH into server
ssh root@your-server-ip

# 3. Clone repo
git clone https://github.com/Ken-1412/Agentic-Ai-Sopar.git
cd Agentic-Ai-Sopar

# 4. Configure
cp .env.production.example .env.production
nano .env.production

# 5. Deploy
./deploy.sh
```

---

## 🎯 Quick Decision Guide

**Choose Vercel if:**
- ✅ You only need frontend + serverless API
- ✅ You can use MongoDB Atlas (cloud)
- ✅ You don't need Redis
- ✅ You want automatic GitHub deployments

**Choose Railway if:**
- ✅ You need full backend with databases
- ✅ You want built-in MongoDB/Redis
- ✅ You want Docker support
- ✅ You want simplicity

**Choose VPS (DigitalOcean/AWS) if:**
- ✅ You want full control
- ✅ You need all SAPOR features
- ✅ You're comfortable with servers
- ✅ You want to use docker-compose.prod.yml

---

## 📝 Next Steps

1. **Choose deployment platform**
2. **Set up MongoDB Atlas** (if using Vercel)
3. **Configure environment variables**
4. **Test deployment**
5. **Set up custom domain** (optional)

---

**Need Help?** Share which platform you want to use and I'll provide exact steps!
