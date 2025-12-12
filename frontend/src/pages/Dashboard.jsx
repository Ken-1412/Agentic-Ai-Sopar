import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PreferenceManager from '../components/PreferenceManager';
import ModelStatus from '../components/ModelStatus';
import RecommendationCard from '../components/RecommendationCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updatePreferences, trainModel, getRecommendations } = useAuthStore();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/signin');
        }
    }, [user, navigate]);

    const handleUpdatePreferences = async (preferences) => {
        try {
            await updatePreferences(preferences);
            setMessage({ type: 'success', text: '✓ Preferences saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: '✗ Failed to save preferences' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleTrain = async () => {
        try {
            setMessage({ type: 'info', text: '🤖 Training your model...' });
            await trainModel();
            setMessage({ type: 'success', text: '✓ Model trained successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: '✗ Training failed: ' + error.message });
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleGetRecommendations = async () => {
        setLoading(true);
        try {
            const meals = await getRecommendations();
            setRecommendations(meals);
            setMessage({ type: 'success', text: `✓ Found ${meals.length} personalized meals!` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: '✗ Failed to get recommendations' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleRateMeal = async (mealId, rating) => {
        // TODO: Implement rating endpoint
        console.log('Rating meal:', mealId, rating);
    };

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <span className="logo-emoji">🍽️</span>
                        <h1 className="dashboard-title">SAPOR</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                            <div className="user-details">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Message Toast */}
            {message && (
                <div className={`message-toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-grid">
                    {/* Left Column - Preferences */}
                    <div className="dashboard-column dashboard-left">
                        <div className="card glass-effect">
                            <PreferenceManager
                                preferences={user.preferences}
                                onUpdate={handleUpdatePreferences}
                            />
                        </div>
                    </div>

                    {/* Right Column - Model Status & Recommendations */}
                    <div className="dashboard-column dashboard-right">
                        <div className="card glass-effect">
                            <ModelStatus onTrain={handleTrain} />
                        </div>

                        <div className="card glass-effect recommendations-section">
                            <h3 className="section-title">
                                <span className="emoji">🎯</span>
                                Personalized Recommendations
                            </h3>

                            <button
                                onClick={handleGetRecommendations}
                                disabled={loading}
                                className="get-recommendations-btn"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        🍽️ Get Recommendations
                                    </>
                                )}
                            </button>

                            {recommendations.length > 0 && (
                                <div className="recommendations-grid">
                                    {recommendations.map(meal => (
                                        <RecommendationCard
                                            key={meal._id}
                                            meal={meal}
                                            onRate={handleRateMeal}
                                        />
                                    ))}
                                </div>
                            )}

                            {recommendations.length === 0 && !loading && (
                                <div className="empty-recommendations">
                                    <span className="empty-icon">🍽️</span>
                                    <p>Click "Get Recommendations" to discover meals tailored to your preferences!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
