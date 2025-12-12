const openaiClient = require('../config/openai');

/**
 * OpenAI Response Generation Service
 * Generates natural language responses using GPT-4
 */

/**
 * Format search results into context template for LLM
 */
function formatContext(meals) {
    if (!meals || meals.length === 0) {
        return 'No meals found matching your criteria.';
    }

    return meals.map((meal, index) => `
Meal ${index + 1}: ${meal.name}
Description: ${meal.description}
Cost: $${meal.cost?.toFixed(2) || 'N/A'}
Carbon Footprint: ${meal.carbon?.toFixed(2) || 'N/A'} kg CO2
Calories: ${meal.calories || 'N/A'} kcal
Protein: ${meal.protein || 'N/A'}g
Dietary: ${Array.isArray(meal.dietary) ? meal.dietary.join(', ') : meal.dietary || 'None'}
Cuisine: ${meal.cuisine || 'Various'}
Rating: ${meal.rating ? `${meal.rating}/5 ⭐` : 'Not rated'}
---`).join('\n');
}

/**
 * Generate AI response to user question
 * @param {string} question - User's question
 * @param {Array} searchResults - Meals from Elasticsearch search
 * @returns {Promise<string>} - AI-generated response
 */
async function generateResponse(question, searchResults) {
    const client = openaiClient.getClient();

    // Fallback if OpenAI not configured
    if (!openaiClient.isReady()) {
        return generateFallbackResponse(question, searchResults);
    }

    const config = openaiClient.getConfig();
    const context = formatContext(searchResults);

    try {
        const completion = await client.chat.completions.create({
            model: config.model,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            messages: [
                {
                    role: 'system',
                    content: `You're a helpful meal planning assistant for the SAPOR meal recommendation system. 
          
Your role is to answer questions about meals based on the provided meal data. 

Guidelines:
- Be friendly, conversational, and helpful
- Only use information from the CONTEXT provided
- If the context doesn't contain enough information to answer, say "I don't have that information in my database"
- Highlight key details like cost, nutrition, dietary info, and sustainability (carbon footprint)
- Suggest specific meals from the context when relevant
- Be concise but informative
- Use emojis occasionally to make responses engaging (🥗🍕🌱💚)`
                },
                {
                    role: 'user',
                    content: `QUESTION: ${question}

CONTEXT (Available Meals):
${context}

Please answer the question based on the meals listed in the CONTEXT.`
                }
            ]
        });

        const response = completion.choices[0]?.message?.content || 'Unable to generate response.';

        console.log('🤖 Generated AI response');
        return response;

    } catch (error) {
        console.error('❌ OpenAI API Error:', error.message);

        // Fallback to template-based response
        return generateFallbackResponse(question, searchResults);
    }
}

/**
 * Generate template-based response when OpenAI is unavailable
 */
function generateFallbackResponse(question, searchResults) {
    if (!searchResults || searchResults.length === 0) {
        return `I couldn't find any meals matching your query: "${question}". Try broadening your search or asking about specific cuisines, dietary preferences, or meal types.`;
    }

    const mealList = searchResults.map((meal, i) =>
        `${i + 1}. **${meal.name}** - $${meal.cost?.toFixed(2)} (${meal.cuisine || 'Various'}, ${meal.calories || 'N/A'} cal)`
    ).join('\n');

    return `Based on your question "${question}", I found ${searchResults.length} meal${searchResults.length > 1 ? 's' : ''}:

${mealList}

💡 **Note**: For detailed AI-powered responses, please configure your OpenAI API key.`;
}

/**
 * Generate a summary of multiple meals
 */
async function generateMealSummary(meals) {
    if (!meals || meals.length === 0) {
        return 'No meals to summarize.';
    }

    const stats = {
        count: meals.length,
        avgCost: (meals.reduce((sum, m) => sum + (m.cost || 0), 0) / meals.length).toFixed(2),
        avgCarbon: (meals.reduce((sum, m) => sum + (m.carbon || 0), 0) / meals.length).toFixed(2),
        avgCalories: Math.round(meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length),
        cuisines: [...new Set(meals.map(m => m.cuisine).filter(Boolean))],
        dietary: [...new Set(meals.flatMap(m => m.dietary || []))].filter(d => d !== 'None')
    };

    return `Found ${stats.count} meals with:
• Average cost: $${stats.avgCost}
• Average carbon: ${stats.avgCarbon} kg CO2
• Average calories: ${stats.avgCalories} kcal
• Cuisines: ${stats.cuisines.join(', ') || 'Various'}
• Dietary options: ${stats.dietary.join(', ') || 'Standard'}`;
}

module.exports = {
    generateResponse,
    generateMealSummary,
    formatContext
};
