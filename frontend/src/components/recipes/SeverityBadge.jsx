// Severity Badge Component
// Visual indicator for recipe health severity

import React from 'react';
import './SeverityBadge.css';

const SEVERITY_CONFIG = {
    clean: {
        emoji: '🟢',
        label: 'Clean',
        color: '#2ecc40',
        description: 'Healthy choice!',
    },
    spooky: {
        emoji: '🟡',
        label: 'Spooky',
        color: '#ffdc00',
        description: 'Minor issues',
    },
    haunted: {
        emoji: '🟠',
        label: 'Haunted',
        color: '#ff851b',
        description: 'Needs improvement',
    },
    cursed: {
        emoji: '🔴',
        label: 'Cursed',
        color: '#ff4136',
        description: 'Critical concerns',
    },
};

const SeverityBadge = ({ severity, large, showDescription }) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.clean;

    return (
        <div
            className={`severity-badge severity-${severity} ${large ? 'large' : ''}`}
            style={{ '--severity-color': config.color }}
        >
            <span className="severity-emoji">{config.emoji}</span>
            <span className="severity-label">{config.label}</span>
            {showDescription && (
                <span className="severity-description">{config.description}</span>
            )}
        </div>
    );
};

export default SeverityBadge;
