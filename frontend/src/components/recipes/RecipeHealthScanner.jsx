// Recipe Health Scanner Component
// Main component for analyzing recipe health

import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import MigrationPlan from './MigrationPlan';
import './RecipeHealthScanner.css';

const RecipeHealthScanner = ({ recipe, onClose }) => {
    const [analysis, setAnalysis] = useState(null);
    const [alternative, setAlternative] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('analysis'); // analysis, alternative,  migration

    // Analyze recipe on mount
    React.useEffect(() => {
        if (recipe) {
            analyzeRecipe();
        }
    }, [recipe]);

    const analyzeRecipe = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/recipes/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe }),
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
            }
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAlternative = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/recipes/healthier-alternative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe }),
            });

            const data = await response.json();
            if (data.success) {
                setAlternative(data);
                setActiveTab('alternative');
            }
        } catch (error) {
            console.error('Alternative generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!recipe) return null;

    return (
        <div className="recipe-health-scanner">
            <div className="scanner-header">
                <h2>🔍 Recipe Health Scanner</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Analyzing recipe...</p>
                </div>
            )}

            {analysis && (
                <>
                    <div className="scanner-tabs">
                        <button
                            className={activeTab === 'analysis' ? 'active' : ''}
                            onClick={() => setActiveTab('analysis')}
                        >
                            Analysis
                        </button>
                        <button
                            className={activeTab === 'alternative' ? 'active' : ''}
                            onClick={() => setActiveTab('alternative')}
                            disabled={!alternative}
                        >
                            Healthier Alternative
                        </button>
                        <button
                            className={activeTab === 'migration' ? 'active' : ''}
                            onClick={() => setActiveTab('migration')}
                            disabled={!alternative}
                        >
                            Migration Plan
                        </button>
                    </div>

                    <div className="scanner-content">
                        {activeTab === 'analysis' && (
                            <div className="analysis-view">
                                <div className="recipe-overview">
                                    <h3>{recipe.name}</h3>
                                    <SeverityBadge severity={analysis.severity} large />
                                    <div className="health-score">
                                        <div className="score-circle">
                                            <svg viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="#eee"
                                                    strokeWidth="10"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke={getScoreColor(analysis.healthScore)}
                                                    strokeWidth="10"
                                                    strokeDasharray={`${analysis.healthScore * 2.827} 282.7`}
                                                    transform="rotate(-90 50 50)"
                                                />
                                            </svg>
                                            <div className="score-value">{analysis.healthScore}</div>
                                        </div>
                                        <p>Health Score</p>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <h4>{analysis.summary.headline}</h4>
                                    <p>{analysis.summary.description}</p>
                                    <p className="action"><strong>{analysis.summary.action}</strong></p>
                                </div>

                                {analysis.issues.length > 0 && (
                                    <div className="issues-list">
                                        <h4>⚠️ Issues Detected ({analysis.issues.length})</h4>
                                        {analysis.issues.map((issue, index) => (
                                            <div key={index} className={`issue-card severity-${issue.severity}`}>
                                                <div className="issue-header">
                                                    <SeverityBadge severity={issue.severity} />
                                                    <span className="issue-type">{issue.type}</span>
                                                </div>
                                                <p className="issue-message">{issue.message}</p>
                                                <p className="issue-recommendation">
                                                    <strong>💡 Suggestion:</strong> {issue.recommendation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {analysis.issues.length > 0 && !alternative && (
                                    <button
                                        className="btn-primary btn-large"
                                        onClick={generateAlternative}
                                    >
                                        🌟 Generate Healthier Alternative
                                    </button>
                                )}

                                {analysis.aiAnalysis && (
                                    <div className="ai-analysis-card">
                                        <h4>🤖 AI Analysis</h4>
                                        <div className="ai-content">
                                            {typeof analysis.aiAnalysis === 'string'
                                                ? <p>{analysis.aiAnalysis}</p>
                                                : <pre>{JSON.stringify(analysis.aiAnalysis, null, 2)}</pre>
                                            }
                                        </div>
                                        <p className="ai-source">
                                            Source: {analysis.aiAnalysis.metadata?.source || 'AI'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'alternative' && alternative && (
                            <div className="alternative-view">
                                <div className="comparison-header">
                                    <div className="comparison-item">
                                        <h4>Original</h4>
                                        <p className="recipe-name">{alternative.originalRecipe.name}</p>
                                        <SeverityBadge severity={alternative.originalRecipe.severity} />
                                        <div className="score">{alternative.originalRecipe.healthScore}/100</div>
                                    </div>
                                    <div className="arrow">→</div>
                                    <div className="comparison-item improved">
                                        <h4>Improved</h4>
                                        <p className="recipe-name">{recipe.name} (Modified)</p>
                                        <SeverityBadge severity="clean" />
                                        <div className="score improved-score">
                                            {alternative.estimatedImprovement.healthScore}/100
                                        </div>
                                        <p className="improvement">
                                            +{alternative.estimatedImprovement.improvementPercentage} improvement
                                        </p>
                                    </div>
                                </div>

                                <div className="substitutions">
                                    <h4>🔄 Recommended Substitutions</h4>
                                    {alternative.substitutions.map((sub, index) => (
                                        <div key={index} className="substitution-card">
                                            <div className="substitution-row">
                                                <span className="original">{sub.original}</span>
                                                <span className="arrow">→</span>
                                                <span className="alternative">{sub.alternative}</span>
                                            </div>
                                            <p className="benefit">✨ {sub.benefit}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={() => setActiveTab('migration')}
                                >
                                    View Migration Plan →
                                </button>
                            </div>
                        )}

                        {activeTab === 'migration' && alternative && (
                            <MigrationPlan plan={alternative.migrationPlan} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

function getScoreColor(score) {
    if (score >= 80) return '#2ecc40';
    if (score >= 60) return '#ffdc00';
    if (score >= 40) return '#ff851b';
    return '#ff4136';
}

export default RecipeHealthScanner;
