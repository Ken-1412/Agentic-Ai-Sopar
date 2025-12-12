const Feedback = require('../models/Feedback');

module.exports = async (req, res) => {
    try {
        const { mealId, mealName, rating, comment, features } = req.body;

        const feedback = await Feedback.create({
            mealId,
            mealName,
            rating,
            mealFeatures: features || {},
            comment: comment || '',
            timestamp: new Date(),
            liked: rating >= 4
        });

        console.log(`✅ Feedback recorded: Meal ${mealId} - ${rating} stars`);

        // Calculate average rating for this meal from database
        const allFeedback = await Feedback.find({ mealId });
        const averageRating = allFeedback.length > 0
            ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
            : rating;

        res.json({
            success: true,
            message: 'Feedback saved',
            feedbackCount: allFeedback.length,
            averageRating: Math.round(averageRating * 100) / 100
        });
    } catch (error) {
        console.error('Error in /api/feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save feedback',
            details: error.message
        });
    }
};
