# Kestra AI Agent Integration for SAPOR

## 🤖 Overview

SAPOR uses **Kestra's built-in AI Agent** (OpenAI ChatCompletion plugin) to intelligently summarize data from multiple systems and make autonomous decisions.

## 🎯 AI Agent Capabilities

### 1. Data Summarization
The AI Agent aggregates and analyzes data from:
- **MongoDB** - Meal data, user feedback, ratings
- **Recipe Analysis API** - Health scores, nutritional analysis
- **Codebase Scanner API** - Technical debt, code quality
- **Elasticsearch** - Search patterns, popular queries

### 2. Intelligent Decision Making
Based on summarized insights, the AI Agent automatically:
- **Prioritizes issues** (low, medium, high, critical)
- **Triggers actions** (alerts, scans, notifications)
- **Optimizes recipes** (improve, replace, remove, keep)
- **Updates database** (marks recipes, stores insights)
- **Generates reports** (visual dashboards, summaries)

## 📊 Workflows

### Workflow 1: Health Summary & Monitoring

**File:** `flows/sapor_ai_agent_health_summary.yaml`

**Purpose:** Daily health check of entire SAPOR system

**Data Sources:**
1. MongoDB meals (last 7 days)
2. User feedback
3. Recipe health analysis
4. Codebase health metrics

**AI Agent Tasks:**
```yaml
- Analyze aggregated data
- Identify trends and anomalies
- Calculate health scores
- Generate insights
- Make priority decisions
```

**Automated Decisions:**
- **Critical**: Send Slack alert + trigger emergency scan
- **High**: Schedule deep analysis every 6 hours
- **Medium**: Standard monitoring + logging
- **Low**: Routine reporting

**Outputs:**
- JSON insights stored in MongoDB
- Visual health dashboard (PNG)
- Automated notifications
- Scheduled follow-ups

---

### Workflow 2: Recipe Optimization Engine

**File:** `flows/sapor_ai_agent_recipe_optimizer.yaml`

**Purpose:** Autonomous recipe health optimization

**Data Sources:**
1. Unanalyzed recipes from MongoDB
2. Recipe health analysis API
3. User preferences (if available)

**AI Agent Tasks:**
```yaml
- Review all recipe analyses
- Identify unhealthy patterns
- Decide actions per recipe
- Prioritize improvements
- Generate recommendations
```

**Autonomous Decisions:**

| Decision | Action | Database Update |
|----------|--------|-----------------|
| **Keep** | Recipe is healthy | Mark as `healthCertified: true` |
| **Improve** | Generate healthier version | Store in `healthierVersion` field |
| **Replace** | Find better alternative | Mark `status: pending_replacement` |
| **Remove** | Archive unhealthy recipe | Set `archived: true` |

**Example AI Response:**
```json
{
  "overall_health_score": 72,
  "critical_recipes": [
    "Deep Fried Burger",
    "Sugar-Loaded Dessert"
  ],
  "decisions": [
    {
      "recipe": "Deep Fried Burger",
      "action": "replace",
      "reason": "Excessive saturated fat (cursed severity)",
      "priority": "critical",
      "improvements": [
        "Switch to air-fried",
        "Use turkey instead of beef",
        "Add vegetables"
      ]
    }
  ],
  "automated_actions": [
    "Archive Deep Fried Burger",
    "Create healthier turkey burger variant",
    "Update menu recommendations"
  ]
}
```

---

## 🚀 Setup Instructions

### 1. Configure Kestra Secrets

```bash
# In Kestra UI or via API
kestra secrets create MONGODB_URI "mongodb://localhost:27017/sapor"
kestra secrets create OPENAI_API_KEY "sk-..."
kestra secrets create SLACK_WEBHOOK_URL "https://hooks.slack.com/..."
```

### 2. Deploy Workflows

```bash
# Copy workflows to Kestra
cp flows/sapor_ai_agent_*.yaml /path/to/kestra/flows/

# Or via Kestra API
curl -X POST http://localhost:8080/api/v1/flows \
  -H "Content-Type: application/yaml" \
  --data-binary @flows/sapor_ai_agent_health_summary.yaml
```

### 3. Trigger Workflows

**Manual Execution:**
```bash
# Via Kestra UI
1. Navigate to Flows → sapor.ai
2. Select workflow
3. Click "Execute"

# Via API
curl -X POST http://localhost:8080/api/v1/executions/sapor.ai/sapor_ai_agent_health_summary
```

**Automatic Triggers:**
- **Daily at 9 AM**: Health summary runs automatically
- **Nightly at 2 AM**: Recipe optimizer runs
- **On New Recipe**: Triggers when unanalyzed recipe added
- **On Critical Feedback**: Triggers when rating ≤ 2

### 4. Monitor AI Agent

```bash
# View execution logs
curl http://localhost:8080/api/v1/executions/{execution_id}/logs

# Check AI insights in MongoDB
mongo sapor
db.ai_insights.find().sort({timestamp: -1}).limit(1)
```

---

## 📈 AI Agent Decision Flow

