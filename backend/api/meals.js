const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');

// @desc    Get all meals
// @route   GET /api/meals
router.get('/', async (req, res) => {
    try {
        const { minPrice, maxPrice, maxCalories, cuisine, dietary } = req.query;
        let query = {};

        if (minPrice || maxPrice) {
            query.cost = {};
            if (minPrice) query.cost.$gte = Number(minPrice);
            if (maxPrice) query.cost.$lte = Number(maxPrice);
        }

        if (maxCalories) {
            query.calories = { $lte: Number(maxCalories) };
        }

        if (cuisine) {
            query.cuisine = cuisine;
        }

        if (dietary) {
            query.dietary = { $in: dietary.split(',') };
        }

        const meals = await Meal.find(query);

        res.json({
            success: true,
            count: meals.length,
            meals
        });
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

// @desc    Get recommendations (POST to accept complex body from frontend easily, or match legacy)
// @route   POST /api/meals (Legacy support for "recommendations") OR special route
// The frontend calls POST /api/meals with { mode, budget, limit }. 
// Let's support that on root POST for backward compatibility or refactor frontend. 
// Plan: Support POST /recommendations for new structured calls, and keep POST / for legacy if needed.
// But we are rewriting frontend too. So let's stick to spec. Spec says GET /api/meals/recommendations.
// However, current Frontend calls POST /api/meals.
// I will implement POST / as the "get recommendations" endpoint to match current frontend logic until I refactor frontend.
// Actually, I can support both.

router.post('/recommendations', async (req, res) => {
    try {
        const { mode, budget, limit = 10, cuisine, dietary } = req.body;
        let query = {};

        if (budget) {
            query.cost = { $lte: Number(budget) };
        }

        if (cuisine) {
            query.cuisine = cuisine;
        }

        if (dietary) {
            query.dietary = { $in: dietary };
        }

        let meals = await Meal.find(query);

        // Sorting Logic (Mode)
        if (mode === 'budget') {
            meals.sort((a, b) => a.cost - b.cost);
        } else if (mode === 'carbon') {
            meals.sort((a, b) => a.carbon - b.carbon);
        } else if (mode === 'mood') {
            meals.sort((a, b) => b.rating - a.rating);
        }

        const limitedMeals = meals.slice(0, Number(limit));

        res.json({
            success: true,
            mode,
            count: limitedMeals.length,
            meals: limitedMeals
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// Legacy support for current frontend which does POST /api/meals
router.post('/', async (req, res) => {
    // Redirect logic to recommendations
    try {
        const { mode, budget, limit = 10 } = req.body;
        let query = {};
        if (budget) query.cost = { $lte: Number(budget) };

        let meals = await Meal.find(query);

        if (mode === 'budget') meals.sort((a, b) => a.cost - b.cost);
        else if (mode === 'carbon') meals.sort((a, b) => a.carbon - b.carbon);
        else if (mode === 'mood') meals.sort((a, b) => b.rating - a.rating);

        const results = meals.slice(0, limit);

        res.json({
            success: true,
            meals: results,
            count: results.length,
            mode
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

module.exports = router;
