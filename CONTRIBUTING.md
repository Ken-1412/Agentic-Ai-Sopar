# Contributing to SAPOR

Thank you for your interest in contributing to SAPOR (Self-Analyzing AI-Powered Recipe Orchestrator)! 🎉

## 🤖 CodeRabbit AI Reviews

We use **CodeRabbit** for automated AI-powered code reviews. Every PR will be automatically reviewed by CodeRabbit, which will:
- ✅ Check code quality and best practices
- 🔒 Identify security vulnerabilities
- ⚡ Suggest performance improvements
- 📚 Verify documentation completeness
- 🧪 Recommend test coverage improvements
- 🤖 Ensure AI service patterns are followed

### Working with CodeRabbit

1. **Submit your PR** - CodeRabbit will automatically review it
2. **Review feedback** - Check CodeRabbit's comments and suggestions
3. **Make changes** - Address the feedback in new commits
4. **Iterate** - CodeRabbit will re-review after each push
5. **Get approval** - Once CodeRabbit approves, request human review

**Pro Tips:**
- Respond to CodeRabbit comments with `@coderabbitai` to ask questions
- Use `@coderabbitai ignore` to dismiss false positives
- CodeRabbit learns from accepted suggestions

## 📋 Contribution Process

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/Agentic-Ai-Sopar.git
cd Agentic-Ai-Sopar
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions
- `ai/` - AI/LLM enhancements

### 3. Set Up Development Environment

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../qa-service && npm install

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name sapor-mongodb mongo

# Start development servers
cd backend && npm run dev
cd frontend && npm run dev
```

### 4. Make Your Changes

Follow our coding standards:

#### JavaScript/React
- Use ES6+ syntax
- Functional components with hooks
- PropTypes for type checking
- Meaningful variable names
- Comments for complex logic

#### AI Services
- Always implement caching
- Include fallback mechanisms
- Add error handling
- Document prompt templates
- Test with different AI providers

#### Example: Good AI Service Code
```javascript
async analyzeRecipe(recipe) {
  // Check cache first (REQUIRED)
  const cacheKey = this.createCacheKey('recipe', recipe.id);
  const cached = await this.getCached(cacheKey);
  if (cached) return cached;

  try {
    // Primary AI call
    const result = await this.llmService.generate(prompt);
    
    // Cache the result (REQUIRED)
    await this.setCached(cacheKey, result, TTL);
    
    return result;
  } catch (error) {
    // Fallback (REQUIRED)
    return this.templates.fallback(recipe);
  }
}
```

### 5. Write Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

**Test Coverage Requirements:**
- Unit tests: >80% coverage
- All AI services must have tests
- Critical paths must be tested

### 6. Run Code Quality Checks

```bash
# Linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### 7. Commit Your Changes

Follow **Conventional Commits**:

```bash
git commit -m "feat(llm): add GPT-4 support to LLM service"
git commit -m "fix(recipe): resolve health score calculation bug"
git commit -m "docs(api): update recipe analysis API documentation"
git commit -m "refactor(cache): optimize Redis caching strategy"
git commit -m "test(analyzer): add tests for severity calculation"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Tests
- `perf` - Performance improvement
- `chore` - Maintenance
- `ai` - AI/LLM related changes

### 8. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub using our PR template.

## 🎯 What We Look For

### Code Quality
- ✅ Clean, readable code
- ✅ Proper error handling
- ✅ No console.logs in production
- ✅ Follows project patterns
- ✅ Well-documented

### AI Services
- ✅ Caching implemented
- ✅ Fallbacks in place
- ✅ Rate limiting respected
- ✅ Prompt templates documented
- ✅ Multiple providers supported

### Testing
- ✅ New features have tests
- ✅ Bug fixes include regression tests
- ✅ AI services mocked appropriately
- ✅ Edge cases covered

### Documentation
- ✅ README updated if needed
- ✅ API docs updated
- ✅ Code comments for complex logic
- ✅ Examples provided

## 🚫 What to Avoid

- ❌ Breaking changes without discussion
- ❌ Hardcoded API keys or secrets
- ❌ Ignoring CodeRabbit feedback
- ❌ Large PRs (>500 lines)
- ❌ Mixing multiple concerns in one PR
- ❌ No tests for new features
- ❌ console.log statements
- ❌ Commented-out code

## 📁 Project Structure

```
SAPOR/
├── backend/           # Express API server
│   ├── api/          # API routes
│   ├── config/       # Configuration
│   ├── models/       # Database models
│   ├── services/     # Business logic
│   │   ├── llm/      # LLM service (AI brain)
│   │   └── analysis/ # Code & recipe analysis
│   └── utils/        # Utilities
├── frontend/         # React application
│   ├── components/   # React components
│   │   └── recipes/  # Recipe components
│   ├── store/        # State management
│   └── styles/       # CSS styles
├── qa-service/       # Question answering
└── docs/             # Documentation
```

## 🤝 Code Review Process

1. **CodeRabbit Review** (Automatic)
   - Runs on every PR
   - Provides instant feedback
   - Checks code quality, security, performance

2. **Human Review** (After CodeRabbit approval)
   - Maintainers review design decisions
   - Verify functionality
   - Check overall architecture

3. **Merge**
   - All checks passing
   - CodeRabbit approved
   - 1+ human approval
   - No merge conflicts

## 🔧 Development Guidelines

### Environment Variables

Never commit `.env` files! Use `.env.example`:

```bash
# ✅ Good
MONGODB_URI=your_mongodb_uri_here

# ❌ Bad
MONGODB_URI=mongodb://admin:password123@localhost:27017
```

### API Keys

Store in environment variables:
```javascript
// ✅ Good
const apiKey = process.env.HF_API_KEY;

// ❌ Bad
const apiKey = "hf_abc123xyz...";
```

### Error Handling

Always handle errors gracefully:
```javascript
// ✅ Good
try {
  const result = await aiService.analyze(data);
  return result;
} catch (error) {
  console.error('Analysis failed:', error.message);
  return fallbackResult;
}

// ❌ Bad
const result = await aiService.analyze(data); // Can crash!
```

## 📞 Getting Help

- 💬 **GitHub Discussions** - Ask questions
- 🐛 **GitHub Issues** - Report bugs
- 📧 **Email** - For security issues
- 🤖 **CodeRabbit** - Code review help

## 🎓 Learning Resources

- [LLM Service Documentation](./docs/LLM_SERVICE_README.md)
- [Recipe Intelligence Guide](./docs/phase2_complete.md)
- [Codebase Analysis](./docs/phase3_backend_complete.md)
- [Complete Integration Guide](./docs/COMPLETE_INTEGRATION_GUIDE.md)

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to SAPOR!** 🚀

Your contributions help make AI-powered nutrition analysis accessible to everyone!
