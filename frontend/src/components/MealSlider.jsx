import React from 'react';
import '../styles/MealSlider.css';

/**
 * Auto-scrolling meal slider component
 * Displays meals in an infinite scrolling carousel
 */
export default function MealSlider({ meals = [], reverse = false, size = 'medium' }) {
    // Generate meal images/placeholders
    const mealItems = meals.length > 0 
        ? meals.slice(0, 10) // Limit to 10 items
        : Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            name: `Meal ${i + 1}`,
            image: null
        }));

    const sliderWidth = size === 'large' ? '200px' : size === 'small' ? '80px' : '120px';
    const sliderHeight = size === 'large' ? '200px' : size === 'small' ? '80px' : '120px';

    return (
        <div 
            className={`meal-slider ${reverse ? 'reverse' : ''}`}
            style={{
                '--width': sliderWidth,
                '--height': sliderHeight,
                '--quantity': mealItems.length
            }}
        >
            <div className="slider-list">
                {mealItems.map((meal, index) => (
                    <div 
                        key={meal.id || index}
                        className="slider-item"
                        style={{ '--position': index + 1 }}
                    >
                        {meal.image ? (
                            <img src={meal.image} alt={meal.name} />
                        ) : (
                            <div className="meal-placeholder">
                                <div className="meal-icon">🍽️</div>
                                <div className="meal-name">{meal.name}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}





