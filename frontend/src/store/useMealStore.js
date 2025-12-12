import { create } from 'zustand';
import * as api from '../api';

const useMealStore = create((set, get) => ({
    meals: [],
    loading: false,
    error: null,
    mode: 'mood',
    budget: 500,
    filter: 'all', // all, veg, non-veg

    setMode: (mode) => set({ mode }),
    setBudget: (budget) => set({ budget }),
    setFilter: (filter) => set({ filter }),

    fetchMeals: async () => {
        set({ loading: true, error: null });
        const { mode, budget, filter } = get();

        try {
            // Construct Query for Agent
            const query = `Plan a ${mode} meal (budget: $${budget}) with ${filter !== 'all' ? filter : 'no'} restrictions.`;

            // Call Agent API
            const result = await api.getAgentPlan(query);

            if (result.success && result.plan) {
                // The agent returns { recommendation: "...", meals: [...] }
                // Map to UI format
                const rawMeals = result.plan.meals || [];
                const mealsWithUIProps = rawMeals.map((meal, index) => ({
                    id: `agent-meal-${index}`,
                    name: meal.item || meal.name,
                    // Parse price/cost
                    cost: meal.price || meal.cost || 0,
                    costRupees: Math.round((meal.price || meal.cost || 0) * 83),
                    // Mock data for UI that agent might not return yet
                    carbon: 0.5,
                    carbonGrams: 500,
                    prepTime: 20,
                    dietary: meal.type ? [meal.type] : [],
                    image: '/default-meal.jpg' // Placeholder
                }));

                set({ meals: mealsWithUIProps, loading: false });
            } else {
                set({ error: result.error || "Agent returned no plan", loading: false });
            }
        } catch (err) {
            set({ error: 'Failed to fetch meals from Agent', loading: false });
        }
    },

    rateMeal: async (mealId, rating) => {
        const { meals } = get();
        const meal = meals.find(m => m.id === mealId);
        // Optimistic update (optional, but good for UI)
        // For now just call API
        if (meal) {
            const mealFeatures = {
                name: meal.name,
                cost: meal.cost,
                carbon: meal.carbon
            };
            await api.rateMeal(mealId, rating, mealFeatures);
            await api.submitOumiFeedback(mealId, rating, mealFeatures);
            // Could refresh meals here or just notify
        }
    }
}));

export default useMealStore;
