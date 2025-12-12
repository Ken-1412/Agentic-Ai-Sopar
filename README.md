# 🌱 MealWise - Smart Sustainable Meal Planning

A full-stack React + Express.js meal planning application with deep sponsor tool integration (Cline, Kestra, Oumi, Vercel, CodeRabbit).

## 🚀 Features

- **3 Viewing Modes**: Budget, Carbon Footprint, and Mood-based recommendations
- **Q&A Assistant**: Natural language Q&A powered by Elasticsearch and OpenAI GPT-4
- **Cline Integration**: Auto-generate complete weekly meal plans using AI automation
- **Oumi Learning**: Thompson Sampling for personalized meal recommendations that improve over time
- **Kestra Orchestration**: Multi-step workflow orchestration for complex meal planning
- **Interactive Rating System**: Rate meals with 5-star system to improve recommendations
- **Learning Visualization**: Real-time chart showing learning progress and accuracy
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for full deployment)
- Python 3.8+ (for Oumi integration, optional)
- OpenAI API key (for Q&A service, optional)
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mealwise
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (defaults work for local development).

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Q&A Service Setup (Optional)

**Terminal 3 - Q&A Service:**
```bash
cd qa-service
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm install
npm run dev
```

The Q&A service will run on `http://localhost:3002`

**Index meal data:**
```bash
npm run index-data
```

Or use Docker:
```bash
docker-compose -f docker-compose-full.yml up -d
```

This starts all services including Elasticsearch and Q&A service.

## 🎯 Usage

1. **Select a Mode**: Choose between Budget, Carbon, or Mood mode
2. **Set Budget**: Enter your budget in dollars
3. **Get Recommendations**: Click "Get Recommendations" to see meals
4. **Rate Meals**: Click stars (1-5) to rate meals and improve recommendations
5. **Auto-Generate**: Use "Auto-Generate with Cline" for a complete weekly meal plan
6. **Orchestrate**: Use "Get Orchestrated Recommendations" for Kestra-powered planning
7. **View Learning**: Click "Show Learning Stats" to see improvement over time

## 🔧 API Endpoints

### Backend API (http://localhost:3001)

- `GET /api/health` - Health check
- `POST /api/meals` - Get meal recommendations
  ```json
  {
    "mode": "budget" | "carbon" | "mood",
    "budget": 100,
    "limit": 10
  }
  ```
- `POST /api/feedback` - Submit meal rating
  ```json
  {
    "mealId": 1,
    "rating": 4,
    "mealFeatures": { "name": "...", "cost": 8.50, "carbon": 2.1 }
  }
  ```
- `POST /api/auto-generate` - Generate meal plan with Cline
  ```json
  {
    "budget": 100,
    "familySize": 2,
    "preferences": "vegetarian, low-carb"
  }
  ```
- `POST /api/oumi` - Oumi learning actions
  ```json
  {
    "action": "feedback" | "recommend" | "stats",
    "mealId": 1,
    "rating": 4
  }
  ```
- `POST /api/orchestrate` - Kestra orchestration
  ```json
  {
    "userProfile": {
      "budget": 100,
      "carbon_limit": 10,
      "mood": "budget",
      "dietary_preferences": "vegetarian"
    }
  }
  ```

### Q&A Service API (http://localhost:3002)

- `GET /api/qa/health` - Service health check
- `POST /api/qa/ask` - Ask questions about meals
  ```json
  {
    "question": "What are vegetarian meals under $10?",
    "filters": {
      "dietary": ["Vegetarian"],
      "maxCost": 10
    }
  }
  ```
- `POST /api/qa/index` - Reindex meal data to Elasticsearch
- `GET /api/qa/suggestions?limit=5` - Get random meal suggestions
- `GET /api/qa/stats` - Get Elasticsearch index statistics
- `POST /api/recommend` - Get personalized recommendations
  ```json
  {
    "userProfile": {
      "budget": 100,
      "carbon_limit": 10,
      "mood": "budget",
      "dietary_preferences": "vegetarian"
    }
  }
  ```

## 🏗️ Project Structure

