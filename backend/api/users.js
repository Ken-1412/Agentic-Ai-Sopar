const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with preferences
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profile'
        });
    }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', protect, async (req, res) => {
    try {
        const { tastes, moods, carbonPreference } = req.body;

        const updateData = {};

        if (tastes !== undefined) {
            updateData['preferences.tastes'] = tastes;
        }
        if (moods !== undefined) {
            updateData['preferences.moods'] = moods;
        }
        if (carbonPreference !== undefined) {
            if (!['low', 'medium', 'high'].includes(carbonPreference)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid carbon preference. Must be low, medium, or high'
                });
            }
            updateData['preferences.carbonPreference'] = carbonPreference;
        }

        // Mark model as needing retrain when preferences change
        if (Object.keys(updateData).length > 0) {
            updateData.modelTrained = false;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating preferences'
        });
    }
});

/**
 * @route   GET /api/users/recommendations
 * @desc    Get personalized meal recommendations
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
    try {
        const Meal = require('../models/Meal');
        const user = req.user;

        // Build query based on preferences
        const query = {};

        // Filter by carbon preference
        if (user.preferences.carbonPreference === 'low') {
            query.carbon = { $lte: 2.0 };
        } else if (user.preferences.carbonPreference === 'medium') {
            query.carbon = { $lte: 3.5 };
        }

        // Get meals matching preferences
        let meals = await Meal.find(query).limit(10).lean();

        // If no meals found, get random meals
        if (meals.length === 0) {
            meals = await Meal.find({}).limit(10).lean();
        }

        res.json({
            success: true,
            count: meals.length,
            meals,
            personalized: user.modelTrained
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching recommendations'
        });
    }
});

module.exports = router;
