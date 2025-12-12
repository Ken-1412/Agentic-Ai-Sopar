// Recipe Analyzer Service
// Analyzes recipes using "code smell" patterns from software engineering

const llmService = require('../llm');
const {
    calculateRecipeSeverity,
    detectRecipeIssues,
    calculateHealthScore,
} = require('../../utils/severity');

class RecipeAnalyzer {
    /**
     * Analyze a recipe comprehensively
     * @param {object} recipe - Recipe data
     * @param {object} options - Analysis options
     * @returns {Promise<object>} Complete analysis
     */
    async analyzeRecipe(recipe, options = {}) {
        // 1. Detect recipe "smells" (issues)
        const issues = detectRecipeIssues(recipe);

        // 2. Calculate severity
        const severity = calculateRecipeSeverity(recipe);

        // 3. Calculate health score
        const healthScore = calculateHealthScore(recipe);

        // 4. Get AI analysis  (if enabled)
        let aiAnalysis = null;
        if (options.useAI !== false) {
            try {
                aiAnalysis = await llmService.analyzeRecipe(recipe);
            } catch (error) {
                console.warn('AI analysis failed, using rule-based only:', error.message);
            }
        }

        // 5. Generate summary
        const summary = this.generateSummary(recipe, issues, severity, healthScore);

        return {
            recipeId: recipe.id || recipe._id,
            recipeName: recipe.name,
            severity,
            healthScore,
            issues,
            summary,
            aiAnalysis,
            analyzedAt: new Date(),
        };
    }

    /**
     * Generate human-readable summary
     * @private
     */
    generateSummary(recipe, issues, severity, healthScore) {
        if (issues.length === 0) {
            return {
                headline: `${recipe.name} is a healthy choice!`,
                description: 'This recipe meets all nutritional guidelines.',
                action: 'Feel free to enjoy this meal.',
            };
        }

        const cursedIssues = issues.filter(i => i.severity === 'cursed');
        const hauntedIssues = issues.filter(i => i.severity === 'haunted');
        const spookyIssues = issues.filter(i => i.severity === 'spooky');

        let headline, description, action;

        if (cursedIssues.length > 0) {
            headline = `⚠️ ${recipe.name} has critical health concerns`;
            description = `Found ${cursedIssues.length} critical issue(s): ${cursedIssues.map(i => i.type).join(', ')}`;
            action = 'Consider choosing a different recipe or major modifications.';
        } else if (hauntedIssues.length > 0) {
            headline = `⚠️ ${recipe.name} needs some improvements`;
            description = `Found ${hauntedIssues.length} moderate issue(s) that should be addressed.`;
            action = 'Review suggested modifications below.';
        } else {
            headline = `ℹ️ ${recipe.name} has minor issues`;
            description = `Found ${spookyIssues.length} minor issue(s) that could be improved.`;
            action = 'Recipe is generally okay, small tweaks recommended.';
        }

        return { headline, description, action };
    }

    /**
     * Compare two recipes
     * @param {object} recipe1 - First recipe
     * @param {object} recipe2 - Second recipe
     * @returns {object} Comparison results
     */
    async compareRecipes(recipe1, recipe2) {
        const analysis1 = await this.analyzeRecipe(recipe1, { useAI: false });
        const analysis2 = await this.analyzeRecipe(recipe2, { useAI: false });

        return {
            recipe1: {
                name: recipe1.name,
                severity: analysis1.severity,
                healthScore: analysis1.healthScore,
                issueCount: analysis1.issues.length,
            },
            recipe2: {
                name: recipe2.name,
                severity: analysis2.severity,
                healthScore: analysis2.healthScore,
                issueCount: analysis2.issues.length,
            },
            winner: analysis1.healthScore > analysis2.healthScore ? 'recipe1' : 'recipe2',
            scoreDifference: Math.abs(analysis1.healthScore - analysis2.healthScore),
        };
    }

