import React, { useEffect, useRef } from 'react';

/**
 * LearningChart Component
 * Displays learning progress over time using SVG
 * 
 * @param {Object} props
 * @param {Array} props.learningData - Array of { feedbackCount, accuracy, timestamp }
 * @param {string} props.title - Chart title
 */
export default function LearningChart({ learningData = [], title = "Learning Progress" }) {
    const svgRef = useRef(null);
    const width = 600;
    const height = 300;
    const padding = { top: 40, right: 40, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    useEffect(() => {
        if (!svgRef.current || learningData.length === 0) return;

        // Calculate scales
        const maxFeedback = Math.max(100, ...learningData.map(d => d.feedbackCount || 0));
        const maxAccuracy = 100;
        
        const xScale = (value) => {
            return padding.left + (value / maxFeedback) * chartWidth;
        };
        
        const yScale = (value) => {
            return padding.top + chartHeight - (value / maxAccuracy) * chartHeight;
        };

        // Generate smooth curve points
        const points = learningData.map((d, index) => ({
            x: xScale(d.feedbackCount || index),
            y: yScale(d.accuracy || 50)
        }));

        // Create smooth path using quadratic curves
        let pathData = '';
        if (points.length > 0) {
            pathData = `M ${points[0].x} ${points[0].y}`;
            
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const next = points[i + 1] || curr;
                
                // Control point for smooth curve
                const cp1x = prev.x + (curr.x - prev.x) / 2;
                const cp1y = prev.y;
                const cp2x = curr.x - (next.x - curr.x) / 2;
                const cp2y = curr.y;
                
                pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
            }
        }

        // Update SVG path
        const path = svgRef.current.querySelector('.learning-line');
        if (path) {
            path.setAttribute('d', pathData);
        }

        // Update points
        const pointsGroup = svgRef.current.querySelector('.points-group');
        if (pointsGroup) {
            pointsGroup.innerHTML = points.map((p, i) => 
                `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#667eea" class="data-point" />`
            ).join('');
        }

    }, [learningData, chartWidth, chartHeight, padding]);

    // Calculate current accuracy
    const currentAccuracy = learningData.length > 0 
        ? learningData[learningData.length - 1].accuracy || 50 
        : 50;

    // Generate grid lines
    const gridLines = [];
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        gridLines.push(
            <line
                key={`grid-h-${i}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="4,4"
            />
        );
    }

    for (let i = 0; i <= 5; i++) {
        const x = padding.left + (chartWidth / 5) * i;
        gridLines.push(
            <line
                key={`grid-v-${i}`}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="4,4"
            />
        );
    }

    return (
        <div className="learning-chart">
            <div className="chart-header">
                <h3>{title}</h3>
                <div className="accuracy-badge">
                    Current Accuracy: <strong>{Math.round(currentAccuracy)}%</strong>
                </div>
            </div>
            
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="chart-svg"
            >
                {/* Grid lines */}
                <g className="grid-lines">
                    {gridLines}
                </g>

                {/* Axes */}
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth="2"
                />
                <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth="2"
                />

                {/* Y-axis labels */}
                {[0, 20, 40, 60, 80, 100].map((value) => {
                    const y = padding.top + chartHeight - (value / 100) * chartHeight;
                    return (
                        <text
                            key={`y-label-${value}`}
                            x={padding.left - 10}
                            y={y + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#666"
                        >
                            {value}%
                        </text>
                    );
                })}

                {/* X-axis labels */}
                {[0, 20, 40, 60, 80, 100].map((value) => {
                    const x = padding.left + (value / 100) * chartWidth;
                    return (
                        <text
                            key={`x-label-${value}`}
                            x={x}
                            y={height - padding.bottom + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#666"
                        >
                            {value}
                        </text>
                    );
                })}

                {/* Learning curve */}
                <path
                    className="learning-line"
                    d=""
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Data points */}
                <g className="points-group"></g>

                {/* Axis labels */}
                <text
                    x={width / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#333"
                    fontWeight="600"
                >
                    Number of Feedbacks/Ratings
                </text>
                <text
                    x={20}
                    y={height / 2}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#333"
                    fontWeight="600"
                    transform={`rotate(-90, 20, ${height / 2})`}
                >
                    Accuracy (%)
                </text>
            </svg>

            {learningData.length === 0 && (
                <div className="chart-empty">
                    <p>No learning data yet. Start rating meals to see progress!</p>
                </div>
            )}
        </div>
    );
}











