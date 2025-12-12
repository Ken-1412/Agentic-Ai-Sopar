import React, { useEffect } from 'react';
import '../styles/App.css';
import MealCard from './MealCard';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';
import MealSlider from './MealSlider';
import InteractiveCanvas from './InteractiveCanvas';
import { motion } from 'framer-motion';
import useMealStore from '../store/useMealStore';

export default function Dashboard() {
    const {
        meals, loading, error, mode, budget, filter,
        setMode, setBudget, setFilter, fetchMeals, rateMeal
    } = useMealStore();

    // Local derived state for filtering (can also be in store, but fine here for UI logic)
    const filteredMeals = meals.filter(meal => {
        if (filter === 'all') return true;

        const lowerName = meal.name.toLowerCase();
        // Check dietary tags if available from DB
        if (meal.dietary && meal.dietary.length > 0) {
            if (filter === 'veg') {
                return meal.dietary.includes('Vegetarian') || meal.dietary.includes('Vegan');
            }
            if (filter === 'non-veg') {
                // Assuming non-veg if not veg/vegan? OR specific tag.
                // Simple logic: if logic below fails, use tags
                return !meal.dietary.includes('Vegetarian') && !meal.dietary.includes('Vegan');
            }
        }

        // Fallback to name matching (Original Logic)
        if (filter === 'veg') {
            return (
                lowerName.includes('vegetable') || lowerName.includes('quinoa') ||
                lowerName.includes('lentil') || lowerName.includes('bean') ||
                lowerName.includes('chickpea') || lowerName.includes('paneer') ||
                lowerName.includes('biryani') || lowerName.includes('dal') ||
                lowerName.includes('salad')
            );
        } else if (filter === 'non-veg') {
            return (
                lowerName.includes('chicken') || lowerName.includes('fish') ||
                lowerName.includes('meat') || lowerName.includes('pork') ||
                lowerName.includes('beef')
            );
        }
        return true;
    });

    return (
        <div className="sapor-app">
            {/* Header with Navigation */}
            <header className="sapor-header">
                <div className="logo">
                    <img src="/logo.jpg" alt="Sapor Logo" className="logo-icon-img" style={{ height: '40px', borderRadius: '50%' }} />
                    <span className="logo-text">SAPOR</span>
                </div>
                <nav className="header-nav">
                    <a href="#how-it-works">Intelligence</a>
                    <a href="#about">System</a>
                </nav>
            </header>

            {/* Main Content */}
            <main className="sapor-main">
                {/* Hero Section */}
                <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
                    <InteractiveCanvas />
                    <motion.div
                        className="ai-tag"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ position: 'relative', zIndex: 2 }}
                    >
                        <span>❖</span> AI-Powered Nutrition
                    </motion.div>
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ position: 'relative', zIndex: 2 }}
                    >
                        Intelligent Meal Planning
                    </motion.h1>
                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ position: 'relative', zIndex: 2 }}
                    >
                        Experience the future of dietary management with our advanced AI algorithms.
                        Optimizing your nutrition, carbon footprint, and lifestyle.
                    </motion.p>

                    {/* Featured Meals Slider - Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="hero-slider-wrapper"
                    >
                        <MealSlider
                            meals={meals.slice(0, 8)}
                            reverse={false}
                            size="medium"
                        />
                    </motion.div>
                </section>

                {/* Featured Meals Preview - Dual Direction Sliders */}
                {meals.length > 0 && (
                    <section className="featured-preview-section">
                        <h3 className="preview-title">Featured Recommendations</h3>
                        <div className="dual-sliders">
                            <MealSlider
                                meals={meals.filter((_, i) => i % 2 === 0).slice(0, 6)}
                                reverse={false}
                                size="small"
                            />
                            <MealSlider
                                meals={meals.filter((_, i) => i % 2 === 1).slice(0, 6)}
                                reverse={true}
                                size="small"
                            />
                        </div>
                    </section>
                )}

                {/* Mode Selection */}
                <section className="mode-section">
                    <h2 className="section-title">Choose Your Mode</h2>
                    <div className="mode-cards">
                        <div
                            className={`mode - card ${mode === 'budget' ? 'active' : ''} `}
                            onClick={() => setMode('budget')}
                        >
                            <div className="mode-icon budget-icon">💰</div>
                            <h3>Budget</h3>
                            <p>Cheapest meals first</p>
                        </div>
                        <div
                            className={`mode - card ${mode === 'carbon' ? 'active' : ''} `}
                            onClick={() => setMode('carbon')}
                        >
                            <div className="mode-icon carbon-icon">🌿</div>
                            <h3>Carbon</h3>
                            <p>Lowest emissions first</p>
                        </div>
                        <div
                            className={`mode - card ${mode === 'mood' ? 'active' : ''} `}
                            onClick={() => setMode('mood')}
                        >
                            <div className="mode-icon mood-icon">❤️</div>
                            <h3>Mood</h3>
                            <p>Highest rated first</p>
                        </div>
                    </div>
                </section>

                {/* Budget Slider */}
                <section className="budget-section">
                    <GlassCard>
                        <h2 className="section-title" style={{ marginBottom: '20px', fontSize: '24px' }}>Daily Budget</h2>
                        <div className="budget-slider-container" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                            <div className="budget-range">
                                <span>₹100</span>
                                <span>₹1000</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="50"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="budget-slider"
                            />
                            <div className="budget-display">
                                <span className="budget-value">₹{budget}</span>
                            </div>
                        </div>
                    </GlassCard>
                </section>

                {/* Get Recommendations Button */}
                <div className="recommendations-button-container">
                    <NeonButton
                        onClick={fetchMeals}
                        disabled={loading}
                    >
                        Get Recommendations
                        <span className="arrow">►</span>
                    </NeonButton>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Meals Section */}
                {meals.length > 0 && (
                    <section className="meals-section">
                        <div className="meals-header">
                            <h2 className="section-title">Top Rated for You</h2>
                            <p className="meals-subtitle">
                                {filteredMeals.length} meals within your ₹{budget} budget
                            </p>
                        </div>

                        {/* Filter Buttons */}
                        <div className="filter-buttons">
                            <button
                                className={`filter - btn ${filter === 'all' ? 'active' : ''} `}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter - btn ${filter === 'veg' ? 'active' : ''} `}
                                onClick={() => setFilter('veg')}
                            >
                                <span className="filter-icon">☘</span> Veg
                            </button>
                            <button
                                className={`filter - btn ${filter === 'non-veg' ? 'active' : ''} `}
                                onClick={() => setFilter('non-veg')}
                            >
                                <span className="filter-icon">🍖</span> Non-Veg
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading delicious meals...</p>
                            </div>
                        )}

                        {/* Meals Grid */}
                        {!loading && filteredMeals.length > 0 && (
                            <div className="meals-grid">
                                {filteredMeals.map(meal => (
                                    <MealCard
                                        key={meal.id}
                                        meal={meal}
                                        onRate={rateMeal}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filteredMeals.length === 0 && (
                            <div className="no-meals">
                                <p>No meals found for the selected filter. Try adjusting your preferences!</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Empty State with Slider */}
                {meals.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>👆 Click "Get Recommendations" to discover amazing meals!</p>
                        <div className="empty-state-slider">
                            <MealSlider
                                meals={[
                                    { id: 1, name: 'Grilled Chicken' },
                                    { id: 2, name: 'Quinoa Bowl' },
                                    { id: 3, name: 'Lentil Curry' },
                                    { id: 4, name: 'Fish & Asparagus' },
                                    { id: 5, name: 'Paneer Tikka' },
                                    { id: 6, name: 'Vegetable Biryani' },
                                    { id: 7, name: 'Dal Makhani' },
                                    { id: 8, name: 'Mediterranean Salad' }
                                ]}
                                reverse={false}
                                size="large"
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="sapor-footer">
                <p>Built with AI-powered recommendations • SAPOR © 2024</p>
            </footer>
        </div>
    );
}
