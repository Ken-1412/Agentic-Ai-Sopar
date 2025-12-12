// Oumi Learning Integration with Thompson Sampling
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// In-memory storage for learning data
const learningData = {
    feedbacks: [],
    mealStats: {},
    confidence: 0.5,
    feedbackCount: 0
};

// Thompson Sampling implementation (simplified)
class ThompsonSampler {
    constructor() {
        this.meals = {};
    }
    
    // Update meal statistics after feedback
    updateMealRating(mealId, rating) {
        if (!this.meals[mealId]) {
            this.meals[mealId] = {
                successes: 0,
                trials: 0,
                alpha: 1,
                beta: 1
            };
        }
        
        const meal = this.meals[mealId];
        meal.trials += 1;
        
        // Update Beta distribution parameters
        if (rating >= 4) {
            meal.successes += 1;
            meal.alpha += 1;
        } else {
            meal.beta += 1;
        }
        
        // Calculate confidence (posterior mean)
        const mean = meal.alpha / (meal.alpha + meal.beta);
        meal.confidence = mean;
        
        return meal;
    }
    
    // Select next meal using Thompson Sampling
    selectMeal(availableMeals) {
        if (availableMeals.length === 0) return null;
        
        // Sample from Beta distribution for each meal
        const samples = availableMeals.map(meal => {
            const stats = this.meals[meal.id] || { alpha: 1, beta: 1 };
            // Simplified Beta sampling (using mean for demo)
            const sample = stats.alpha / (stats.alpha + stats.beta);
            return { meal, sample };
        });
        
        // Select meal with highest sample
        samples.sort((a, b) => b.sample - a.sample);
        return samples[0].meal;
    }
    
    // Get learning statistics
    getStats() {
        const totalTrials = Object.values(this.meals).reduce((sum, m) => sum + m.trials, 0);
        const avgConfidence = Object.values(this.meals).length > 0
            ? Object.values(this.meals).reduce((sum, m) => sum + m.confidence, 0) / Object.values(this.meals).length
            : 0.5;
        
        return {
            totalTrials,
            avgConfidence,
            mealCount: Object.keys(this.meals).length,
            meals: this.meals
        };
    }
}

const sampler = new ThompsonSampler();

// Call Python Oumi if available
async function callOumiPython(action, data) {
    try {
        const pythonScript = `
import json
import sys

action = "${action}"
data = ${JSON.stringify(data)}

# Oumi integration would go here
# For now, return mock response
result = {"status": "success", "action": action, "data": data}
print(json.dumps(result))
`;
        
        const { stdout } = await execAsync(
            `python3 -c "${pythonScript.replace(/"/g, '\\"')}"`,
            { timeout: 5000 }
        );
        
        return JSON.parse(stdout);
    } catch (error) {
        console.log('⚠️ Python Oumi not available, using JavaScript implementation');
        return null;
    }
}

module.exports = async (req, res) => {
    try {
        const { action, mealId, rating, mealFeatures } = req.body;
        
        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }
        
        console.log(`📊 Oumi action: ${action}`);
        
        // Handle different actions
        if (action === 'feedback') {
            // Validate feedback
            if (!mealId || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid feedback: mealId and rating (1-5) required'
                });
            }
            
            // Store feedback
            learningData.feedbacks.push({
                mealId,
                rating,
                mealFeatures,
                timestamp: new Date().toISOString()
            });
            learningData.feedbackCount += 1;
            
            // Update Thompson Sampling
            const stats = sampler.updateMealRating(mealId, rating);
            
            // Try to call Python Oumi
            await callOumiPython('feedback', { mealId, rating, mealFeatures });
            
            // Calculate average rating
            const mealRatings = learningData.feedbacks
                .filter(f => f.mealId === mealId)
                .map(f => f.rating);
            const averageRating = mealRatings.reduce((a, b) => a + b, 0) / mealRatings.length;
            
            res.json({
                success: true,
                action: 'feedback',
                data: {
                    mealId,
                    rating,
                    feedbackCount: learningData.feedbackCount
                },
                confidence: stats.confidence,
                averageRating: Math.round(averageRating * 100) / 100,
                feedbackCount: learningData.feedbackCount
            });
            
        } else if (action === 'recommend') {
            // Get available meals (mock for now)
            const allMeals = [
                { id: 1, name: 'Grilled Chicken Salad', cost: 8.50, carbon: 2.1, rating: 4.2 },
                { id: 2, name: 'Vegetable Stir Fry', cost: 6.00, carbon: 1.2, rating: 4.0 },
                { id: 3, name: 'Quinoa Buddha Bowl', cost: 9.00, carbon: 1.8, rating: 4.5 },
                { id: 4, name: 'Lentil Curry', cost: 5.50, carbon: 0.9, rating: 4.1 }
            ];
            
            // Select meal using Thompson Sampling
            const recommendedMeal = sampler.selectMeal(allMeals);
            
            // Try to call Python Oumi
            const oumiResult = await callOumiPython('recommend', {});
            
            res.json({
                success: true,
                action: 'recommend',
                data: {
                    meal: recommendedMeal,
                    reasoning: 'Selected using Thompson Sampling based on your preferences',
                    confidence: sampler.meals[recommendedMeal.id]?.confidence || 0.5
                },
                confidence: sampler.meals[recommendedMeal.id]?.confidence || 0.5
            });
            
        } else if (action === 'stats') {
            // Get learning statistics
            const stats = sampler.getStats();
            
            // Try to call Python Oumi
            const oumiResult = await callOumiPython('stats', {});
            
            res.json({
                success: true,
                action: 'stats',
                data: {
                    feedbackCount: learningData.feedbackCount,
                    totalTrials: stats.totalTrials,
                    avgConfidence: Math.round(stats.avgConfidence * 100) / 100,
                    mealCount: stats.mealCount,
                    learningProgress: Math.min(100, (learningData.feedbackCount / 10) * 100)
                },
                feedbackCount: learningData.feedbackCount,
                confidence: stats.avgConfidence
            });
            
        } else {
            return res.status(400).json({
                success: false,
                error: `Unknown action: ${action}. Use 'feedback', 'recommend', or 'stats'`
            });
        }
    } catch (error) {
        console.error('Error in /api/oumi:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process Oumi request'
        });
    }
};











