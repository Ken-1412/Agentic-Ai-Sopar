// Severity Calculation Utilities
// Inspired by Haunted Refactorium's severity-based categorization

/**
 * Severity Levels for Recipe Health
 * - Clean (🟢): Healthy, sustainable, affordable
 * - Spooky (🟡): Minor issues (1-2 concerning metrics)
 * - Haunted (🟠): Moderate issues (3+ concerning metrics)
 * - Cursed (🔴): Critical health/safety concerns
 */

const SEVERITY_LEVELS = {
    CLEAN: 'clean',
    SPOOKY: 'spooky',
    HAUNTED: 'haunted',
    CURSED: 'cursed',
};

const SEVERITY_SCORES = {
    clean: 0,
    spooky: 1,
    haunted: 2,
    cursed: 3,
};

// Nutritional thresholds (per serving)
const THRESHOLDS = {
    calories: {
        cursed: 1000,    // Extremely high
        haunted: 800,    // Very high
        spooky: 600,     // Moderately high
    },
    sodium: {
        cursed: 2400,    // Exceeds daily limit
        haunted: 1500,   // Very high
        spooky: 1000,    // Moderately high
    },
    sugar: {
        cursed: 50,      // Extremely high
        haunted: 30,     // Very high  
        spooky: 20,      // Moderately high
    },
    saturatedFat: {
        cursed: 20,      // Extremely high
        haunted: 13,     // Daily limit
        spooky: 10,      // Moderately high
    },
    transFat: {
        cursed: 0.5,     // Any amount is bad
        haunted: 0.1,
        spooky: 0,
    },
    carbonFootprint: {
        cursed: 10,      // Very high emissions
        haunted: 5,      // High emissions
        spooky: 3,       // Moderate emissions
    },
    cost: {
        cursed: 25,      // Very expensive
        haunted: 15,     // Expensive
        spooky: 10,      // Moderately expensive
    },
    cookTime: {
        cursed: 120,     // 2+ hours
        haunted: 90,     // 1.5 hours
        spooky: 60,      // 1 hour
    },
};

/**
 * Calculate overall severity based on recipe metrics
 * @param {object} recipe - Recipe data
 * @returns {string} Severity level (clean/spooky/haunted/cursed)
 */
function calculateRecipeSeverity(recipe) {
    const issues = detectRecipeIssues(recipe);

    // Count issues by severity
    const cursedCount = issues.filter(i => i.severity === 'cursed').length;
    const hauntedCount = issues.filter(i => i.severity === 'haunted').length;
    const spookyCount = issues.filter(i => i.severity === 'spooky').length;

    // Determine overall severity (worst wins)
    if (cursedCount > 0) return SEVERITY_LEVELS.CURSED;
    if (hauntedCount >= 3) return SEVERITY_LEVELS.CURSED; // Multiple haunted = cursed
    if (hauntedCount > 0) return SEVERITY_LEVELS.HAUNTED;
    if (spookyCount >= 3) return SEVERITY_LEVELS.HAUNTED; // Multiple spooky = haunted
    if (spookyCount > 0) return SEVERITY_LEVELS.SPOOKY;

    return SEVERITY_LEVELS.CLEAN;
}

/**
 * Detect specific issues in a recipe
 * @param {object} recipe - Recipe data
 * @returns {array} List of detected issues
 */
