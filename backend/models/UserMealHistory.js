const mongoose = require('mongoose');

const UserMealHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    mood: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries
UserMealHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('UserMealHistory', UserMealHistorySchema);
