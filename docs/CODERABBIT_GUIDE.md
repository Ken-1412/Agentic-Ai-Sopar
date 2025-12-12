# CodeRabbit Integration Guide

## 🤖 What is CodeRabbit?

CodeRabbit is an AI-powered code review tool that automatically reviews pull requests, identifies issues, suggests improvements, and learns from your codebase patterns.

## ✨ Features for SAPOR

### Automatic Reviews
- **Code Quality**: Identifies anti-patterns, code smells, and maintainability issues
- **Security**: Detects vulnerabilities, exposed secrets, and unsafe practices
- **Performance**: Suggests optimizations and efficiency improvements
- **Documentation**: Verifies JSDoc, README, and API docs
- **Testing**: Recommends test coverage improvements

### AI Service Patterns
CodeRabbit is configured to understand SAPOR's unique patterns:
- LLM service caching requirements
- Fallback mechanism validation
- Recipe analysis severity scoring
- React hooks and functional components
- API route documentation standards

### Interactive Review
- Ask questions: `@coderabbitai explain this change`
- Request changes: `@coderabbitai suggest improvements`
- Dismiss feedback: `@coderabbitai ignore`

## 🚀 Setup

### 1. Enable CodeRabbit on GitHub

1. Go to [CodeRabbit.ai](https://coderabbit.ai)
2. Sign in with GitHub
3. Install CodeRabbit app on your repository:
   - Visit https://github.com/apps/coderabbitai
   - Click "Install"
   - Select "Only select repositories"
   - Choose `Ken-1412/Agentic-Ai-Sopar`
   - Click "Install"

### 2. Configuration

The repository includes `.coderabbit.yaml` with:
- Custom rules for AI services
- Security checks enabled
- Performance monitoring
- Documentation requirements
- Testing standards

### 3. GitHub Actions

Two workflows are configured:

**`.github/workflows/coderabbit-review.yml`**
- Triggers on every PR
- Runs CodeRabbit review
- Posts comments automatically

**`.github/workflows/code-quality.yml`**
- Runs linting
- Executes tests
- Builds project
- Uploads coverage

## 📋 PR Review Process

### Step 1: Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### Step 2: Make Changes
```javascript
// ✅ Follow patterns
async analyzeRecipe(recipe) {
  // Cache check (REQUIRED)
  const cached = await this.cache.get(key);
  if (cached) return cached;
  
  try {
    const result = await this.ai.analyze(recipe);
    await this.cache.set(key, result);
    return result;
  } catch (error) {
    // Fallback (REQUIRED)
    return this.fallback(recipe);
  }
}
```

### Step 3: Commit
```bash
git commit -m "feat(recipe): add allergen detection to analyzer"
```

### Step 4: Push & Create PR
```bash
git push origin feature/your-feature
```

Create PR on GitHub using the template.

### Step 5: CodeRabbit Reviews

Within minutes, CodeRabbit will:
1. Analyze all changed files
2. Post detailed review comments
3. Suggest specific improvements
4. Request changes if critical issues found

**Example CodeRabbit Comment:**
```
🤖 CodeRabbit

Suggestion: Add caching to this AI service call

This function makes an AI call without caching, which could impact 
performance. Consider adding Redis caching similar to other services.

Example:
```javascript
const cacheKey = this.createCacheKey('allergen', recipe.id);
const cached = await this.getCached(cacheKey);
if (cached) return cached;
```

Severity: ⚠️ Warning
Category: Performance
```

### Step 6: Address Feedback

```bash
# Make changes
git add .
git commit -m "fix: add caching to allergen detection"
git push
```

CodeRabbit automatically re-reviews!

### Step 7: Get Approval

Once CodeRabbit approves ✅, request human review.

## 🎯 CodeRabbit Commands

Interact with CodeRabbit in PR comments:

### Ask Questions
```
@coderabbitai explain this function
@coderabbitai what's the security risk here?
@coderabbitai how does this impact performance?
```

### Request Changes
```
@coderabbitai suggest a better approach
@coderabbitai refactor this to reduce complexity
@coderabbitai add error handling
```

### Dismiss Feedback
```
@coderabbitai ignore - this is intentional for [reason]
```

### Re-review
```
@coderabbitai review this file again
```

## 📊 Review Statistics

CodeRabbit tracks:
- Issues found per PR
- Time to review
- Acceptance rate of suggestions
- Code quality trends
- Common patterns

View stats at: https://app.coderabbit.ai/dashboard

## 🔧 Custom Rules

### AI Service Rule
```yaml
- name: "AI Service Patterns"
  description: "Ensure LLM service calls use caching and fallbacks"
  pattern: "services/llm/**/*.js"
```

**Checks:**
- ✅ Caching implemented
- ✅ Fallback mechanism present
- ✅ Error handling included
- ✅ Rate limiting respected

### Recipe Analysis Rule
```yaml
- name: "Recipe Analysis Standards"
  description: "Recipe analyzers must include severity scoring"
  pattern: "services/analysis/**/*.js"
```

**Checks:**
- ✅ Severity calculation present
- ✅ Health score computed
- ✅ Issues array returned
- ✅ Recommendations included

### React Component Rule
```yaml
- name: "React Component Standards"
  description: "Components must use hooks and be functional"
  pattern: "frontend/src/components/**/*.jsx"
```

**Checks:**
- ✅ Functional components only
- ✅ Hooks used correctly
- ✅ PropTypes defined
- ✅ No class components

## 🎓 Learning from CodeRabbit

### Review Patterns
CodeRabbit learns from accepted suggestions and adapts reviews for future PRs.

### Feedback Loop
1. CodeRabbit suggests improvement
2. You accept and implement
3. CodeRabbit learns this is preferred
4. Future suggestions align with your style

### Team Standards
As the team accepts certain patterns, CodeRabbit reinforces those standards automatically.

## 🚀 Advanced Features

### Auto-Fix
Some issues can be auto-fixed:
```
@coderabbitai fix formatting issues
@coderabbitai auto-fix linting errors
```

### Comparison Mode
```
@coderabbitai compare with main branch
@coderabbitai show performance impact
```

### Security Scan
```
@coderabbitai security scan
@coderabbitai check for vulnerabilities
```

## 📈 Benefits

### For Developers
- ⚡ Instant feedback
- 🎓 Learn best practices
- 🔍 Catch issues early
- ⏰ Save review time

### For Project
-✅ Consistent code quality
- 🔒 Better security
- 📚 Improved documentation
- 🧪 Higher test coverage

## 🎯 Success Metrics

Track improvement over time:
- Reduced issues per PR
- Faster review cycles
- Higher code quality scores
- Better test coverage

## 💡 Tips

1. **Read all feedback** - Even dismissed suggestions teach patterns
2. **Ask questions** - CodeRabbit can explain its reasoning
3. **Iterate quickly** - Push changes and get instant re-review
4. **Learn patterns** - Notice recurring suggestions
5. **Share knowledge** - Discuss CodeRabbit feedback with team

## 🔗 Resources

- [CodeRabbit Documentation](https://docs.coderabbit.ai)
- [GitHub App](https://github.com/apps/coderabbitai)
- [Dashboard](https://app.coderabbit.ai)
- [Support](https://coderabbit.ai/support)

---

**Questions?** Ask `@coderabbitai` in any PR!
