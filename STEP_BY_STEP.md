# Step-by-Step Guide: Q&A Microservice Setup

## Prerequisites Check
- ✅ Node.js installed (v22.19.0 detected)
- ✅ npm installed (v10.9.3 detected)
- ✅ Q&A service code created
- ✅ Dependencies installed (34 packages)
- ❌ Docker Desktop (needs to be started)

---

## STEP 1: Start Docker Desktop

**What to do:**
1. Click the **Docker Desktop** icon on your desktop or taskbar
2. Wait for Docker to start (30-60 seconds)
3. Look for the whale icon in system tray - it should be still/stable
4. Test it's running:
   ```powershell
   docker ps
   ```
   Should NOT show an error about "cannot find the file"

**Why:** All services (Elasticsearch, MongoDB, etc.) run in Docker containers.

---

## STEP 2: Get OpenAI API Key (Optional but Recommended)

**What to do:**
1. Open your web browser
2. Go to: **https://platform.openai.com/api-keys**
3. Sign in (create account if you don't have one)
4. Click **"+ Create new secret key"**
5. Give it a name (e.g., "SAPOR Q&A")
6. Click **"Create secret key"**
7. **Copy the key immediately** - you won't see it again!
8. Save it in a text file temporarily

**The key looks like:** `sk-proj-abc123xyz...`

**Cost:** About $0.01-0.03 per question

**Skip this?** Yes, if you want basic template responses instead of AI-powered ones.

---

## STEP 3: Create Environment File

**What to do:**

Open PowerShell and run:
```powershell
cd "d:\project\Project Agent\qa-service"
Copy-Item .env.example .env
notepad .env
```

In Notepad, you'll see:
```
OPENAI_API_KEY=sk-proj-your-OpenAI-API-KEY
```

**Replace** `sk-proj-your-OpenAI-API-KEY` with your actual key from Step 2.

If you skipped Step 2, just leave it as is.

**Save** the file (Ctrl+S) and **close** Notepad.

---

## STEP 4: Start All Services

**What to do:**

In PowerShell:
```powershell
cd "d:\project\Project Agent"
docker-compose -f docker-compose-full.yml up -d
```

**What happens:**
- Downloads Docker images (first time only - takes 5-10 minutes)
- Starts 7 services:
  - MongoDB
  - Elasticsearch
  - Backend
  - Frontend
  - Q&A Service
  - Kestra
  - PostgreSQL

**Wait for:** "Creating project-agent-..." messages to finish

---

## STEP 5: Wait for Services to Initialize

**What to do:**

Wait **90 seconds**, then check status:
```powershell
docker-compose -f docker-compose-full.yml ps
```

**Expected output:** All services should show "Up" or "Up (healthy)"

**If any show "Exit" or "Restarting":**
```powershell
docker-compose -f docker-compose-full.yml logs [service-name]
```

---

## STEP 6: Seed Database (if needed)

**Check if meals exist:**
```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

**If you need sample data:**
```powershell
cd backend
node seeder.js
```

This adds ~150 sample meals to the database.

---

## STEP 7: Index Meals into Elasticsearch

**What to do:**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/index
```

**Expected response:**
```json
{
  "success": true,
  "message": "Meals successfully indexed",
  "indexed": 150
}
```

**This step is CRITICAL** - without it, Q&A won't have any data to search!

---

## STEP 8: Test Q&A Service

**Health check:**
```powershell
Invoke-RestMethod http://localhost:3002/api/qa/health
```

Should show all services as connected.

**Ask a question:**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"What are vegetarian meals under $10?"}'
```

**You should see:**
- An `answer` field with natural language response
- A `sources` array with meal recommendations
- Search metadata

---

## STEP 9: Open Frontend (Optional)

**What to do:**

Open your web browser and go to:
```
http://localhost:8000
```

You should see the SAPOR meal recommendation interface!

**Other URLs:**
- Backend API: http://localhost:3001
- Q&A Service: http://localhost:3002
- Kestra Workflows: http://localhost:8080
- Elasticsearch: http://localhost:9200

---

## STEP 10: Try More Questions

**Example questions to test:**

```powershell
# Low-carb options
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"What are low-carb meals?"}'

# Italian cuisine
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"Show me Italian meals"}'

# Sustainable options
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"What are the most sustainable meals?"}'

# With filters
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/qa/ask `
  -ContentType "application/json" `
  -Body '{"question":"High protein meals","filters":{"dietary":["Vegetarian"],"maxCost":15}}'
```

---

## 🎉 You're Done!

Your Q&A microservice is now running and ready to answer questions about meals!

---

## 🛑 To Stop Everything

When you're done:
```powershell
cd "d:\project\Project Agent"
docker-compose -f docker-compose-full.yml down
```

To stop AND remove all data:
```powershell
docker-compose -f docker-compose-full.yml down -v
```

---

## 🆘 Troubleshooting

### "Error: Cannot connect to Docker"
→ Start Docker Desktop (Step 1)

### "Elasticsearch exited with code 137"
→ Docker needs more memory:
1. Open Docker Desktop
2. Settings → Resources → Memory
3. Increase to 8GB
4. Click "Apply & Restart"

### "Port 3002 is already in use"
→ Find what's using it:
```powershell
netstat -ano | findstr :3002
```
Kill that process or change the port in docker-compose-full.yml

### "No meals found"
→ Run seeder (Step 6) then index again (Step 7)

### Service keeps restarting
→ Check logs:
```powershell
docker-compose -f docker-compose-full.yml logs qa-service
```

---

## 📚 Next Steps

1. **Integrate with frontend** - Add Q&A UI component
2. **Try different questions** - Test the semantic search
3. **Monitor logs** - `docker-compose logs -f qa-service`
4. **Customize prompts** - Edit `qa-service/src/services/generator.js`
5. **Add more meals** - Modify and run seeder again

---

**Need more details?** See:
- `SETUP_CHECKLIST.md` - Detailed troubleshooting
- `qa-service/README.md` - API documentation
- Artifacts in conversation - Implementation plan & walkthrough
