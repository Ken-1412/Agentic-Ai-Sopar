# SETUP CHECKLIST FOR Q&A MICROSERVICE

## ✅ COMPLETED AUTOMATICALLY

The following has been set up for you:

1. ✅ **Q&A Service Code** - All files created in `qa-service/`
2. ✅ **Dependencies Installed** - npm packages installed (34 packages)
3. ✅ **Docker Configuration** - docker-compose-full.yml updated
4. ✅ **Documentation** - README files created
5. ✅ **Health Check Script** - Available at `qa-service/health-check.js`

---

## 🔧 REQUIRED MANUAL STEPS

### Step 1: Start Docker Desktop ⚠️ CRITICAL
**Status**: Docker is currently NOT running

**Action Required**:
1. Open **Docker Desktop** application
2. Wait for it to fully start (whale icon in system tray should be stable)
3. Verify with: `docker ps` (should not show error)

**Why**: Docker is required to run Elasticsearch, MongoDB, and all services in containers.

---

### Step 2: Get OpenAI API Key 🤖

**Status**: Optional but recommended for AI-powered responses

**Action Required**:
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

**Cost**: Pay-as-you-go pricing (~$0.01-0.03 per question with GPT-4)

**Skip if**: You want to use template-based responses instead of AI

---

### Step 3: Configure Environment Variables

**Action Required**:

```bash
# Navigate to qa-service directory
cd qa-service

# Create .env file from template
cp .env.example .env

# Edit .env file and replace:
OPENAI_API_KEY=sk-proj-your-OpenAI-API-KEY
# with your actual key from Step 2
```

**Using PowerShell**:
```powershell
cd qa-service
Copy-Item .env.example .env
# Then edit .env in your text editor
```

**File to edit**: `d:\project\Project Agent\qa-service\.env`

---

### Step 4: Start All Services with Docker

**Action Required**:
```bash
# From project root
docker-compose -f docker-compose-full.yml up -d
```

**What this does**:
- Starts MongoDB (port 27017)
- Starts Elasticsearch (port 9200) 
- Starts Backend (port 3001)
- Starts Frontend (port 8000)
- Starts Q&A Service (port 3002)
- Starts Kestra (port 8080)
- Starts PostgreSQL (port 5432)

**Expected time**: 2-3 minutes for first start (downloads images)

---

### Step 5: Wait for Services to Initialize

**Action Required**:
```bash
# Wait ~60 seconds, then check status
docker-compose -f docker-compose-full.yml ps
```

**Expected output**: All services should show "Up" status

---

### Step 6: Seed Database (if needed)

**Check if meals exist**:
```bash
curl http://localhost:3001/api/meals
```

**If empty, seed the database**:
```bash
cd backend
node seeder.js
```

---

### Step 7: Index Meals into Elasticsearch

**Action Required**:
```bash
curl -X POST http://localhost:3002/api/qa/index
```

**Expected response**:
```json
{
  "success": true,
  "message": "Meals successfully indexed",
  "indexed": 150
}
```

**Alternative (using npm script)**:
```bash
cd qa-service
npm run index-data
```

---

### Step 8: Test Q&A Service

**Health Check**:
```bash
curl http://localhost:3002/api/qa/health
```

**Ask a Question**:
```bash
curl -X POST http://localhost:3002/api/qa/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\": \"What are vegetarian meals under $10?\"}"
```

**Note**: PowerShell uses `^` for line continuation. In bash, use `\`

---

## 🎯 QUICK START (All Steps Combined)

Once Docker Desktop is running:

```powershell
# 1. Configure environment
cd qa-service
Copy-Item .env.example .env
# Edit .env and add OPENAI_API_KEY

# 2. Start all services
cd ..
docker-compose -f docker-compose-full.yml up -d

# 3. Wait 60 seconds
Start-Sleep -Seconds 60

# 4. Index meals
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/index

# 5. Test Q&A
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"What are vegetarian meals under $10?"}'
```

---

## 🚨 TROUBLESHOOTING

### Docker not starting
- Restart Docker Desktop
- Check Docker settings → Resources (need at least 4GB RAM)
- Try: `wsl --update` (if using WSL2 backend)

### Elasticsearch crashes
- Increase Docker memory limit to 8GB
- Check: Docker Desktop → Settings → Resources → Memory

### Service not connecting
- Check logs: `docker-compose -f docker-compose-full.yml logs [service-name]`
- Restart specific service: `docker-compose -f docker-compose-full.yml restart qa-service`

### Port already in use
- Check what's using the port: `netstat -ano | findstr :3002`
- Stop the process or change port in docker-compose-full.yml

---

## 📍 SERVICE URLS

Once everything is running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:8000 | Main UI |
| Backend | http://localhost:3001 | Meal API |
| Q&A Service | http://localhost:3002 | Question answering |
| Kestra | http://localhost:8080 | Workflow orchestration |
| Elasticsearch | http://localhost:9200 | Search engine |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 🎓 EXAMPLE QUESTIONS TO TRY

Once indexed, try these questions:

1. "What are low-carb vegetarian meals under $10?"
2. "Show me Italian meals with high protein"
3. "What's the most sustainable meal option?"
4. "Do you have any vegan meals?"
5. "What meals are under 500 calories?"
6. "Which meals have the lowest carbon footprint?"
7. "Show me Indian cuisine options"
8. "What can I eat for $8?"

---

## ✅ VERIFICATION CHECKLIST

- [ ] Docker Desktop is running
- [ ] OpenAI API key obtained (optional)
- [ ] .env file created in qa-service/
- [ ] All services started with docker-compose
- [ ] Services showing "Up" status
- [ ] Database seeded with meals
- [ ] Meals indexed into Elasticsearch
- [ ] Health check returns 200 OK
- [ ] Q&A endpoint returns answers
- [ ] Frontend accessible at http://localhost:8000

---

**Need Help?** Check the detailed docs:
- Q&A Service: `qa-service/README.md`
- Main Project: `README.md`
- Walkthrough: See artifacts in conversation
