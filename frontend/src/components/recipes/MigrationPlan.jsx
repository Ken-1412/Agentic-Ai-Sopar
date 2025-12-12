// Migration Plan Component
// Step-by-step guide for recipe improvement

import React, { useState } from 'react';
import './MigrationPlan.css';

const MigrationPlan = ({ plan }) => {
    const [completedPhases, setCompletedPhases] = useState([]);

    if (!plan || !plan.phases) {
        return <p>No migration plan available.</p>;
    }

    const togglePhase = (phaseNumber) => {
        if (completedPhases.includes(phaseNumber)) {
            setCompletedPhases(completedPhases.filter(p => p !== phaseNumber));
        } else {
            setCompletedPhases([...completedPhases, phaseNumber]);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ff4136',
            medium: '#ff851b',
            low: '#ffdc00',
        };
        return colors[priority] || '#cccccc';
    };

    return (
        <div className="migration-plan">
            <div className="plan-header">
                <h3>📋 Migration Plan</h3>
                <div className="plan-meta">
                    <span className="difficulty">
                        Difficulty: <strong>{plan.difficultyLevel}</strong>
                    </span>
                    <span className="time">
                        Total Time: <strong>{plan.totalEstimatedTime}</strong>
                    </span>
                </div>
            </div>

            <div className="phases-list">
                {plan.phases.map((phase) => (
                    <div
                        key={phase.phase}
                        className={`phase-card ${completedPhases.includes(phase.phase) ? 'completed' : ''}`}
                    >
                        <div className="phase-header">
                            <div className="phase-title-row">
                                <span className="phase-number">Phase {phase.phase}</span>
                                <h4>{phase.title}</h4>
                                <span
                                    className="priority-badge"
                                    style={{ backgroundColor: getPriorityColor(phase.priority) }}
                                >
                                    {phase.priority}
                                </span>
                            </div>
                            <p className="phase-description">{phase.description}</p>
                            <p className="phase-time">⏱️ Estimated time: {phase.estimatedTime}</p>
                        </div>

                        <div className="phase-tasks">
                            {phase.tasks.map((task, index) => (
                                <div key={index} className="task-item">
                                    <div className="task-header">
                                        <span className="task-issue">{task.issue.replace(/-/g, ' ')}</span>
                                    </div>
                                    <p className="task-action">
                                        <strong>Action:</strong> {task.action}
                                    </p>
                                    <p className="task-impact">
                                        <strong>Impact:</strong> {task.impact}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`phase-toggle ${completedPhases.includes(phase.phase) ? 'completed' : ''}`}
                            onClick={() => togglePhase(phase.phase)}
                        >
                            {completedPhases.includes(phase.phase) ? '✓ Completed' : 'Mark as Complete'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="plan-footer">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${(completedPhases.length / plan.phases.length) * 100}%`
                        }}
                    ></div>
                </div>
                <p className="progress-text">
                    {completedPhases.length} of {plan.phases.length} phases completed
                </p>
                {completedPhases.length === plan.phases.length && (
                    <div className="completion-message">
                        <h3>🎉 Congratulations!</h3>
                        <p>You've completed all migration phases. Your recipe is now healthier!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MigrationPlan;
