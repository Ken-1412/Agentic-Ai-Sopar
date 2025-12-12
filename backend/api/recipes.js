// Recipe Analysis API Routes
// REST endpoints for recipe health analysis

const express = require('express');
const router = express.Router();
const recipeAnalyzer = require('../services/analysis/recipe-analyzer');
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: 'Too many recipe analysis requests, please try again later.',
});

/**
 * @route POST /api/recipes/analyze
 * @desc Analyze a single recipe
 * @access Public
 */
router.post('/analyze', limiter, async (req, res) => {
    try {
        const { recipe } = req.body;

        if (!recipe || !recipe.name) {
            return res.status(400).json({
                success: false,
                error: 'Recipe with name is required',
            });
        }

        const analysis = await recipeAnalyzer.analyzeRecipe(recipe);

        res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Recipe analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze recipe',
        });
    }
});

/**
 * @route POST /api/recipes/compare
 * @desc Compare two recipes
 * @access Public
 */
router.post('/compare', limiter, async (req, res) => {
    try {
        const { recipe1, recipe2 } = req.body;

        if (!recipe1 || !recipe2) {
            return res.status(400).json({
                success: false,
                error: 'Both recipes are required for comparison',
            });
        }

        const comparison = await recipeAnalyzer.compareRecipes(recipe1, recipe2);

        res.json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error('Recipe comparison error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to compare recipes',
        });
    }
});

/**
 * @route POST /api/recipes/healthier-alternative
 * @desc Generate healthier alternative for a recipe
 * @access Public
 */
router.post('/healthier-alternative', limiter, async (req, res) => {
    try {
        const { recipe } = req.body;

        if (!recipe) {
            return res.status(400).json({
                success: false,
                error: 'Recipe is required',
            });
        }

        const alternative = await recipeAnalyzer.generateHealthierAlternative(recipe);

        res.json({
            success: true,
            ...alternative,
        });
    } catch (error) {
        console.error('Healthier alternative error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate healthier alternative',
        });
    }
});

/**
 * @route POST /api/recipes/batch-analyze
 * @desc Analyze multiple recipes
 * @access Public
 */
router.post('/batch-analyze', limiter, async (req, res) => {
    try {
        const { recipes } = req.body;

        if (!Array.isArray(recipes) || recipes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array of recipes is required',
            });
        }

        if (recipes.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 50 recipes per batch',
            });
        }

        const analyses = await recipeAnalyzer.batchAnalyze(recipes);

        res.json({
            success: true,
            analyses,
            count: analyses.length,
        });
    } catch (error) {
        console.error('Batch analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze recipes',
        });
    }
});

/**
 * @route POST /api/recipes/find-healthiest
 * @desc Find healthiest recipes from a list
 * @access Public
 */
router.post('/find-healthiest', limiter, async (req, res) => {
    try {
        const { recipes, limit = 5 } = req.body;

        if (!Array.isArray(recipes) || recipes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array of recipes is required',
            });
        }

        const healthiest = await recipeAnalyzer.findHealthiest(recipes, limit);

        res.json({
            success: true,
            healthiest,
            count: healthiest.length,
        });
    } catch (error) {
        console.error('Find healthiest error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to find healthiest recipes',
        });
    }
});

module.exports = router;
