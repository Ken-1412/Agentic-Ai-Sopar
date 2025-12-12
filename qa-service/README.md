# Q&A Service - SAPOR

RAG-based (Retrieval Augmented Generation) Q&A microservice for SAPOR meal recommendations.

## Features

- 🔍 **Semantic Search** - Uses Elasticsearch for intelligent meal search
- 🤖 **AI Responses** - GPT-4 powered natural language answers
- 🎯 **Smart Filters** - Filter by dietary preferences, cuisine, cost, carbon, nutrition
- 📊 **Real-time Indexing** - Automatic sync from MongoDB to Elasticsearch
- 🐳 **Docker Ready** - Fully containerized for easy deployment

## Quick Start

### Development

1. **Copy environment variables:**
   ```bash
   cd qa-service
   cp .env.example .env
   ```

2. **Add your OpenAI API key** to `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Ensure MongoDB and Elasticsearch are running:**
   ```bash
   # MongoDB on port 27017
   # Elasticsearch on port 9200
   ```

5. **Start the service:**
   ```bash
   npm run dev
   ```

6. **Index meal data:**
   ```bash
   npm run index-data
   ```
   Or via API:
   ```bash
   curl -X POST http://localhost:3002/api/qa/index
   ```

### Docker Deployment

```bash
# From project root
docker-compose -f docker-compose-full.yml up -d
```

## API Endpoints

### POST `/api/qa/ask`
Ask a question about meals

**Request:**
```json
{
  "question": "What are some vegetarian meals under $10?",
  "filters": {
    "dietary": ["Vegetarian"],
    "maxCost": 10,
    "maxCarbon": 5,
    "minProtein": 15
  }
}
```

**Response:**
```json
{
  "success": true,
  "question": "What are some vegetarian meals under $10?",
  "answer": "Here are some great vegetarian options under $10...",
  "sources": [
    {
      "id": "meal123",
      "name": "Veggie Stir Fry",
      "cost": 8.50,
      "carbon": 2.1,
      "protein": 18,
      ...
    }
  ],
  "meta": {
    "resultsCount": 3,
    "searchTime": "45ms"
  }
}
```

### POST `/api/qa/index`
Trigger reindexing of meal data

**Response:**
```json
{
  "success": true,
  "message": "Meals successfully indexed",
  "indexed": 150
}
```

### GET `/api/qa/suggestions?limit=5`
Get random meal suggestions

**Response:**
```json
{
  "success": true,
  "suggestions": [...meals],
  "count": 5
}
```

### GET `/api/qa/stats`
Get index statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "index": "meal_questions",
    "documentCount": 150,
    "sizeInBytes": 1048576,
    "health": "healthy"
  }
}
```

### GET `/api/qa/health`
Health check endpoint

**Response:**
```json
{
  "success": true,
  "service": "qa-service",
  "status": "healthy",
  "checks": {
    "mongodb": { "connected": true },
    "elasticsearch": { "connected": true, "status": "green" },
    "openai": { "configured": true }
  }
}
```

## Example Questions

Try asking:

- "What are low-carb vegetarian meals under $10?"
- "Show me Italian meals with high protein"
- "What's the most sustainable meal option?"
- "Do you have any vegan meals?"
- "What meals are under 500 calories?"
- "Which meals have the lowest carbon footprint?"

## Filter Options

### `filters.dietary`
Array of dietary preferences:
- `Vegetarian`
- `Vegan`
- `Gluten-Free`
- `Dairy-Free`

### `filters.cuisine`
Cuisine type:
- `Italian`, `Mexican`, `Indian`, `Chinese`, `Japanese`
- `American`, `Mediterranean`, `Thai`, `French`, `Greek`
- `Spanish`, `Korean`, `Middle Eastern`, `Other`

### `filters.maxCost`
Maximum cost in dollars (number)

### `filters.maxCarbon`
Maximum carbon footprint in kg CO2 (number)

### `filters.minProtein`
Minimum protein in grams (number)

### `filters.minCalories / filters.maxCalories`
Calorie range (numbers)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3002` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sapor` |
| `ELASTICSEARCH_URL` | Elasticsearch URL | `http://localhost:9200` |
| `OPENAI_API_KEY` | OpenAI API key | *required* |
| `MAX_SEARCH_RESULTS` | Max results per query | `5` |
| `OPENAI_MODEL` | OpenAI model | `gpt-4o` |
| `OPENAI_MAX_TOKENS` | Max response tokens | `500` |

## Architecture

```
qa-service/
├── src/
│   ├── config/           # Client configurations
│   │   ├── elasticsearch.js
│   │   └── openai.js
│   ├── services/         # Business logic
│   │   ├── indexer.js    # MongoDB → Elasticsearch sync
│   │   ├── search.js     # Semantic search
│   │   └── generator.js  # AI response generation
│   ├── routes/           # API endpoints
│   │   └── qa.js
│   ├── models/           # Data models
│   │   └── Meal.js
│   ├── scripts/          # Utility scripts
│   │   └── index-meals.js
│   └── server.js         # Express server
├── Dockerfile
├── package.json
└── .env.example
```

## How It Works

1. **User asks a question** → POST to `/api/qa/ask`
2. **Elasticsearch search** → Multi-field semantic search across meal data
3. **Top results retrieved** → Most relevant meals based on query + filters
4. **Context creation** → Meal data formatted into structured prompt
5. **OpenAI generation** → GPT-4 generates natural language answer
6. **Response returned** → Answer + source meals sent to client

## Troubleshooting

### Elasticsearch not connected
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# Start Elasticsearch (Docker)
docker-compose -f docker-compose-full.yml up -d elasticsearch
```

### No search results
```bash
# Index meal data
curl -X POST http://localhost:3002/api/qa/index
```

### OpenAI responses not working
- Verify `OPENAI_API_KEY` is set correctly in `.env`
- Check API key validity at https://platform.openai.com/api-keys
- Review logs for error messages
- Service will fallback to template responses if OpenAI unavailable

### Memory issues with Elasticsearch
- Increase Docker memory limit (Settings → Resources)
- Reduce Elasticsearch heap size in docker-compose (`ES_JAVA_OPTS`)

## Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Index meals
npm run index-data

# Production mode
npm start
```

## License

Part of the SAPOR meal recommendation system.
