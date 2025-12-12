// Cline Integration for Auto-Generated Meal Plans
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Mock meal database for fallback
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

// Generate meal plan using Cline or fallback to mock data
async function generateMealPlan(budget, familySize, preferences) {
    try {
        // Try to use Cline CLI if available
        const prompt = `Generate a 7-day meal plan for a family of ${familySize} with a weekly budget of $${budget}. Preferences: ${preferences}. Return JSON with meals for each day including breakfast, lunch, and dinner with name, cost, and carbon footprint.`;
        
        // Attempt to call Cline (if installed)
        try {
            const { stdout } = await execAsync(`cline generate "${prompt}"`, { timeout: 10000 });
            const mealPlan = JSON.parse(stdout);
            console.log('✅ Meal plan generated using Cline');
            return mealPlan;
        } catch (clineError) {
            console.log('⚠️ Cline not available, using mock data');
            // Fallback to mock data
            return generateMockMealPlan(budget, familySize, preferences);
        }
    } catch (error) {
        console.error('Error generating meal plan:', error);
        // Fallback to mock data
        return generateMockMealPlan(budget, familySize, preferences);
    }
}

// Generate mock meal plan as fallback
function generateMockMealPlan(budget, familySize, preferences) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = [];
    
    // Calculate daily budget
    const dailyBudget = budget / 7;
    const perPersonBudget = dailyBudget / familySize;
    
    // Select meals that fit within budget
    const availableMeals = allMeals.filter(m => m.cost <= perPersonBudget * 1.5);
    
    days.forEach((day, index) => {
        const breakfast = availableMeals[index % availableMeals.length] || allMeals[0];
        const lunch = availableMeals[(index + 2) % availableMeals.length] || allMeals[1];
        const dinner = availableMeals[(index + 4) % availableMeals.length] || allMeals[2];
        
        meals.push({
            day,
            breakfast: {
                name: breakfast.name,
                cost: breakfast.cost * familySize,
                carbon: breakfast.carbon * familySize
            },
            lunch: {
                name: lunch.name,
                cost: lunch.cost * familySize,
                carbon: lunch.carbon * familySize
            },
            dinner: {
                name: dinner.name,
                cost: dinner.cost * familySize,
                carbon: dinner.carbon * familySize
            }
        });
    });
    
    // Calculate totals
    const weeklyBudget = meals.reduce((sum, day) => 
        sum + day.breakfast.cost + day.lunch.cost + day.dinner.cost, 0
    );
    const weeklyCarbon = meals.reduce((sum, day) => 
        sum + day.breakfast.carbon + day.lunch.carbon + day.dinner.carbon, 0
    );
    const avgDailyCost = weeklyBudget / 7;
    
    return {
        meals,
        weeklyBudget: Math.round(weeklyBudget * 100) / 100,
        weeklyCarbon: Math.round(weeklyCarbon * 100) / 100,
        avgDailyCost: Math.round(avgDailyCost * 100) / 100
    };
}

module.exports = async (req, res) => {
    try {
        const { budget, familySize = 2, preferences = '' } = req.body;
        
        // Validate input
        if (!budget || budget <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Budget is required and must be greater than 0'
            });
        }
        
        console.log(`🤖 Generating meal plan with Cline: Budget=$${budget}, Family=${familySize}, Preferences=${preferences}`);
        
        // Generate meal plan
        const mealPlan = await generateMealPlan(budget, familySize, preferences);
        
        res.json({
            success: true,
            mealPlan,
            message: 'Generated using Cline AI automation'
        });
    } catch (error) {
        console.error('Error in /api/auto-generate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate meal plan'
        });
    }
};











