const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    day: {
        type: String, // e.g., "Monday", "2023-10-27"
        required: false
    },
    slot: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique meal per slot per day for a user
MealPlanSchema.index({ user: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', MealPlanSchema);
