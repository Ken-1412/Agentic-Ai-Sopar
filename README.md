# 🤖 SAPOR - Self-Analyzing AI-Powered Orchestrator for Recipes

[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI%20Reviewed-brightgreen)](https://coderabbit.ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **World's First** self-analyzing meal recommendation system that applies software engineering "code smell" patterns to recipes and analyzes its own codebase for continuous improvement!

## 🌟 Unique Features

### 🤖 AI-Powered Intelligence
- **Dual AI Support**: Ollama (local/privacy) + HuggingFace (cloud/scale)
- **Smart Caching**: Redis-backed for 70% faster responses
- **Automatic Fallbacks**: Never fails, always has an answer
- **Template-Based Safety**: Graceful degradation when AI is unavailable

### 🍽️ Recipe Intelligence (World-First Innovation)
- **10+ "Recipe Smells"**: High sodium, trans fats, carbon footprint, cost, etc.
- **Severity Scoring**: Clean 🟢 / Spooky 🟡 / Haunted 🟠 / Cursed 🔴
- **Health Score 0-100**: Quantified nutritional analysis
- **Healthier Alternatives**: AI-generated substitutions
- **Migration Plans**: 3-phase improvement roadmaps

### 🔍 Self-Analysis (Meta!)
- **Codebase Scanner**: Analyzes its own code quality
- **10+ Code Smells**: var usage, callback hell, long functions, etc.
- **Technical Debt**: Quantified in hours and cost ($)
- **Improvement Proposals**: Actionable refactoring suggestions
- **Continuous Improvement**: Gets better over time

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- MongoDB (or Docker)
- Git

### Installation

```bash
# Clone the  repository
git clone https://github.com/Ken-1412/Agentic-Ai-Sopar.git
cd Agentic-Ai-Sopar

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name sapor-mongodb mongo

# Configure environment
cd backend
echo "MONGODB_URI=mongodb://localhost:27017/sapor" > .env
echo "LLM_DEPLOYMENT_MODE=online" >> .env

# Start development servers
npm run dev  # Backend (port 3001)
cd ../frontend && npm run dev  # Frontend (port 5173)

# Open browser
open http://localhost:5173
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│           SAPOR Frontend (React)                │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Dashboard │  │ MealCard + │  │  Health   │  │
│  │           │  │   Health   │  │  Scanner  │  │
│  └───────────┘  └────────────┘  └───────────┘  │
└───────────────────┬─────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────┐
│         Express Backend (Node.js)               │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│  │   LLM    │  │  Recipe   │  │  Codebase   │  │
│  │ Service  │  │ Analyzer  │  │   Scanner   │  │
│  └──────────┘  └───────────┘  └─────────────┘  │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
   ┌───▼───┐  ┌───────▼────────┐  ┌─▼────┐
   │  LLM  │  │    Recipe DB   │  │ Code │
   │Ollama │  │   (MongoDB)    │  │ AST  │
   │  HF   │  └────────────────┘  │Parser│
   └───────┘                      └──────┘
```

## 🎯 Core Components

### 1. LLM Service (`backend/services/llm/`)
Universal AI service with intelligent routing:
- **Ollama Client**: Local, privacy-focused AI
- **HuggingFace Client**: Cloud, scalable AI
- **Caching Layer**: Redis/Memory caching
- **Fallback System**: Template-based responses

### 2. Recipe Intelligence (`backend/services/analysis/`)
Applies code smell patterns to recipes:
- **Recipe Analyzer**: Detects nutritional anti-patterns
- **Severity Calculator**: Scores health impact
- **Alternative Generator**: Creates healthier versions
- **Migration Planner**: Phased improvement plans

### 3. Codebase Scanner (`backend/services/analysis/`)
Self-analysis capabilities:
- **Code Smell Detector**: AST-based pattern matching
- **Tech Debt Calculator**: Effort estimation
- **Complexity Analyzer**: Cyclomatic complexity
- **Improvement Generator**: Actionable suggestions

## 🤖 CodeRabbit Integration

We use **CodeRabbit AI** for automated code reviews!

### How It Works

1. **Submit PR** → CodeRabbit automatically reviews
2. **Get Feedback** → AI identifies issues, suggests improvements
3. **Iterate** → Make changes, CodeRabbit re-reviews
4. **Approve** → CodeRabbit approval required for merge

### CodeRabbit Checks

✅ Code quality & best practices  
✅ Security vulnerabilities  
✅ Performance optimizations  
✅ Documentation completeness  
✅ Test coverage  
✅ AI service patterns  

**Configuration**: See [`.coderabbit.yaml`](.coderabbit.yaml)

## 📚 API Endpoints

### LLM Service
```
POST /api/llm/analyze-recipe       # AI recipe analysis
POST /api/llm/generate-meal-plan   # Generate meal plans
POST /api/llm/suggest-substitution # Ingredient substitutions
GET  /api/llm/health               # Service health check
GET  /api/llm/stats                # Usage statistics
```

### Recipe Intelligence
```
POST /api/recipes/analyze               # Analyze recipe health
POST /api/recipes/healthier-alternative # Generate alternative
POST /api/recipes/compare               # Compare recipes
POST /api/recipes/batch-analyze         # Batch analysis
POST /api/recipes/find-healthiest       # Find top recipes
```

### Codebase Analysis
```
POST /api/codebase/scan                # Scan codebase
POST /api/codebase/cursed-files        # Find worst files
POST /api/codebase/improvement-proposal # Get suggestions
POST /api/codebase/analyze-file        # Single file analysis
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📖 Documentation

- [Complete Integration Guide](docs/COMPLETE_INTEGRATION_GUIDE.md)
- [Quick Start Guide](docs/QUICK_START.md)
- [LLM Service Documentation](docs/LLM_SERVICE_README.md)
- [Recipe Intelligence](docs/phase2_complete.md)
- [Codebase Analysis](docs/phase3_backend_complete.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:

- Development setup
- Coding standards
- PR process
- CodeRabbit guidelines
- AI service best practices

**Note**: All PRs are automatically reviewed by CodeRabbit AI before human review.

## 📊 Project Stats

- **Languages**: JavaScript, React, Python
- **Total Lines**: ~15,000+ LOC
- **AI Code**: ~4,650 LOC (Phases 1-3)
- **API Endpoints**: 18
- **Components**: 20+
- **Services**: 9 (Docker Compose)

## 🎓 Tech Stack

**Frontend**:
- React 18
- Vite
- Zustand (State)
- CSS3 (Glassmorphism)

**Backend**:
- Node.js + Express
- MongoDB + Mongoose
- Redis (Caching)
- Acorn (AST Parsing)

**AI/ML**:
- Ollama (Local AI)
- HuggingFace (Cloud AI)
- Custom Prompt Templates
- Caching + Fallbacks

**DevOps**:
- Docker + Docker Compose
- GitHub Actions
- CodeRabbit AI
- ESLint + Prettier

## 🔐 Security

- Environment variables for secrets
- No hardcoded API keys
- Input validation
- Rate limiting
- CORS configured
- Helmet.js security headers

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Authors

- **Ken-1412** - *Initial work* - [GitHub](https://github.com/Ken-1412)

## 🙏 Acknowledgments

- **CodeRabbit** - AI-powered code reviews
- **Ollama** - Local AI inference
- **HuggingFace** - Cloud AI models
- **Haunted Refactorium** - Code smell inspiration (original project by others)

## 📞 Support

- 🐛 [Report Bug](https://github.com/Ken-1412/Agentic-Ai-Sopar/issues)
- ✨ [Request Feature](https://github.com/Ken-1412/Agentic-Ai-Sopar/issues)
- 💬 [Discussions](https://github.com/Ken-1412/Agentic-Ai-Sopar/discussions)

## 🌟 Star History

If you find this project helpful, please consider giving it a ⭐!

---

**Built with ❤️ and 🤖 AI** | **SAPOR** - Making nutrition intelligent, one recipe at a time!