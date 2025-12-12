# 🚀 Vercel + MongoDB Atlas Free Deployment

## 💰 100% Free Tier Setup

**No credit card required!** Both services offer generous free tiers perfect for SAPOR.

---

## Step 1: Set Up MongoDB Atlas (5 minutes)

### 1.1 Create Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with Google/GitHub (fastest)

### 1.2 Create FREE Cluster

1. Choose "Shared" (FREE tier)
2. Select **AWS** provider
3. Select closest region (e.g., US-East-1)
4. Cluster Name: `sapor-cluster`
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Create Database User

1. Click "Database Access" (left sidebar)
2. Click "+ ADD NEW DATABASE USER"
3. Authentication: Password
   - Username: `sapor_admin`
   - Password: Generate secure password (save it!)
4. User Privileges: "Atlas admin"
5. Click "Add User"

### 1.4 Whitelist IP Addresses

1. Click "Network Access" (left sidebar)
2. Click "+ ADD IP ADDRESS"
3. Click "ALLOW ACCESS FROM ANYWHERE"
   - IP: `0.0.0.0/0` (auto-fills)
4. Click "Confirm"

### 1.5 Get Connection String

1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copy connection string:
   ```
   mongodb+srv://sapor_admin:<password>@sapor-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before `?`:
   ```
   mongodb+srv://sapor_admin:YOUR_PASSWORD@sapor-cluster.xxxxx.mongodb.net/sapor?retryWrites=true&w=majority
   ```

**Save this connection string!** You'll need it for Vercel.

---

## Step 2: Configure Vercel Deployment (10 minutes)

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Update Frontend Build Script

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

### 2.3 Update API URL

Edit `frontend/src/api.js` or wherever you configure API:
```javascript
// Use relative URL for Vercel
const API_URL = process.env.VITE_API_URL || '/api';
```

---

## Step 3: Deploy to Vercel (5 minutes)

### Option A: Deploy from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Continue with GitHub
3. Click "New Project"
4. Import `Ken-1412/Agentic-Ai-Sopar`
5. Configure:

**Framework Preset:** Other

**Root Directory:** `.` (leave empty)

**Build Command:**
```bash
cd frontend && npm run build
```

**Output Directory:**
```bash
frontend/dist
```

**Install Command:**
```bash
npm install && cd backend && npm install && cd ../frontend && npm install
```

6. Click "Deploy" (will fail first time - that's OK!)

### Option B: Deploy with CLI

```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? <your-account>
# - Link to existing project? No
# - Project name? agentic-ai-sapor
# - Directory? ./ (root)
# - Build settings? Yes
# - Build command? cd frontend && npm run build
# - Output directory? frontend/dist
```

---

## Step 4: Add Environment Variables to Vercel

### 4.1 Via Vercel Dashboard

1. Go to your project in Vercel
2. Click "Settings"
3. Click "Environment Variables"
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://sapor_admin:PASSWORD@...` | Production |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | Production |
| `HF_API_KEY` | Your HuggingFace key (optional) | Production |
| `LLM_DEPLOYMENT_MODE` | `online` | Production |
| `HF_MODEL` | `meta-llama/Llama-3.2-3B-Instruct` | Production |
| `REDIS_ENABLED` | `false` | Production |
| `NODE_ENV` | `production` | Production |
| `VITE_API_URL` | `/api` | Production |

### 4.2 Via CLI

```bash
# Add MongoDB connection
vercel env add MONGODB_URI production
# Paste your Atlas connection string

# Add JWT secret
vercel env add JWT_SECRET production
# Paste generated secret

# Add other variables
vercel env add LLM_DEPLOYMENT_MODE production
# Type: online

vercel env add HF_MODEL production
# Type: meta-llama/Llama-3.2-3B-Instruct

vercel env add REDIS_ENABLED production
# Type: false

vercel env add NODE_ENV production
# Type: production
```

---

## Step 5: Redeploy with Environment Variables

### Via Dashboard
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

### Via CLI
```bash
vercel --prod
```

---

## Step 6: Verify Deployment

### Test Backend Health

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Test Frontend

1. Open: `https://your-app.vercel.app`
2. You should see SAPOR interface
3. Try browsing meals
4. Test "Analyze Health" feature

### Test MongoDB Connection

