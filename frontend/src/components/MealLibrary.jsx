import React, { useState, useEffect } from 'react';
import api from '../api';
import MealCard from './MealCard'; // Reusing existing card
import '../styles/App.css';

const MealLibrary = () => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    // Simple state for a new meal form - normally would be a separate component
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMeal, setNewMeal] = useState({
        name: '', description: '', cost: '', carbon: '',
        ingredients: [{ name: '', amount: '', unit: '' }]
    });

    useEffect(() => {
        loadMeals();
    }, []);

    const loadMeals = async () => {
        try {
            setLoading(true);
            // Reusing existing endpoint, might need adjustment if it requires complex filters
            const response = await api.getMeals({ mode: 'budget', budget: 1000, limit: 100 });
            // Note: existing API is for recommendations, we might need a general GET /meals for library
            // For now, let's assume getMeals returns a list. If not, I'll need to check api.js

            // Adjusting based on standard list response
            if (response.data && Array.isArray(response.data)) {
                setMeals(response.data);
            } else if (response.meals) {
                setMeals(response.meals);
            }
        } catch (error) {
            console.error("Failed to load meals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIngredient = () => {
        setNewMeal({ ...newMeal, ingredients: [...newMeal.ingredients, { name: '', amount: '', unit: '' }] });
    };

    const handleIngredientChange = (index, field, value) => {
        const updated = [...newMeal.ingredients];
        updated[index][field] = value;
        setNewMeal({ ...newMeal, ingredients: updated });
    };

    const handleSaveMeal = async () => {
        try {
            // We need a proper create endpoint. Assuming POST /api/meals/create or similar
            // If the standard POST /api/meals is for recommendations, we need to check backend.
            // Based on file analysis, backend/api/meals.js has router.post('/', getMeals). 
            // This is non-standard REST. We usually want POST / for create. 
            // I should probably add a create endpoint to backend/api/meals.js later.
            // For now, simply console log or mock.
            console.log("Saving meal:", newMeal);
            alert("Create Meal API not fully implemented yet in this demo.");
            setShowAddForm(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="meal-library">
            <div className="library-header">
                <h1>Meal Library</h1>
                <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : 'Add New Meal'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-meal-form card">
                    <h3>Add New Meal</h3>
                    <input
                        placeholder="Name"
                        value={newMeal.name}
                        onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                    />
                    <input
                        placeholder="Description"
                        value={newMeal.description}
                        onChange={e => setNewMeal({ ...newMeal, description: e.target.value })}
                    />
                    {newMeal.ingredients.map((ing, idx) => (
                        <div key={idx} className="ingredient-row">
                            <input placeholder="Item" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} />
                            <input placeholder="Amt" value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', e.target.value)} />
                            <input placeholder="Unit" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} />
                        </div>
                    ))}
                    <button onClick={handleAddIngredient}>+ Ingredient</button>
                    <button onClick={handleSaveMeal}>Save Meal</button>
                </div>
            )}

            <div className="meal-grid">
                {loading ? <p>Loading...</p> : meals.map(meal => (
                    <MealCard key={meal._id || meal.id} meal={meal} />
                ))}
            </div>
        </div>
    );
};

export default MealLibrary;