function detectRecipeIssues(recipe) {
    const issues = [];

    // Check trans fats (any amount is bad)
    if (recipe.transFat > 0) {
        issues.push({
            type: 'trans-fat',
            severity: recipe.transFat >= THRESHOLDS.transFat.cursed ? 'cursed' : 'haunted',
            metric: 'transFat',
            value: recipe.transFat,
            threshold: 0,
            message: `Contains ${recipe.transFat}g trans fat (should be 0g)`,
            recommendation: 'Replace with healthier fats (olive oil, avocado)',
        });
    }

    // Check calories
    if (recipe.calories >= THRESHOLDS.calories.spooky) {
        const severity =
            recipe.calories >= THRESHOLDS.calories.cursed ? 'cursed' :
                recipe.calories >= THRESHOLDS.calories.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'high-calories',
            severity,
            metric: 'calories',
            value: recipe.calories,
            threshold: THRESHOLDS.calories.spooky,
            message: `${recipe.calories} calories per serving`,
            recommendation: 'Reduce portion size or use lighter ingredients',
        });
    }

    // Check sodium
    if (recipe.sodium >= THRESHOLDS.sodium.spooky) {
        const severity =
            recipe.sodium >= THRESHOLDS.sodium.cursed ? 'cursed' :
                recipe.sodium >= THRESHOLDS.sodium.haunted ? 'haunted' : 'spooky';

        const percentage = ((recipe.sodium / 2300) * 100).toFixed(0);

        issues.push({
            type: 'high-sodium',
            severity,
            metric: 'sodium',
            value: recipe.sodium,
            threshold: THRESHOLDS.sodium.spooky,
            message: `${recipe.sodium}mg sodium (${percentage}% of daily limit)`,
            recommendation: 'Use low-sodium alternatives, add herbs for flavor',
        });
    }

    // Check sugar
    if (recipe.sugar >= THRESHOLDS.sugar.spooky) {
        const severity =
            recipe.sugar >= THRESHOLDS.sugar.cursed ? 'cursed' :
                recipe.sugar >= THRESHOLDS.sugar.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'high-sugar',
            severity,
            metric: 'sugar',
            value: recipe.sugar,
            threshold: THRESHOLDS.sugar.spooky,
            message: `${recipe.sugar}g sugar per serving`,
            recommendation: 'Replace with natural sweeteners or reduce sweetness',
        });
    }

    // Check saturated fat
    if (recipe.saturatedFat >= THRESHOLDS.saturatedFat.spooky) {
        const severity =
            recipe.saturatedFat >= THRESHOLDS.saturatedFat.cursed ? 'cursed' :
                recipe.saturatedFat >= THRESHOLDS.saturatedFat.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'high-saturated-fat',
            severity,
            metric: 'saturatedFat',
            value: recipe.saturatedFat,
            threshold: THRESHOLDS.saturatedFat.spooky,
            message: `${recipe.saturatedFat}g saturated fat`,
            recommendation: 'Use lean proteins, plant-based alternatives',
        });
    }

    // Check carbon footprint
    if (recipe.carbonFootprint >= THRESHOLDS.carbonFootprint.spooky) {
        const severity =
            recipe.carbonFootprint >= THRESHOLDS.carbonFootprint.cursed ? 'cursed' :
                recipe.carbonFootprint >= THRESHOLDS.carbonFootprint.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'high-carbon',
            severity,
            metric: 'carbonFootprint',
            value: recipe.carbonFootprint,
            threshold: THRESHOLDS.carbonFootprint.spooky,
            message: `${recipe.carbonFootprint}kg CO2e carbon footprint`,
            recommendation: 'Use local, plant-based ingredients',
        });
    }

    // Check cost
    if (recipe.cost >= THRESHOLDS.cost.spooky) {
        const severity =
            recipe.cost >= THRESHOLDS.cost.cursed ? 'cursed' :
                recipe.cost >= THRESHOLDS.cost.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'high-cost',
            severity,
            metric: 'cost',
            value: recipe.cost,
            threshold: THRESHOLDS.cost.spooky,
            message: `$${recipe.cost} per serving`,
            recommendation: 'Use seasonal ingredients, buy in bulk',
        });
    }

    // Check cook time
    if (recipe.cookTime >= THRESHOLDS.cookTime.spooky) {
        const severity =
            recipe.cookTime >= THRESHOLDS.cookTime.cursed ? 'haunted' : // Downgrade cursed to haunted for time
                recipe.cookTime >= THRESHOLDS.cookTime.haunted ? 'haunted' : 'spooky';

        issues.push({
            type: 'long-cook-time',
            severity,
            metric: 'cookTime',
            value: recipe.cookTime,
            threshold: THRESHOLDS.cookTime.spooky,
            message: `${recipe.cookTime} minutes cooking time`,
            recommendation: 'Use pressure cooker, meal prep in batches',
        });
    }

    // Check ingredient count (recipe complexity)
    if (recipe.ingredients && recipe.ingredients.length > 20) {
        issues.push({
            type: 'complex-recipe',
            severity: 'spooky',
            metric: 'ingredients',
            value: recipe.ingredients.length,
            threshold: 20,
            message: `${recipe.ingredients.length} ingredients required`,
            recommendation: 'Simplify recipe, use pre-made components',
        });
    }

    // Check for allergens (if specified)
    if (recipe.allergens && recipe.allergens.length > 0) {
        const commonAllergens = ['peanuts', 'tree nuts', 'shellfish', 'dairy', 'eggs'];
        const hasCommonAllergen = recipe.allergens.some(a =>
            commonAllergens.includes(a.toLowerCase())
        );

        if (hasCommonAllergen) {
            issues.push({
                type: 'common-allergens',
                severity: 'haunted',
                metric: 'allergens',
                value: recipe.allergens.join(', '),
                message: `Contains common allergens: ${recipe.allergens.join(', ')}`,
                recommendation: 'Provide allergen-free alternatives',
            });
        }
    }

    return issues.sort((a, b) =>
        SEVERITY_SCORES[b.severity] - SEVERITY_SCORES[a.severity]
    );
}

/**
 * Calculate health score (0-100)
 * @param {object} recipe - Recipe data
 * @returns {number} Health score
 */
function calculateHealthScore(recipe) {
    let score = 100;
    const issues = detectRecipeIssues(recipe);

    // Deduct points based on severity
    issues.forEach(issue => {
        switch (issue.severity) {
            case 'cursed':
                score -= 30;
                break;
            case 'haunted':
                score -= 15;
                break;
            case 'spooky':
                score -= 5;
                break;
        }
    });

    // Bonus points for good nutrition
    if (recipe.protein >= 20) score += 5; // High protein
    if (recipe.fiber >= 5) score += 5; // High fiber
    if (recipe.vegetables >= 3) score += 5; // Lots of veggies

    return Math.max(0, Math.min(100, score));
}

/**
 * Get severity color for UI
 * @param {string} severity - Severity level
 * @returns {string} CSS color
 */
function getSeverityColor(severity) {
    const colors = {
        clean: '#2ecc40',
        spooky: '#ffdc00',
        haunted: '#ff851b',
        cursed: '#ff4136',
    };
    return colors[severity] || '#cccccc';
}

/**
 * Get severity emoji
 * @param {string} severity - Severity level
 * @returns {string} Emoji
 */
function getSeverityEmoji(severity) {
    const emojis = {
        clean: '🟢',
        spooky: '🟡',
        haunted: '🟠',
        cursed: '🔴',
    };
    return emojis[severity] || '⚪';
}

/**
 * Get severity label
 * @param {string} severity - Severity level
 * @returns {string} Human-readable label
 */
function getSeverityLabel(severity) {
    const labels = {
        clean: 'Clean',
        spooky: 'Spooky',
        haunted: 'Haunted',
        cursed: 'Cursed',
    };
    return labels[severity] || 'Unknown';
}

module.exports = {
    SEVERITY_LEVELS,
    THRESHOLDS,
    calculateRecipeSeverity,
    detectRecipeIssues,
    calculateHealthScore,
    getSeverityColor,
    getSeverityEmoji,
    getSeverityLabel,
};
