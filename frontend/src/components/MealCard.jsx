import React, { useState, useEffect } from 'react';
import SeverityBadge from './recipes/SeverityBadge';
import RecipeHealthScanner from './recipes/RecipeHealthScanner';

export default function MealCard({ meal, onRate }) {
    const [rating, setRating] = useState(0);
    const [rated, setRated] = useState(false);
    const [healthAnalysis, setHealthAnalysis] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [analyzingHealth, setAnalyzingHealth] = useState(false);

    // Analyze meal health on mount (cached for performance)
    useEffect(() => {
        analyzeHealth();
    }, [meal.id]);

    const analyzeHealth = async () => {
        setAnalyzingHealth(true);
        try {
            const response = await fetch('/api/recipes/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipe: {
                        name: meal.name,
                        calories: meal.calories || 500,
                        sodium: meal.sodium || 800,
                        sugar: meal.sugar || 10,
                        saturatedFat: meal.saturatedFat || 8,
                        transFat: meal.transFat || 0,
                        carbonFootprint: meal.carbon || 2,
                        cost: meal.cost || 5,
                        cookTime: meal.prepTime || 25,
                        protein: meal.protein || 20,
                        carbs: meal.carbs || 45,
                        fat: meal.fat || 15,
                    },
                }),
            });

            const data = await response.json();
            if (data.success) {
                setHealthAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Failed to analyze meal health:', error);
        } finally {
            setAnalyzingHealth(false);
        }
    };

    const handleRate = async (stars) => {
        setRating(stars);
        setRated(true);
        await onRate(meal.id, stars);
    };

    // Determine tags based on meal name
    const getTags = () => {
        const tags = [];
        const name = meal.name.toLowerCase();

        if (name.includes('vegetable') || name.includes('quinoa') || name.includes('lentil') ||
            name.includes('bean') || name.includes('chickpea') || name.includes('paneer') ||
            name.includes('biryani') || name.includes('dal')) {
            tags.push({ text: 'Vegetarian', color: 'green' });
        }

        if (name.includes('chicken') || name.includes('fish') || name.includes('meat')) {
            tags.push({ text: 'Non-Veg', color: 'gray' });
        }

        if (name.includes('quinoa') || name.includes('chicken') || name.includes('paneer')) {
            tags.push({ text: 'High Protein', color: 'purple' });
        }

        if (name.includes('spicy') || name.includes('tikka')) {
            tags.push({ text: 'Spicy', color: 'gray' });
        }

        if (name.includes('fish')) {
            tags.push({ text: 'Omega-3', color: 'gray' });
        }

        if (name.includes('curry') || name.includes('dal')) {
            tags.push({ text: 'Comfort', color: 'gray' });
        }

        if (name.includes('salad') || name.includes('bowl')) {
            tags.push({ text: 'Quick', color: 'gray' });
        }

        // Default tags if none match
        if (tags.length === 0) {
            tags.push({ text: 'Classic', color: 'green' });
        }

        return tags.slice(0, 2); // Max 2 tags
    };

    const tags = getTags();

    return (
        <>
            <div className="sapor-meal-card">
                {/* Meal Image Placeholder */}
                <div className="meal-image">
                    <div className="meal-image-placeholder">
                        {meal.name.charAt(0)}
                    </div>

                    {/* Tags Overlay */}
                    <div className="meal-tags">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className={`meal-tag tag-${tag.color}`}
                            >
                                {tag.text}
                            </span>
                        ))}
                    </div>

                    {/* Health Badge - NEW! */}
                    {healthAnalysis && (
                        <div className="health-badge-overlay">
                            <SeverityBadge severity={healthAnalysis.severity} />
                        </div>
                    )}

                    {analyzingHealth && (
                        <div className="analyzing-badge">
                            <span className="spinner-small"></span>
                        </div>
                    )}
                </div>

                {/* Meal Content */}
                <div className="meal-content">
                    <h3 className="meal-title">{meal.name}</h3>
                    <p className="meal-description">{meal.description}</p>

                    {/* Health Score Bar - NEW! */}
                    {healthAnalysis && (
                        <div className="health-score-bar">
                            <div className="score-label">
                                Health: {healthAnalysis.healthScore}/100
                            </div>
                            <div className="score-bar">
                                <div
                                    className="score-fill"
                                    style={{
                                        width: `${healthAnalysis.healthScore}%`,
                                        background: healthAnalysis.healthScore >= 80 ? '#2ecc40' :
                                            healthAnalysis.healthScore >= 60 ? '#ffdc00' :
                                                healthAnalysis.healthScore >= 40 ? '#ff851b' : '#ff4136'
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Meal Details */}
                    <div className="meal-details">
                        <div className="meal-detail-item">
                            <span className="detail-label">₹{meal.costRupees || Math.round(meal.cost * 83)}</span>
                        </div>
                        <div className="meal-detail-item">
                            <span className="detail-icon">🌿</span>
                            <span className="detail-label">{meal.carbonGrams || Math.round(meal.carbon * 1000)}g CO₂</span>
                        </div>
                        <div className="meal-detail-item">
                            <span className="detail-icon">⏱️</span>
                            <span className="detail-label">{meal.prepTime || 25}m</span>
                        </div>
                    </div>

                    {/* Issue Count - NEW! */}
                    {healthAnalysis && healthAnalysis.issues && healthAnalysis.issues.length > 0 && (
                        <div className="health-issues-preview">
                            <span className="issue-count">
                                ⚠️ {healthAnalysis.issues.length} issue{healthAnalysis.issues.length !== 1 ? 's' : ''} found
                            </span>
                            <button
                                className="view-details-btn"
                                onClick={() => setShowScanner(true)}
                            >
                                View Details
                            </button>
                        </div>
                    )}

                    {/* Rating Section */}
                    <div className="meal-rating">
                        <p className="rating-label">Your rating</p>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    className={`star ${star <= rating ? 'active' : ''}`}
                                    type="button"
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                        {rated && <p className="rating-saved">Rating saved!</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="meal-actions">
                        <button className="cook-button">
                            <span>👨‍🍳</span> Cook
                        </button>

                        {/* Health Scanner Button - NEW! */}
                        <button
                            className="analyze-button"
                            onClick={() => setShowScanner(true)}
                        >
                            <span>🔍</span> Analyze Health
                        </button>
                    </div>
                </div>
            </div>

            {/* Recipe Health Scanner Modal */}
            {showScanner && (
                <RecipeHealthScanner
                    recipe={{
                        name: meal.name,
                        calories: meal.calories || 500,
                        sodium: meal.sodium || 800,
                        sugar: meal.sugar || 10,
                        saturatedFat: meal.saturatedFat || 8,
                        transFat: meal.transFat || 0,
                        carbonFootprint: meal.carbon || 2,
                        cost: meal.cost || 5,
                        cookTime: meal.prepTime || 25,
                        protein: meal.protein || 20,
                        carbs: meal.carbs || 45,
                        fat: meal.fat || 15,
                        ingredients: meal.ingredients || [],
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </>
    );
}
