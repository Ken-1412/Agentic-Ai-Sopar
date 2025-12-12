const mongoose = require('mongoose');

/**
 * Meal Model - Shared schema for Q&A service
 * This matches the main backend Meal model
 */
const MealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a meal name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    cost: {
        type: Number,
        required: [true, 'Please add a cost']
    },
    carbon: {
        type: Number,
        required: [true, 'Please add carbon footprint']
    },
    calories: {
        type: Number,
        required: false
    },
    protein: {
        type: Number,
        required: false
    },
    cuisine: {
        type: String,
        required: false,
        enum: [
            'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese',
            'American', 'Mediterranean', 'Thai', 'French', 'Greek',
            'Spanish', 'Korean', 'Middle Eastern', 'Other'
        ]
    },
    dietary: {
        type: [String],
        enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'None'],
        default: ['None']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: 'https://placehold.co/600x400'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Meal', MealSchema);
