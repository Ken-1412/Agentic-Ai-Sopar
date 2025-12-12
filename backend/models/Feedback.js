const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    mealId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Meal',
        required: true
    },
    mealName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    liked: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment can not be more than 500 characters']
    },
    mealFeatures: {
        cost: Number,
        carbon: Number,
        calories: Number,
        protein: Number
        // Add other features used for improved recommendations
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting more than one feedback per meal (optional, logic can handle multiple)
// FeedbackSchema.index({ mealId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
