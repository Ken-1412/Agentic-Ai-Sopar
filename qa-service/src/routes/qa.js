const express = require('express');
const router = express.Router();
const { searchMeals, getSuggestions } = require('../services/search');
const { generateResponse, generateMealSummary } = require('../services/generator');
const { reindexMeals, getIndexStats } = require('../services/indexer');
const esClient = require('../config/elasticsearch');
const openaiClient = require('../config/openai');
const mongoose = require('mongoose');

/**
 * Q&A API Routes
 */

/**
 * POST /api/qa/ask
 * Main Q&A endpoint - answers user questions about meals
 */
router.post('/ask', async (req, res) => {
    const startTime = Date.now();

    try {
        const { question, filters = {} } = req.body;

        // Validate input
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid question'
            });
        }

        // Search Elasticsearch for relevant meals
        const searchResults = await searchMeals(question, filters);

        // Generate AI response
        const answer = await generateResponse(question, searchResults);

        // Calculate search time
        const searchTime = Date.now() - startTime;

        res.json({
            success: true,
            question,
            answer,
            sources: searchResults,
            meta: {
                resultsCount: searchResults.length,
                searchTime: `${searchTime}ms`,
                filters: filters
            }
        });

    } catch (error) {
        console.error('❌ Error in /ask endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to process question',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/qa/index
 * Trigger reindexing of meal data from MongoDB to Elasticsearch
 */
router.post('/index', async (req, res) => {
    try {
        console.log('🔄 Starting reindex process...');

        const count = await reindexMeals();

        res.json({
            success: true,
            message: 'Meals successfully indexed',
            indexed: count
        });

    } catch (error) {
        console.error('❌ Error in /index endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to index meals',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/qa/suggestions
 * Get random meal suggestions
 */
router.get('/suggestions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const suggestions = await getSuggestions(limit);

        res.json({
            success: true,
            suggestions,
            count: suggestions.length
        });

    } catch (error) {
        console.error('❌ Error in /suggestions endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/qa/stats
 * Get index statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getIndexStats();

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Error in /stats endpoint:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/qa/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
    try {
        // Check MongoDB
        const mongoStatus = mongoose.connection.readyState === 1;

        // Check Elasticsearch
        const esHealth = await esClient.healthCheck();

        // Check OpenAI (just configuration, not actual API call)
        const openaiStatus = openaiClient.isReady();

        const allHealthy = mongoStatus && esHealth.connected && openaiStatus;

        res.status(allHealthy ? 200 : 503).json({
            success: allHealthy,
            service: 'qa-service',
            status: allHealthy ? 'healthy' : 'degraded',
            checks: {
                mongodb: {
                    connected: mongoStatus,
                    status: mongoStatus ? 'connected' : 'disconnected'
                },
                elasticsearch: {
                    connected: esHealth.connected,
                    status: esHealth.status || esHealth.error,
                    cluster: esHealth.cluster
                },
                openai: {
                    configured: openaiStatus,
                    status: openaiStatus ? 'ready' : 'not configured'
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in /health endpoint:', error.message);
        res.status(503).json({
            success: false,
            service: 'qa-service',
            status: 'error',
            error: error.message
        });
    }
});

module.exports = router;
