const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const Meal = require('../models/Meal');

// Middleware to simulate user authentication (since we might not have a full auth implementation yet in some contexts, but ideally this should use req.user)
// For this implementation, we'll assume a dummy user ID if auth isn't present, or trust the client to send a userId in the body/query for now if strictly local, 
// BUT for best practices we'll try to use a standard approach. 
// Given the current file list, there is an auth.js, so let's assume we can get user ID from request or pass it.
// To keep it simple and working with the current "local-only" vibe if needed, we might allow passing userId.

// GET /api/planner?startDate=...&endDate=...&userId=...
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        // Basic date validation
        let query = {};
        if (userId) query.user = userId;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const plans = await MealPlan.find(query).populate('meal');
        res.json(plans);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/planner
// Add a meal to the plan
router.post('/', async (req, res) => {
    try {
        const { userId, date, slot, mealId } = req.body;

        if (!userId || !date || !slot || !mealId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Upsert: valid way to replace if exists or create new
        const plan = await MealPlan.findOneAndUpdate(
            { user: userId, date: new Date(date), slot },
            { meal: mealId },
            { new: true, upsert: true }
        ).populate('meal');

        res.json(plan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/planner/:id
router.delete('/:id', async (req, res) => {
    try {
        await MealPlan.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/planner/shopping-list?startDate=...&endDate=...&userId=...
router.get('/shopping-list', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        let query = {};
        if (userId) query.user = userId;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const plans = await MealPlan.find(query).populate('meal');

        // Aggregate ingredients
        const shoppingList = {};

        plans.forEach(plan => {
            if (plan.meal && plan.meal.ingredients) {
                plan.meal.ingredients.forEach(ing => {
                    const key = ing.name.toLowerCase();
                    if (!shoppingList[key]) {
                        shoppingList[key] = {
                            name: ing.name,
                            amount: 0,
                            unit: ing.unit,
                            items: [] // Track which meals this is for
                        };
                    }
                    // Simple aggregation logic (parsing amounts is complex, this is a basic number sum if possible)
                    // We'll just append simple strings if not numbers
                    const amountVal = parseFloat(ing.amount);
                    if (!isNaN(amountVal)) {
                        shoppingList[key].amount += amountVal;
                    } else {
                        // If Mixed units or text, just keep list? For now let's just create a list of needed items
                    }
                    shoppingList[key].items.push(`${ing.amount} ${ing.unit} for ${plan.meal.name}`);
                });
            }
        });

        const result = Object.values(shoppingList);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
