// Frontend API Service Layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper for requests
async function request(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Request failed: ${endpoint}`, error);
        return { error: error.message };
    }
}

const api = {
    // Existing methods
    getMeals: (data) => request('POST', '/meals', data),
    rateMeal: (mealId, rating, mealFeatures) => request('POST', '/feedback', { mealId, rating, mealFeatures }),
    getRecommendations: (userProfile) => request('POST', '/recommend', { userProfile }),
    autoGenerateWithCline: (budget, familySize, preferences) => request('POST', '/auto-generate', { budget, familySize, preferences }),
    orchestrateWithKestra: (userProfile) => request('POST', '/orchestrate', { userProfile }),

    // Oumi methods
    getOumiStats: (action, data) => request('POST', '/oumi', { action, ...data }),
    submitOumiFeedback: (mealId, rating, mealFeatures) => request('POST', '/oumi', { action: 'feedback', mealId, rating, mealFeatures }),
    getOumiRecommendation: () => request('POST', '/oumi', { action: 'recommend' }),

    // Agent methods
    getAgentPlan: (query) => request('POST', '/agents/plan', { query }),

    // New Planner methods
    getPlan: (start, end) => request('GET', `/planner?startDate=${start}&endDate=${end}&userId=dummy`),
    savePlan: (data) => request('POST', '/planner', data),
    getShoppingList: (start, end) => request('GET', `/planner/shopping-list?startDate=${start}&endDate=${end}&userId=dummy`),
};

// Keep named exports for backward compatibility if needed, but wrapper them
export const getMeals = api.getMeals;
export const rateMeal = api.rateMeal;
export const getRecommendations = api.getRecommendations;
export const autoGenerateWithCline = api.autoGenerateWithCline;
export const orchestrateWithKestra = api.orchestrateWithKestra;
export const submitOumiFeedback = api.submitOumiFeedback;
export const getOumiRecommendation = api.getOumiRecommendation;
export const getAgentPlan = api.getAgentPlan;

export default api;


