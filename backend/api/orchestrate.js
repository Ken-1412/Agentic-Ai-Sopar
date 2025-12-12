// Kestra Orchestration Integration
const axios = require('axios');

const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';
const KESTRA_NAMESPACE = process.env.KESTRA_NAMESPACE || 'mealwise';
const KESTRA_FLOW_ID = process.env.KESTRA_FLOW_ID || 'meal_planner_orchestration';
const KESTRA_TIMEOUT = parseInt(process.env.KESTRA_TIMEOUT || '30000', 10);

// Mock meal database
const allMeals = [
    { id: 1, name: 'Grilled Chicken Salad', cost: 8.50, carbon: 2.1, rating: 4.2, description: 'Fresh greens with grilled chicken and light dressing' },
    { id: 2, name: 'Vegetable Stir Fry', cost: 6.00, carbon: 1.2, rating: 4.0, description: 'Colorful vegetables with tofu' },
    { id: 3, name: 'Quinoa Buddha Bowl', cost: 9.00, carbon: 1.8, rating: 4.5, description: 'Quinoa with roasted vegetables and tahini dressing' },
    { id: 4, name: 'Lentil Curry', cost: 5.50, carbon: 0.9, rating: 4.1, description: 'Spiced lentils with rice' },
    { id: 5, name: 'Grilled Fish', cost: 12.00, carbon: 3.5, rating: 4.3, description: 'Fresh grilled fish with vegetables' },
    { id: 6, name: 'Bean Burrito', cost: 7.00, carbon: 1.5, rating: 4.0, description: 'Black beans with rice and vegetables' },
    { id: 7, name: 'Pasta Primavera', cost: 8.00, carbon: 2.0, rating: 3.9, description: 'Pasta with seasonal vegetables' },
    { id: 8, name: 'Chickpea Hummus Wrap', cost: 6.50, carbon: 1.1, rating: 4.2, description: 'Whole wheat wrap with hummus and vegetables' }
];

// Simulate Kestra workflow execution
async function executeKestraWorkflow(userProfile) {
    const startTime = Date.now();
    
    try {
        // Step 1: Fetch meals from /api/meals
        const mealsResponse = await fetchMeals(userProfile);
        console.log('✅ Step 1: Fetched meals');
        
        // Step 2: Summarize meals by all dimensions
        const summary = summarizeMeals(mealsResponse.meals);
        console.log('✅ Step 2: Summarized meals');
        
        // Step 3: AI decides best 5 meals
        const recommendations = selectBestMeals(mealsResponse.meals, userProfile, 5);
        console.log('✅ Step 3: Selected best meals');
        
        const duration = Date.now() - startTime;
        
        return {
            executionId: `exec-${Date.now()}`,
            state: 'COMPLETED',
            outputs: {
                recommendations,
                summary,
                mealsFetched: mealsResponse.meals.length
            },
            duration
        };
    } catch (error) {
        console.error('Error in Kestra workflow:', error);
        throw error;
    }
}

// Try to call actual Kestra API
async function callKestraAPI(userProfile) {
    try {
        const executionUrl = `${KESTRA_URL}/api/v1/executions/${KESTRA_NAMESPACE}/${KESTRA_FLOW_ID}`;
        
        console.log(`🎼 Calling Kestra API: ${executionUrl}`);
        
        // Trigger workflow execution
        const triggerResponse = await axios.post(executionUrl, {
            inputs: {
                userProfile: JSON.stringify(userProfile)
            }
        }, {
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const executionId = triggerResponse.data.id;
        console.log(`✅ Kestra execution started: ${executionId}`);
        
        // Poll for completion
        const maxWaitTime = KESTRA_TIMEOUT;
        const pollInterval = 1000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            
            try {
                const statusResponse = await axios.get(
                    `${KESTRA_URL}/api/v1/executions/${executionId}`,
                    { timeout: 5000 }
                );
                
                const state = statusResponse.data.state?.current;
                
                if (state === 'SUCCESS' || state === 'COMPLETED') {
                    return {
                        executionId,
                        state: 'COMPLETED',
                        outputs: statusResponse.data.outputs || {},
                        duration: Date.now() - startTime
                    };
                } else if (state === 'FAILED' || state === 'KILLED') {
                    throw new Error(`Kestra execution ${state}`);
                }
            } catch (pollError) {
                // Continue polling
                console.log('Polling Kestra execution...');
            }
        }
        
        throw new Error('Kestra execution timeout');
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
            console.log('⚠️ Kestra not available, using mock workflow');
            return null;
        }
        throw error;
    }
}

