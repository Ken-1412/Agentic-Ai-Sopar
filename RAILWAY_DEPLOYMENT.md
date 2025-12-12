# 🚂 SAPOR Railway Deployment Guide

## ✅ Your Setup
- **Docker Setup**: Multi-container (docker-compose)
- **Database**: Railway's built-in MongoDB + Redis
- **Services**: Backend + Frontend (separate)

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your repos

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: `Ken-1412/Agentic-Ai-Sopar`
4. Click "Deploy"

### Step 3: Add MongoDB Database

1. In your Railway project, click "+ New"
2. Select "Database"
3. Choose "Add MongoDB"
4. Wait for deployment (~30 seconds)
5. Railway auto-creates `DATABASE_URL` variable

### Step 4: Add Redis Database

1. Click "+ New" again
2. Select "Database"
3. Choose "Add Redis"
4. Railway auto-creates `REDIS_URL` variable

### Step 5: Deploy Backend

1. Click "+ New" → "GitHub Repo"
2. Select your repo again (for backend service)
3. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=${{MongoDB.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   REDIS_ENABLED=true
   LLM_DEPLOYMENT_MODE=online
   HF_MODEL=meta-llama/Llama-3.2-3B-Instruct
   JWT_SECRET=<generate-random-secret>
   ```

5. Click "Deploy"

### Step 6: Deploy Frontend

1. Click "+ New" → "GitHub Repo"
2. Select your repo (for frontend service)
3. Configure:
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` (or use static hosting)
   
4. Add Environment Variables:
   ```
   VITE_API_URL=${{backend.url}}/api
   ```

5. Click "Deploy"

### Step 7: Generate JWT Secret

```bash
# Run locally to generate
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Railway backend environment
JWT_SECRET=<generated-value>
```

### Step 8: Configure Custom Domain (Optional)

1. Click on Frontend service
2. Go to "Settings" → "Domains"
3. Click "Generate Domain" (gets .railway.app domain)
4. Or add custom domain

---

## 📋 Railway Environment Variables Checklist

### Backend Service
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=${{MongoDB.DATABASE_URL}}  # Auto-injected
REDIS_URL=${{Redis.REDIS_URL}}          # Auto-injected
REDIS_ENABLED=true
LLM_DEPLOYMENT_MODE=online
HF_MODEL=meta-llama/Llama-3.2-3B-Instruct
HF_API_KEY=<your-huggingface-key>      # Optional
JWT_SECRET=<32-char-random-string>
CORS_ORIGIN=${{frontend.url}}
```

### Frontend Service
```bash
VITE_API_URL=${{backend.url}}/api
```

---

## 🔄 Alternative: Use Railway CLI

### Quick CLI Deployment

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Link to your GitHub repo
railway link

# 5. Add MongoDB
railway add --database mongodb

# 6. Add Redis
railway add --database redis

# 7. Deploy backend
cd backend
railway up

# 8. Deploy frontend
cd ../frontend
railway up

# 9. View deployment
railway open
```

---

## ✅ Verify Deployment

### Test Backend
```bash
# Get backend URL from Railway dashboard
curl https://your-backend.railway.app/api/health
```

### Test Frontend
```bash
# Open frontend URL
open https://your-frontend.railway.app
```

### Test Database Connection
```bash
# Check Railway dashboard → MongoDB logs
# Should show "connected"
```

---

## 🚨 Common Issues

### Issue 1: Build Fails

**Error**: `npm install failed`

**Fix**:
```bash
# Add to backend settings:
# Build Command: npm ci --legacy-peer-deps
```

### Issue 2: Backend Can't Connect to MongoDB

**Error**: `ECONNREFUSED`

**Fix**: Railway auto-injects `DATABASE_URL`, use it:
```javascript
// In backend/server.js
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
```

### Issue 3: Frontend Can't Reach Backend

**Fix**: Update CORS in backend:
```javascript
// backend/server.js
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

Set in Railway:
```bash
CORS_ORIGIN=${{frontend.url}}
```

---

## 💰 Pricing

**Free Tier Includes:**
- ✅ $5/month usage credit
- ✅ MongoDB (shared)
- ✅ Redis (shared)  
- ✅ 2 services
- ✅ GitHub auto-deployments

**Good for:**
- Development
- Small projects
- Testing

**Upgrade if:**
- Need more resources
- Production traffic
- Dedicated databases

---

## 🎯 Quick Decision Matrix

| Feature | Railway | Vercel | VPS |
|---------|---------|--------|-----|
| Full Docker | ✅ | ❌ | ✅ |
| Built-in MongoDB | ✅ | ❌ (Atlas) | ✅ |
| Built-in Redis | ✅ | ❌ | ✅ |
| Auto-deploy | ✅ | ✅ | ❌ |
| Setup Time | 10 min | 30 min | 2 hours |
| Cost | $5-20/mo | $0-20/mo | $5-50/mo |
| Best For | SAPOR | Static sites | Full control |

**For SAPOR → Use Railway** ✅

---

## 📚 Next Steps After Deployment

1. [ ] Test all API endpoints
2. [ ] Upload Kestra workflows
3. [ ] Seed sample data
4. [ ] Test Recipe Health Scanner
5. [ ] Test AI Agent workflows
6. [ ] Set up monitoring
7. [ ] Configure backups
8. [ ] Add custom domain

---

## 🔗 Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)
- [SAPOR GitHub](https://github.com/Ken-1412/Agentic-Ai-Sopar)

---

**Ready to deploy?** Follow Step 1! 🚀
