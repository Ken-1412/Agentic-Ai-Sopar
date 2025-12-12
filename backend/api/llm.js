// LLM API Routes
// Exposes LLM service capabilities via REST API

const express = require('express');
const router = express.Router();
const llmService = require('../services/llm');
const rateLimit = require('express-rate-limit');
const llmConfig = require('../config/llm-config');

// Rate limiting for LLM endpoints
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: llmConfig.rateLimit.maxRequestsPerMinute,
    message: 'Too many LLM requests, please try again later.',
});

/**
 * @route POST /api/llm/analyze-recipe
 * @desc Analyze recipe health using AI
 * @access Public
 */
router.post('/analyze-recipe', limiter, async (req, res) => {
    try {
        const { recipe } = req.body;

        if (!recipe || !recipe.name) {
            return res.status(400).json({
                success: false,
                error: 'Recipe data with name is required',
            });
        }

        const analysis = await llmService.analyzeRecipe(recipe);

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
 * @route POST /api/llm/generate-meal-plan
 * @desc Generate personalized meal plan
 * @access Public
 */
router.post('/generate-meal-plan', limiter, async (req, res) => {
    try {
        const { userProfile } = req.body;

        if (!userProfile) {
            return res.status(400).json({
                success: false,
                error: 'User profile is required',
            });
        }

        const mealPlan = await llmService.generateMealPlan(userProfile);

        res.json({
            success: true,
            mealPlan,
        });
    } catch (error) {
        console.error('Meal plan generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate meal plan',
        });
    }
});

/**
 * @route POST /api/llm/suggest-substitution
 * @desc Suggest ingredient substitutions
 * @access Public
 */
router.post('/suggest-substitution', limiter, async (req, res) => {
    try {
        const { ingredient, reason } = req.body;

        if (!ingredient || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Ingredient and reason are required',
            });
        }

        const suggestions = await llmService.suggestSubstitution(ingredient, reason);

        res.json({
            success: true,
            suggestions,
        });
    } catch (error) {
        console.error('Substitution suggestion error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to suggest substitutions',
        });
    }
});

/**
 * @route POST /api/llm/analyze-agent
 * @desc Analyze agent performance and suggest improvements
 * @access Private (Admin only)
 */
router.post('/analyze-agent', limiter, async (req, res) => {
    try {
        const { agentName, failures } = req.body;

        if (!agentName || !Array.isArray(failures)) {
            return res.status(400).json({
                success: false,
                error: 'Agent name and failures array are required',
            });
        }

        const analysis = await llmService.analyzeAgentPerformance(agentName, failures);

        res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Agent analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze agent',
        });
    }
});

/**
 * @route POST /api/llm/analyze-codebase
 * @desc Analyze codebase health
 * @access Private (Admin only)
 */
router.post('/analyze-codebase', limiter, async (req, res) => {
    try {
        const { codeSnapshot } = req.body;

        if (!codeSnapshot) {
            return res.status(400).json({
                success: false,
                error: 'Code snapshot data is required',
            });
        }

        const analysis = await llmService.analyzeCodebase(codeSnapshot);

        res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Codebase analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze codebase',
        });
    }
});

/**
 * @route POST /api/llm/generate
 * @desc Generic text generation endpoint
 * @access Public
 */
router.post('/generate', limiter, async (req, res) => {
    try {
        const { prompt, options } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required',
            });
        }

        const response = await llmService.generate(prompt, options || {});

        res.json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate text',
        });
    }
});

/**
 * @route GET /api/llm/health
 * @desc Health check for LLM service
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        const health = await llmService.healthCheck();

        res.json({
            success: true,
            health,
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Health check failed',
        });
    }
});

/**
 * @route GET /api/llm/stats
 * @desc Get LLM service statistics
 * @access Public
 */
router.get('/stats', (req, res) => {
    try {
        const stats = llmService.getStats();

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get stats',
        });
    }
});

module.exports = router;