// Helper functions
async function fetchMeals(userProfile) {
    // Filter meals by budget
    const filtered = allMeals.filter(m => m.cost <= userProfile.budget);
    
    // Sort by multiple criteria
    const sorted = filtered.sort((a, b) => {
        // Consider budget, carbon, and mood
        const scoreA = (userProfile.budget - a.cost) * 0.4 + 
                      (userProfile.carbon_limit - a.carbon) * 0.3 + 
                      a.rating * 0.3;
        const scoreB = (userProfile.budget - b.cost) * 0.4 + 
                      (userProfile.carbon_limit - b.carbon) * 0.3 + 
                      b.rating * 0.3;
        return scoreB - scoreA;
    });
    
    return {
        success: true,
        meals: sorted.slice(0, 10)
    };
}

function summarizeMeals(meals) {
    const totalCost = meals.reduce((sum, m) => sum + m.cost, 0);
    const totalCarbon = meals.reduce((sum, m) => sum + m.carbon, 0);
    const avgRating = meals.reduce((sum, m) => sum + m.rating, 0) / meals.length;
    
    return {
        totalMeals: meals.length,
        avgCost: Math.round((totalCost / meals.length) * 100) / 100,
        avgCarbon: Math.round((totalCarbon / meals.length) * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100,
        costRange: {
            min: Math.min(...meals.map(m => m.cost)),
            max: Math.max(...meals.map(m => m.cost))
        },
        carbonRange: {
            min: Math.min(...meals.map(m => m.carbon)),
            max: Math.max(...meals.map(m => m.carbon))
        }
    };
}

function selectBestMeals(meals, userProfile, limit) {
    // Score each meal based on user profile
    const scored = meals.map(meal => {
        const budgetScore = meal.cost <= userProfile.budget ? 1 : 0;
        const carbonScore = meal.carbon <= userProfile.carbon_limit ? 1 : 0;
        const ratingScore = meal.rating / 5;
        const totalScore = budgetScore * 0.3 + carbonScore * 0.3 + ratingScore * 0.4;
        
        return {
            meal,
            score: totalScore,
            reasoning: `Matches budget: ${budgetScore > 0}, carbon: ${carbonScore > 0}, rating: ${meal.rating}/5`
        };
    });
    
    // Sort by score and return top N
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, limit).map(item => ({
        mealId: item.meal.id,
        mealName: item.meal.name,
        cost: item.meal.cost,
        carbon: item.meal.carbon,
        rating: item.meal.rating,
        reasoning: item.reasoning,
        confidence: Math.round(item.score * 100) / 100
    }));
}

module.exports = async (req, res) => {
    try {
        const { userProfile } = req.body;
        
        // Validate input
        if (!userProfile || !userProfile.budget) {
            return res.status(400).json({
                success: false,
                error: 'userProfile with budget is required'
            });
        }
        
        // Set defaults
        userProfile.carbon_limit = userProfile.carbon_limit || 10;
        userProfile.mood = userProfile.mood || 'balanced';
        userProfile.dietary_preferences = userProfile.dietary_preferences || '';
        
        console.log(`🎼 Starting Kestra orchestration for user profile:`, userProfile);
        
        // Try to call actual Kestra API
        let orchestration = await callKestraAPI(userProfile);
        
        // Fallback to mock workflow if Kestra is not available
        if (!orchestration) {
            orchestration = await executeKestraWorkflow(userProfile);
        }
        
        res.json({
            success: true,
            orchestration,
            message: 'Kestra orchestration completed'
        });
    } catch (error) {
        console.error('Error in /api/orchestrate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to orchestrate meal planning workflow'
        });
    }
};