    /**
     * Generate healthier alternative
     * @param {object} recipe - Original recipe
     * @returns {Promise<object>} Alternative recipe suggestions
     */
    async generateHealthierAlternative(recipe) {
        const analysis = await this.analyzeRecipe(recipe, { useAI: false });

        if (analysis.issues.length === 0) {
            return {
                success: false,
                message: 'Recipe is already healthy!',
            };
        }

        // Build ingredient substitutions based on issues
        const substitutions = [];

        analysis.issues.forEach(issue => {
            switch (issue.type) {
                case 'trans-fat':
                case 'high-saturated-fat':
                    substitutions.push({
                        original: 'butter/margarine',
                        alternative: 'olive oil or avocado oil',
                        benefit: 'Reduces saturated fat by ~70%',
                    });
                    break;

                case 'high-sodium':
                    substitutions.push({
                        original: 'table salt',
                        alternative: 'herbs, spices, lemon juice',
                        benefit: 'Reduces sodium by ~60%',
                    });
                    break;

                case 'high-sugar':
                    substitutions.push({
                        original: 'white sugar',
                        alternative: 'honey, maple syrup, or dates',
                        benefit: 'Natural sweeteners with nutrients',
                    });
                    break;

                case 'high-carbon':
                    substitutions.push({
                        original: 'beef',
                        alternative: 'chicken, turkey, or plant-based protein',
                        benefit: 'Reduces carbon footprint by ~60%',
                    });
                    break;

                case 'high-cost':
                    substitutions.push({
                        original: 'expensive cuts/ingredients',
                        alternative: 'seasonal, local alternatives',
                        benefit: 'Reduces cost by ~30%',
                    });
                    break;
            }
        });

        // Remove duplicates
        const uniqueSubstitutions = Array.from(
            new Map(substitutions.map(s => [s.original, s])).values()
        );

        // Estimate improvement
        const estimatedHealthScore = Math.min(100, analysis.healthScore + (uniqueSubstitutions.length * 10));

        return {
            success: true,
            originalRecipe: {
                name: recipe.name,
                healthScore: analysis.healthScore,
                severity: analysis.severity,
            },
            substitutions: uniqueSubstitutions,
            estimatedImprovement: {
                healthScore: estimatedHealthScore,
                improvementPercentage: ((estimatedHealthScore - analysis.healthScore) / analysis.healthScore * 100).toFixed(0) + '%',
            },
            migrationPlan: this.generateMigrationPlan(analysis.issues, substitutions),
        };
    }

    /**
     * Generate step-by-step migration plan
     * @private
     */
    generateMigrationPlan(issues, substitutions) {
        const cursedIssues = issues.filter(i => i.severity === 'cursed');
        const hauntedIssues = issues.filter(i => i.severity === 'haunted');
        const spookyIssues = issues.filter(i => i.severity === 'spooky');

        const phases = [];

        // Phase 1: Critical fixes (cursed issues)
        if (cursedIssues.length > 0) {
            phases.push({
                phase: 1,
                title: 'Critical Fixes (Required)',
                priority: 'high',
                description: 'Address health/safety concerns immediately',
                tasks: cursedIssues.map(issue => ({
                    issue: issue.type,
                    action: issue.recommendation,
                    impact: 'Critical health improvement',
                })),
                estimatedTime: '10-15 minutes',
            });
        }

        // Phase 2: Moderate improvements (haunted issues)
        if (hauntedIssues.length > 0) {
            phases.push({
                phase: phases.length + 1,
                title: 'Moderate Improvements (Recommended)',
                priority: 'medium',
                description: 'Improve nutritional profile significantly',
                tasks: hauntedIssues.map(issue => ({
                    issue: issue.type,
                    action: issue.recommendation,
                    impact: 'Noticeable health benefits',
                })),
                estimatedTime: '15-20 minutes',
            });
        }

        // Phase 3: Minor tweaks (spooky issues)
        if (spookyIssues.length > 0) {
            phases.push({
                phase: phases.length + 1,
                title: 'Minor Optimizations (Optional)',
                priority: 'low',
                description: 'Fine-tune for maximum health',
                tasks: spookyIssues.map(issue => ({
                    issue: issue.type,
                    action: issue.recommendation,
                    impact: 'Small improvements',
                })),
                estimatedTime: '5-10 minutes',
            });
        }

        return {
            phases,
            totalEstimatedTime: this.sumEstimatedTimes(phases),
            difficultyLevel: phases.length >= 3 ? 'moderate' : phases.length >= 2 ? 'easy' : 'very easy',
        };
    }

    /**
     * Sum estimated times from phases
     * @private
     */
    sumEstimatedTimes(phases) {
        // Simple estimation: max time from each phase
        let totalMinutes = 0;
        phases.forEach(phase => {
            const match = phase.estimatedTime.match(/(\d+)-(\d+)/);
            if (match) {
                totalMinutes += parseInt(match[2]); // Use max estimate
            }
        });
        return `${totalMinutes} minutes`;
    }

    /**
     * Batch analyze multiple recipes
     * @param {array} recipes - Array of recipes
     * @returns {Promise<array>} Array of analyses
     */
    async batchAnalyze(recipes) {
        return await Promise.all(
            recipes.map(recipe => this.analyzeRecipe(recipe, { useAI: false }))
        );
    }

    /**
     * Find healthiest recipes from a list
     * @param {array} recipes - Array of recipes
     * @param {number} limit - Number of results
     * @returns {Promise<array>} Top recipes by health score
     */
    async findHealthiest(recipes, limit = 5) {
        const analyses = await this.batchAnalyze(recipes);

        return analyses
            .sort((a, b) => b.healthScore - a.healthScore)
            .slice(0, limit)
            .map(analysis => ({
                recipeId: analysis.recipeId,
                recipeName: analysis.recipeName,
                healthScore: analysis.healthScore,
                severity: analysis.severity,
            }));
    }
}

// Export singleton
module.exports = new RecipeAnalyzer();
