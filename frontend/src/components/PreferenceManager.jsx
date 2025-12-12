import { useState } from 'react';
import '../styles/Dashboard.css';

const PreferenceManager = ({ preferences, onUpdate }) => {
    const [tastes, setTastes] = useState(preferences.tastes || []);
    const [moods, setMoods] = useState(preferences.moods || []);
    const [carbonPreference, setCarbonPreference] = useState(preferences.carbonPreference || 'medium');
    const [newTaste, setNewTaste] = useState('');
    const [newMood, setNewMood] = useState('');

    const commonTastes = ['spicy', 'sweet', 'savory', 'sour', 'bitter', 'umami', 'salty'];
    const commonMoods = ['cozy', 'energetic', 'relaxed', 'focused', 'social', 'adventurous'];

    const addTaste = (taste) => {
        if (taste && !tastes.includes(taste.toLowerCase())) {
            const updated = [...tastes, taste.toLowerCase()];
            setTastes(updated);
            setNewTaste('');
        }
    };

    const removeTaste = (taste) => {
        setTastes(tastes.filter(t => t !== taste));
    };

    const addMood = (mood) => {
        if (mood && !moods.includes(mood.toLowerCase())) {
            const updated = [...moods, mood.toLowerCase()];
            setMoods(updated);
            setNewMood('');
        }
    };

    const removeMood = (mood) => {
        setMoods(moods.filter(m => m !== mood));
    };

    const handleSave = () => {
        onUpdate({
            tastes,
            moods,
            carbonPreference
        });
    };

    return (
        <div className="preference-manager">
            <div className="preference-section">
                <h3 className="preference-title">
                    <span className="emoji">🎨</span>
                    Your Tastes
                </h3>

                <div className="tags-container">
                    {tastes.map(taste => (
                        <span key={taste} className="preference-tag taste-tag">
                            {taste}
                            <button onClick={() => removeTaste(taste)} className="tag-remove">×</button>
                        </span>
                    ))}
                </div>

                <div className="add-preference">
                    <input
                        type="text"
                        value={newTaste}
                        onChange={(e) => setNewTaste(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTaste(newTaste)}
                        placeholder="Add a taste..."
                        className="preference-input"
                    />
                    <button onClick={() => addTaste(newTaste)} className="add-btn">+</button>
                </div>

                <div className="quick-add">
                    Quick add:
                    {commonTastes.filter(t => !tastes.includes(t)).slice(0, 4).map(taste => (
                        <button key={taste} onClick={() => addTaste(taste)} className="quick-add-btn">
                            {taste}
                        </button>
                    ))}
                </div>
            </div>

            <div className="preference-section">
                <h3 className="preference-title">
                    <span className="emoji">😊</span>
                    Your Moods
                </h3>

                <div className="tags-container">
                    {moods.map(mood => (
                        <span key={mood} className="preference-tag mood-tag">
                            {mood}
                            <button onClick={() => removeMood(mood)} className="tag-remove">×</button>
                        </span>
                    ))}
                </div>

                <div className="add-preference">
                    <input
                        type="text"
                        value={newMood}
                        onChange={(e) => setNewMood(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMood(newMood)}
                        placeholder="Add a mood..."
                        className="preference-input"
                    />
                    <button onClick={() => addMood(newMood)} className="add-btn">+</button>
                </div>

                <div className="quick-add">
                    Quick add:
                    {commonMoods.filter(m => !moods.includes(m)).slice(0, 4).map(mood => (
                        <button key={mood} onClick={() => addMood(mood)} className="quick-add-btn">
                            {mood}
                        </button>
                    ))}
                </div>
            </div>

            <div className="preference-section">
                <h3 className="preference-title">
                    <span className="emoji">🌱</span>
                    Carbon Preference
                </h3>

                <div className="carbon-options">
                    <label className={`carbon-option ${carbonPreference === 'low' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="carbon"
                            value="low"
                            checked={carbonPreference === 'low'}
                            onChange={(e) => setCarbonPreference(e.target.value)}
                        />
                        <span className="carbon-label">
                            <span className="carbon-icon">🌿</span>
                            Low
                        </span>
                    </label>

                    <label className={`carbon-option ${carbonPreference === 'medium' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="carbon"
                            value="medium"
                            checked={carbonPreference === 'medium'}
                            onChange={(e) => setCarbonPreference(e.target.value)}
                        />
                        <span className="carbon-label">
                            <span className="carbon-icon">🍃</span>
                            Medium
                        </span>
                    </label>

                    <label className={`carbon-option ${carbonPreference === 'high' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="carbon"
                            value="high"
                            checked={carbonPreference === 'high'}
                            onChange={(e) => setCarbonPreference(e.target.value)}
                        />
                        <span className="carbon-label">
                            <span className="carbon-icon">🌍</span>
                            High
                        </span>
                    </label>
                </div>
            </div>

            <button onClick={handleSave} className="save-preferences-btn">
                💾 Save Preferences
            </button>
        </div>
    );
};

export default PreferenceManager;
