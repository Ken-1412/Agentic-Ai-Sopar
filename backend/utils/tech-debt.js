// Technical Debt Calculator
// Estimates hours and cost to fix code issues

/**
 * Effort estimates (in hours) for different smell types
 */
const EFFORT_ESTIMATES = {
    'var-usage': 0.25,              // 15 minutes per occurrence
    'callback-hell': 2,              // 2 hours to refactor
    'long-function': 1.5,            // 1.5 hours to split
    'large-file': 3,                 // 3 hours to modularize
    'console-log': 0.1,              // 6 minutes to replace
    'todo-comment': 0.5,             // 30 minutes per TODO
    'missing-error-handling': 0.5,   // 30 minutes to add
    'deprecated-api': 2,             // 2 hours to upgrade
    'complex-condition': 0.75,       // 45 minutes to refactor
    'magic-number': 0.25,            // 15 minutes to extract
    'parse-error': 8,                // 8 hours to fix syntax errors
};

/**
 * Developer hourly rate (configurable)
 */
const DEFAULT_HOURLY_RATE = 75; // $75/hour

/**
 * Calculate technical debt for a list of code smells
 * @param {array} smells - List of detected smells
 * @param {number} hourlyRate - Developer hourly rate
 * @returns {object} Technical debt summary
 */
function calculateTechnicalDebt(smells, hourlyRate = DEFAULT_HOURLY_RATE) {
    let totalHours = 0;
    const breakdown = {};

    smells.forEach(smell => {
        const effort = EFFORT_ESTIMATES[smell.type] || 1;
        totalHours += effort;

        if (!breakdown[smell.type]) {
            breakdown[smell.type] = {
                count: 0,
                hours: 0,
                severity: smell.severity,
            };
        }

        breakdown[smell.type].count++;
        breakdown[smell.type].hours += effort;
    });

    const totalCost = totalHours * hourlyRate;

    return {
        totalHours: Math.round(totalHours * 10) / 10,
        totalCost: Math.round(totalCost),
        hourlyRate,
        smellCount: smells.length,
        breakdown,
        estimatedDays: Math.ceil(totalHours / 8),
    };
}

/**
 * Prioritize smells by impact (severity × count)
 * @param {object} breakdown - Technical debt breakdown
 * @returns {array} Prioritized list
 */
function prioritizeSmells(breakdown) {
    const severityWeights = {
        cursed: 4,
        haunted: 3,
        spooky: 2,
        clean: 1,
    };

    return Object.entries(breakdown)
        .map(([type, data]) => ({
            type,
            ...data,
            impact: data.count * severityWeights[data.severity],
        }))
        .sort((a, b) => b.impact - a.impact);
}

/**
 * Calculate file-level technical debt
 * @param {array} files - List of analyzed files
 * @returns {array} Files sorted by debt
 */
function calculateFileDebt(files) {
    return files
        .map(file => {
            const debt = calculateTechnicalDebt(file.smells);
            return {
                file: file.path,
                smellCount: file.smells.length,
                hours: debt.totalHours,
                cost: debt.totalCost,
                severity: getFileSeverity(file.smells),
            };
        })
        .sort((a, b) => b.cost - a.cost);
}

/**
 * Get file severity based on smells
 * @param {array} smells - File's code smells
 * @returns {string} Severity level
 */
function getFileSeverity(smells) {
    if (smells.some(s => s.severity === 'cursed')) return 'cursed';
    if (smells.some(s => s.severity === 'haunted')) return 'haunted';
    if (smells.some(s => s.severity === 'spooky')) return 'spooky';
    return 'clean';
}

/**
 * Generate technical debt report
 * @param {object} codebaseAnalysis - Complete codebase analysis
 * @returns {object} Formatted report
 */
function generateDebtReport(codebaseAnalysis) {
    const { files, summary } = codebaseAnalysis;

    const totalDebt = calculateTechnicalDebt(summary.allSmells);
    const fileDebts = calculateFileDebt(files);
    const priorities = prioritizeSmells(totalDebt.breakdown);

    // Calculate health score (100 - debt factor)
    const maxDebt = files.length * 10; // Assume max 10 hours per file
    const debtFactor = Math.min(100, (totalDebt.totalHours / maxDebt) * 100);
    const healthScore = Math.max(0, 100 - debtFactor);

    return {
        healthScore: Math.round(healthScore),
        totalDebt,
        topCursedFiles: fileDebts.filter(f => f.severity === 'cursed').slice(0, 10),
        topDebtFiles: fileDebts.slice(0, 10),
        priorities,
        recommendations: generateRecommendations(priorities),
    };
}

/**
 * Generate improvement recommendations
 * @param {array} priorities - Prioritized smells
 * @returns {array} Recommendations
 */
function generateRecommendations(priorities) {
    const recommendations = [];

    priorities.slice(0, 5).forEach((priority, index) => {
        const { getSmellRecommendation } = require('./code-smells');

        recommendations.push({
            priority: index + 1,
            issue: priority.type,
            occurrences: priority.count,
            estimatedHours: priority.hours,
            severity: priority.severity,
            action: getSmellRecommendation(priority.type),
            impact: priority.impact > 10 ? 'High' : priority.impact > 5 ? 'Medium' : 'Low',
        });
    });

    return recommendations;
}

module.exports = {
    calculateTechnicalDebt,
    prioritizeSmells,
    calculateFileDebt,
    generateDebtReport,
    DEFAULT_HOURLY_RATE,
};
