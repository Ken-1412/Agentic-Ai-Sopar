// Prompt Templates - Structured prompts for consistent AI responses
// Based on Haunted Refactorium's prompt engineering patterns

const promptTemplates = {
    /**
     * Recipe Health Analysis Prompt
     * Analyzes recipes for health, sustainability, and cost issues
     */
    recipeAnalysis: (recipe) => {
        return `You are a nutritionist and sustainability expert analyzing a recipe.

RECIPE DATA:
Name: ${recipe.name}
Ingredients: ${recipe.ingredients ? recipe.ingredients.join(', ') : 'N/A'}
Nutrition (per serving):
  - Calories: ${recipe.calories || 'N/A'}
  - Protein: ${recipe.protein || 'N/A'}g
  - Carbs: ${recipe.carbs || 'N/A'}g
  - Fat: ${recipe.fat || 'N/A'}g
  - Sodium: ${recipe.sodium || 'N/A'}mg
  - Sugar: ${recipe.sugar || 'N/A'}g
Carbon Footprint: ${recipe.carbonFootprint || 'N/A'} kg CO2e
Cost: $${recipe.cost || 'N/A'}
Cook Time: ${recipe.cookTime || 'N/A'} minutes

Analyze this recipe and provide:

1. SEVERITY LEVEL (clean/spooky/haunted/cursed):
   - Clean: Healthy, sustainable, affordable
   - Spooky: Minor issues (slightly high in one metric)
   - Haunted: Moderate issues (2+ concerning metrics)
   - Cursed: Critical issues (health/safety concerns)

2. SPECIFIC ISSUES (if any):
   - List exactly what is problematic
   - Quantify each issue (e.g., "50% above recommended sodium")

3. HEALTHIER ALTERNATIVES:
   - Suggest SPECIFIC ingredient swaps
   - Maintain same cuisine/flavor profile
   - Provide estimated new nutrition values

4. MIGRATION PLAN (if issues found):
   - Phase 1: Easy wins (minimal recipe change)
   - Phase 2: Moderate changes (some adaptation needed)
   - Phase 3: Full optimization (new cooking method)

Be specific and actionable. No generic advice. Format as JSON.`;
    },

    /**
     * Meal Plan Generation Prompt
     * Creates personalized meal plans based on user preferences
     */
    mealPlanGeneration: (userProfile) => {
        return `You are a meal planning expert creating a personalized weekly meal plan.

USER PROFILE:
Budget: $${userProfile.budget || 100}
Dietary Restrictions: ${userProfile.dietary ? userProfile.dietary.join(', ') : 'None'}
Carbon Limit: ${userProfile.carbonLimit || 'No limit'} kg CO2e/week
Mood/Priority: ${userProfile.mood || 'balanced'}
Family Size: ${userProfile.familySize || 1} people
Allergies: ${userProfile.allergies ? userProfile.allergies.join(', ') : 'None'}

Generate a 7-day meal plan that:
1. Stays within budget
2. Respects all dietary restrictions and allergies
3. Meets carbon footprint goals
4. Aligns with user's priority (budget/carbon/health)
5. Includes variety (different cuisines and proteins)

For EACH meal, provide:
- Meal name
- Brief description  
- Estimated cost
- Key ingredients (5-7 main items)
- Prep/cook time
- Nutritional highlights

Format as JSON array of 7 days.`;
    },

    /**
     * Ingredient Substitution Prompt
     * Suggests healthier or more sustainable alternatives
     */
    ingredientSubstitution: (ingredient, reason) => {
        return `You are a culinary expert suggesting ingredient substitutions.

INGREDIENT TO REPLACE: ${ingredient}
REASON FOR REPLACEMENT: ${reason}

Suggest 3 alternative ingredients that:
1. Maintain similar flavor profile
2. Work in same types of recipes
3. Address the replacement reason
4. Are readily available in grocery stores

For EACH alternative, provide:
- Name
- Why it's better (nutrition/cost/sustainability)
- How flavor/texture differs
- Best use cases
- Approximate cost comparison

Be specific about measurements and cooking adjustments needed.`;
    },

    /**
     * Agent Performance Analysis Prompt
     * Analyzes agent failures and suggests improvements
     */
    agentPerformanceAnalysis: (agentName, failures) => {
        return `You are an AI systems engineer analyzing agent performance.

AGENT: ${agentName}
RECENT FAILURES (last 100 tasks):
${failures.map((f, i) => `${i + 1}. ${f.task} - Error: ${f.error}`).join('\n')}

Analyze these failures and provide:

1. PATTERN DETECTION:
   - What types of tasks fail most often?
   - Are there common error patterns?
   - What capabilities are missing?

2. ROOT CAUSE ANALYSIS:
   - Why is the agent failing at these tasks?
   - Is it a tool limitation, prompt issue, or logic problem?

3. IMPROVEMENT PROPOSAL:
   - What new tools should be added?
   - How should the prompt be refined?
   - What configuration changes are needed?

4. EXPECTED IMPACT:
   - Estimated success rate improvement
   - New capabilities unlocked
   - Potential downsides or trade-offs

Be specific about implementation. Provide code/config examples where relevant.`;
    },

    /**
     * Codebase Health Analysis Prompt
     * Analyzes project code for issues (self-analysis)
     */
    codebaseAnalysis: (codeSnapshot) => {
        return `You are a senior software engineer conducting a code review.

CODE SNAPSHOT:
Files Analyzed: ${codeSnapshot.fileCount}
Total Lines: ${codeSnapshot.totalLines}
Languages: ${codeSnapshot.languages.join(', ')}

DETECTED ISSUES:
${codeSnapshot.issues.map((issue, i) =>
            `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}
   Type: ${issue.type}
   Description: ${issue.description}`
        ).join('\n\n')}

Provide a comprehensive analysis:

1. SEVERITY ASSESSMENT:
   - Overall code health score (0-100)
   - Categorize as clean/spooky/haunted/cursed

2. PRIORITIZED FIX LIST:
   - Order issues by impact (security \u003e performance \u003e maintainability)
   - Estimated effort for each fix

3. REFACTORING PROPOSAL:
   - Architectural improvements needed
   - Modern patterns to adopt
   - Dependencies to update

4. IMPLEMENTATION PLAN:
   - Phase 1: Critical fixes (security, blocking bugs)
   - Phase 2: Performance improvements
   - Phase 3: Code quality enhancements

Provide specific file paths and code examples for top 3 issues.`;
    },

    /**
     * Fallback Template - Used when AI fails
     * Provides rule-based response 
     */
    fallbackAnalysis: (type, data) => {
        const templates = {
            recipe: `Recipe analysis unavailable (AI offline).
      
Basic nutritional assessment:
- Calories: ${data.calories > 600 ? 'High ⚠️' : 'Normal ✓'}
- Sodium: ${data.sodium > 1500 ? 'High ⚠️' : 'Normal ✓'}
- Cost: ${data.cost > 15 ? 'Expensive 💰' : 'Affordable ✓'}

Recommendation: Review recipe manually or try again later.`,

            agent: `Agent analysis unavailable (AI offline).
      
Performance summary:
- Success rate: ${data.successRate}%
- Average response time: ${data.avgTime}s
- Recent failures: ${data.failures.length}

Recommendation: Check logs manually for detailed error analysis.`,

            codebase: `Code analysis unavailable (AI offline).
      
Quick stats:
- Files scanned: ${data.fileCount}
- Issues detected: ${data.issueCount}
- Estimated technical debt: $${data.techDebt}

Recommendation: Use linter tools for detailed code review.`
        };

        return templates[type] || 'Analysis unavailable. Please try again later.';
    }
};

module.exports = promptTemplates;
