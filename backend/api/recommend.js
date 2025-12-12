// Simple recommendation logic
const allMeals = [
    {
        id: 1,
        name: 'Grilled Chicken Salad',
        cost: 8.50,
        carbon: 2.1,
        rating: 4.2
    },
    {
        id: 2,
        name: 'Vegetable Stir Fry',
        cost: 6.00,
        carbon: 1.2,
        rating: 4.0
    },
    {
        id: 3,
        name: 'Quinoa Buddha Bowl',
        cost: 9.00,
        carbon: 1.8,
        rating: 4.5
    },
    {
        id: 4,
        name: 'Lentil Curry',
        cost: 5.50,
        carbon: 0.9,
        rating: 4.1
    }
];

module.exports = async (req, res) => {
    try {
        const { userProfile } = req.body;

        // Simple filtering logic
        let recommendations = allMeals
            .filter(m => m.cost <= userProfile.budget)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        res.json({
            success: true,
            recommendations: recommendations.map(m => ({
                mealId: m.id,
                mealName: m.name,
                reasoning: `Good match for your preferences - Budget: $${m.cost}, Carbon: ${m.carbon}kg, Rating: ${m.rating}/5`,
                confidence: 0.85
            }))
        });
    } catch (error) {
        console.error('Error in /api/recommend:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recommendations',
            recommendations: []
        });
    }
};