Check Vercel deployment logs:
1. Go to Vercel Dashboard
2. Click on deployment
3. Click "Functions" tab
4. Should see "MongoDB Connected" in logs

---

## 🎯 Free Tier Limits

### MongoDB Atlas FREE
- ✅ 512 MB Storage
- ✅ Shared RAM
- ✅ Enough for 1000s of recipes
- ✅ No credit card needed
- ✅ No time limit

### Vercel FREE
- ✅ 100 GB Bandwidth/month
- ✅ 100 deployments/day
- ✅ Serverless Functions
- ✅ Automatic HTTPS
- ✅ 6000 build minutes/month
- ✅ No credit card needed

**Perfect for SAPOR!** Should handle 1000s of users.

---

## 🚨 Troubleshooting

### Issue 1: Build Fails

**Error:** `Command "cd frontend && npm run build" failed`

**Fix:**
```bash
# Test build locally first
cd frontend
npm run build

# If successful, check vite.config.js:
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

### Issue 2: API Routes Not Working

**Fix:** Check `vercel.json`:
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" }
  ]
}
```

### Issue 3: MongoDB Connection Timeout

**Error:** `MongoTimeoutError`

**Fix:** Check Network Access in Atlas:
1. Go to Atlas → Network Access
2. Verify `0.0.0.0/0` is whitelisted
3. Wait 2 minutes for propagation

### Issue 4: Functions Timeout

**Error:** `FUNCTION_INVOCATION_TIMEOUT`

**Fix:** Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

### Issue 5: Environment Variables Not Loading

**Fix:**
```bash
# Verify variables are set
vercel env ls

# Pull to local for testing
vercel env pull .env.local

# Check in function logs
console.log('Env check:', {
  hasMongoUri: !!process.env.MONGODB_URI,
  hasJwt: !!process.env.JWT_SECRET
});
```

---

## 🔒 Security Best Practices

### 1. Rotate JWT Secret

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update in Vercel
vercel env rm JWT_SECRET production
vercel env add JWT_SECRET production
```

### 2. MongoDB Connection Security

- ✅ Use strong password
- ✅ Enable IP whitelisting (specific IPs in production)
- ✅ Use read-only users for analytics
- ✅ Enable MongoDB Atlas monitoring

### 3. API Rate Limiting

Add to backend:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring

### Vercel Analytics

1. Go to project → Analytics (tab)
2. View:
   - Web Vitals
   - Traffic
   - Function invocations
   - Errors

### MongoDB Atlas Metrics

1. Go to Atlas → Project → Metrics
2. Monitor:
   - Connections
   - Operations
   - Storage
   - Network

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

1. Vercel automatically watches your `main` branch
2. Every push triggers new deployment
3. Preview deployments for PRs

### Manual Deployment

```bash
# Deploy specific branch
vercel --prod --branch feature-branch

# Deploy with specific commit
vercel --prod
```

---

## 🎓 What Works on Free Tier

✅ **Full SAPOR Features:**
- Recipe health analysis
- LLM-powered insights
- Meal recommendations
- User feedback
- Codebase analysis

✅ **Performance:**
- Fast serverless functions
- Global CDN for frontend
- Response time < 1s

✅ **Scalability:**
- Auto-scales with traffic
- No server management
- Handles traffic spikes

❌ **Limitations:**
- No Redis caching (upgrade for this)
- No long-running processes
- Function timeout: 10s (free) / 60s (pro)
- No Kestra workflows (needs separate hosting)

---

## 💡 Cost Optimization Tips

1. **Optimize Functions**
   - Keep cold starts low
   - Cache MongoDB connections
   - Use efficient queries

2. **Minimize Build Time**
   - Use build cache
   - Split large dependencies

3. **Optimize Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization

---

## 🚀 Ready to Deploy?

```bash
# Quick deploy
vercel --prod

# Then visit
https://your-app.vercel.app
```

**That's it!** SAPOR is now live on Vercel + MongoDB Atlas, 100% free! 🎉

---

## 📞 Need Help?

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- MongoDB Forums: [mongodb.com/community/forums](https://www.mongodb.com/community/forums)
- GitHub Issues: [Your Repo Issues](https://github.com/Ken-1412/Agentic-Ai-Sopar/issues)