```
mealwise/
├── backend/
│   ├── api/
│   │   ├── meals.js          # Meal recommendations endpoint
│   │   ├── feedback.js       # Rating/feedback endpoint
│   │   ├── recommend.js      # Personalized recommendations
│   │   ├── auto_generate.js  # Cline integration
│   │   ├── oumi.js           # Oumi learning integration
│   │   └── orchestrate.js    # Kestra orchestration
│   ├── server.js             # Express server
│   ├── package.json
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── MealCard.jsx     # Meal card component
│   │   │   └── LearningChart.jsx # Learning visualization
│   │   ├── api.js            # API service layer
│   │   ├── App.jsx
│   │   └── styles/
│   │       └── App.css       # Complete styling
│   ├── package.json
│   └── vite.config.js
├── qa-service/              # Q&A microservice (NEW)
│   ├── src/
│   │   ├── config/          # Elasticsearch & OpenAI clients
│   │   ├── services/        # Search, indexing, AI generation
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Data models
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── .gitignore
├── docker-compose-full.yml  # Full Docker setup
├── vercel.json              # Vercel deployment config
└── README.md
```

## 🔌 Sponsor Tool Integrations

### Cline (Auto-Generation)
- Automatically generates complete weekly meal plans
- Falls back to mock data if Cline CLI is not installed
- Supports family size and dietary preferences

### Oumi (Learning)
- Thompson Sampling algorithm for meal selection
- Tracks user preferences and improves over time
- Real-time learning statistics and visualization

### Kestra (Orchestration)
- Multi-step workflow for complex meal planning
- Fetches meals, summarizes, and selects best options
- Falls back to mock workflow if Kestra is not running

## 🚢 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

The `vercel.json` file is already configured for serverless deployment.

### Environment Variables for Production

Set these in your Vercel dashboard:
- `KESTRA_URL` - Your Kestra instance URL
- `OUMI_MODEL` - Oumi model name
- `BACKEND_URL` - Backend API URL
- `FRONTEND_URL` - Frontend URL

## 🧪 Testing & Agentic Flows

### Local smoke test (backend)
```bash
cd backend
npm install
node smoke-test.js
```

### Kestra flows (agentic automation)
Flows live in `flows/`:
- `dev-cycle.yaml` — lint/test frontend & backend, gate deploy
- `smoke-tests.yaml` — hits `/api/health`, `/api/meals`, `/api/feedback`
- `model-train.yaml` — runs Oumi training stub and enforces target accuracy

Run via Kestra UI/CLI (examples):
```bash
kestra flow trigger --namespace sapor --id smoke_tests
kestra flow trigger --namespace sapor --id dev_cycle
kestra flow trigger --namespace sapor --id model_train --inputs target_accuracy=0.75
```

### Oumi training stub
Located at `ml_models/oumi_train_stub.py`. It simulates training, writes `ml_models/metrics.json`, and fails if accuracy < `--min-accuracy`. Replace the stub with real Oumi commands when ready.

### Backend API checks (curl)
```bash
# Health check
curl http://localhost:3001/api/health

# Get meals
curl -X POST http://localhost:3001/api/meals \
  -H "Content-Type: application/json" \
  -d '{"mode": "budget", "budget": 50, "limit": 5}'

# Submit feedback
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"mealId": 1, "rating": 4}'

# One-liner smoke (bash + curl)
bash -lc "curl -fsS http://localhost:3001/api/health && \
curl -fsS -X POST http://localhost:3001/api/meals -H 'Content-Type: application/json' -d '{\"mode\":\"budget\",\"budget\":50,\"limit\":3}' && \
curl -fsS -X POST http://localhost:3001/api/feedback -H 'Content-Type: application/json' -d '{\"mealId\":1,\"rating\":4}'"
```

## 🐛 Troubleshooting

### Frontend not connecting to backend
1. Check if backend is running on `http://localhost:3001`
2. Check browser console for CORS errors
3. Verify API calls in Network tab (F12)

### Cline/Oumi/Kestra not working
- These tools are optional and have fallback implementations
- Check console logs for warnings
- Mock data will be used if tools are unavailable

### Port conflicts
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

## 📝 Development Notes

- **No Browser Storage**: Uses state/variables only (no localStorage/sessionStorage)
- **Single-file Components**: Components are self-contained
- **Serverless-Compatible**: Backend code works with Vercel serverless functions
- **Error Handling**: All endpoints include comprehensive error handling
- **TypeScript-Ready**: Code structure supports TypeScript migration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of AssembleHack25 MealWise challenge.

## 🙏 Acknowledgments

- **Cline** - AI automation
- **Kestra** - Workflow orchestration
- **Oumi** - Learning and personalization
- **Vercel** - Deployment platform
- **CodeRabbit** - Code review automation

---

Built with ❤️ for AssembleHack25




#   A g e n t i c - A I - S A P O R  
 