```
┌──────────────────────────────────────┐
│     Data Collection Phase            │
│  ┌────────┐  ┌──────┐  ┌──────────┐ │
│  │MongoDB │  │Recipe│  │ Codebase │ │
│  │  Data  │  │ API  │  │   API    │ │
│  └────┬───┘  └───┬──┘  └────┬─────┘ │
└───────┼──────────┼──────────┼────────┘
        │          │          │
        └──────────┴──────────┘
                   │
        ┌──────────▼─────────────┐
        │   AI Agent (GPT-4)     │
        │  • Analyze data        │
        │  • Find patterns       │
        │  • Generate insights   │
        │  • Calculate priority  │
        └──────────┬─────────────┘
                   │
        ┌──────────▼─────────────┐
        │   Decision Engine      │
        │  Switch on Priority    │
        └──────────┬─────────────┘
                   │
        ┌──────────▼─────────────┐
        │   Automated Actions    │
        │  • Alerts              │
        │  • Database updates    │
        │  • Trigger workflows   │
        │  • Generate reports    │
        └────────────────────────┘
```

---

## 🎯 Example Scenarios

### Scenario 1: Critical Health Alert

**Trigger:** Daily health check at 9 AM

**AI Agent Analysis:**
```
Input:
- 50 new meals added
- 45% marked as "cursed" or "haunted"
- Codebase health dropped to 45/100
- 20 critical user complaints

AI Decision: CRITICAL priority
```

**Automated Actions:**
1. Send Slack alert to dev team
2. Trigger emergency codebase scan
3. Mark unhealthy recipes for review
4. Generate detailed report
5. Schedule hourly monitoring

---

### Scenario 2: Recipe Auto-Optimization

**Trigger:** New recipe added to database

**AI Agent Analysis:**
```
Input:
- Recipe: "Classic Fried Chicken"
- Health Score: 35/100
- Severity: Haunted
- Issues: High sodium (2400mg), saturated fat (25g)

AI Decision: IMPROVE
```

**Automated Actions:**
1. Generate healthier alternative (air-fried version)
2. Store in `healthierVersion` field
3. Update recipe status
4. Add to improvement queue
5. Notify menu curator

---

## 💡 Advanced Features

### Custom AI Prompts

Modify the AI Agent's behavior by editing the system message:

```yaml
- role: system
  content: |
    You are SAPOR's AI. Focus on:
    - Nutritional balance
    - Cost-effectiveness
    - Sustainability (carbon footprint)
    - User preferences
    
    Be strict on health standards!
```

### Multi-Model Support

Switch AI models based on task:

```yaml
# Fast decisions
model: gpt-3.5-turbo

# Complex analysis
model: gpt-4-turbo-preview

# Cost-effective
model: gpt-3.5-turbo-16k
```

### Chain Multiple AI Agents

```yaml
- id: initial_analysis
  type: io.kestra.plugin.openai.ChatCompletion
  model: gpt-3.5-turbo

- id: deep_analysis
  type: io.kestra.plugin.openai.ChatCompletion
  model: gpt-4-turbo-preview
  messages:
    - role: user
      content: |
        Review this analysis: {{ outputs.initial_analysis.choices[0].message.content }}
        Provide deeper insights.
```

---

## 📊 Metrics & Monitoring

### Track AI Performance

```javascript
// Query AI insights
db.ai_insights.aggregate([
  {
    $group: {
      _id: "$priority",
      count: { $sum: 1 },
      avg_metrics: { $avg: "$metrics" }
    }
  }
])

// Execution success rate
db.optimization_reports.aggregate([
  {
    $group: {
      _id: "$execution_status",
      count: { $sum: 1 }
    }
  }
])
```

### AI Agent Statistics

- **Decisions Made**: Tracked in MongoDB
- **Accuracy**: Compare AI decisions with human review
- **Response Time**: Kestra execution metrics
- **Cost**: OpenAI API usage

---

## 🔒 Security

- **API Keys**: Stored in Kestra secrets
- **Database Access**: MongoDB authentication
- **Rate Limiting**: OpenAI API quotas
- **Audit Trail**: All decisions logged

---

## 🎓 Benefits

### For SAPOR
✅ **Autonomous optimization** - No manual intervention  
✅ **24/7 monitoring** - Always watching system health  
✅ **Data-driven decisions** - Based on real metrics  
✅ **Scalable** - Handles growing data automatically  

### For Users
✅ **Healthier meals** - Continuous improvement  
✅ **Better experience** - Issues caught proactively  
✅ **Personalization** - AI learns preferences  
✅ **Transparency** - Clear decision reasoning  

---

## 📚 Resources

- [Kestra AI Plugins](https://kestra.io/plugins/plugin-openai)
- [OpenAI ChatCompletion](https://platform.openai.com/docs/api-reference/chat)
- [MongoDB Plugin](https://kestra.io/plugins/plugin-mongodb)
- [SAPOR Workflows](./flows/)

---

**Powered by Kestra AI Agents** 🤖 | **Making SAPOR Smarter Every Day**
