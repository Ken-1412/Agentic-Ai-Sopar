import '../styles/Dashboard.css';

const RecommendationCard = ({ meal, onRate }) => {
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                className={`star ${i < rating ? 'filled' : ''}`}
                onClick={() => onRate && onRate(meal._id, i + 1)}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="recommendation-card">
            <div className="rec-card-header">
                <h4 className="rec-card-title">{meal.name}</h4>
                {meal.cuisine && (
                    <span className="rec-card-badge">{meal.cuisine}</span>
                )}
            </div>

            <p className="rec-card-description">{meal.description}</p>

            <div className="rec-card-stats">
                <div className="stat">
                    <span className="stat-icon">💰</span>
                    <span className="stat-label">Cost</span>
                    <span className="stat-value">${meal.cost.toFixed(2)}</span>
                </div>

                <div className="stat">
                    <span className="stat-icon">🌱</span>
                    <span className="stat-label">Carbon</span>
                    <span className="stat-value">{meal.carbon.toFixed(1)}kg</span>
                </div>

                {meal.calories && (
                    <div className="stat">
                        <span className="stat-icon">🔥</span>
                        <span className="stat-label">Cal</span>
                        <span className="stat-value">{meal.calories}</span>
                    </div>
                )}

                {meal.protein && (
                    <div className="stat">
                        <span className="stat-icon">💪</span>
                        <span className="stat-label">Protein</span>
                        <span className="stat-value">{meal.protein}g</span>
                    </div>
                )}
            </div>

            {meal.dietary && meal.dietary.length > 0 && (
                <div className="rec-card-tags">
                    {meal.dietary.filter(d => d !== 'None').map(diet => (
                        <span key={diet} className="dietary-tag">{diet}</span>
                    ))}
                </div>
            )}

            {onRate && (
                <div className="rec-card-rating">
                    <span className="rating-label">Rate this meal:</span>
                    <div className="stars">
                        {renderStars(meal.userRating || 0)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationCard;
