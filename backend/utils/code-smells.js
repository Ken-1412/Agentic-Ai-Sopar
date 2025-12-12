// Code Smell Detection Utilities
// Analyzes JavaScript code for common anti-patterns

const acorn = require('acorn');
const walk = require('acorn-walk');

/**
 * Code smell types (inspired by Haunted Refactorium)
 */
const CODE_SMELL_TYPES = {
    VAR_USAGE: 'var-usage',
    CALLBACK_HELL: 'callback-hell',
    LONG_FUNCTION: 'long-function',
    LARGE_FILE: 'large-file',
    CONSOLE_LOG: 'console-log',
    TODO_COMMENT: 'todo-comment',
    MISSING_ERROR_HANDLING: 'missing-error-handling',
    DEPRECATED_API: 'deprecated-api',
    COMPLEX_CONDITION: 'complex-condition',
    MAGIC_NUMBER: 'magic-number',
};

/**
 * Detect code smells in JavaScript code
 * @param {string} code - Source code
 * @param {string} filePath - File path for context
 * @returns {array} Detected smells
 */
function detectCodeSmells(code, filePath) {
    const smells = [];

    try {
        // Parse the code into AST
        const ast = acorn.parse(code, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true,
        });

        // Detect var usage (should use let/const)
        walk.simple(ast, {
            VariableDeclaration(node) {
                if (node.kind === 'var') {
                    smells.push({
                        type: CODE_SMELL_TYPES.VAR_USAGE,
                        severity: 'spooky',
                        line: node.loc.start.line,
                        message: 'Using "var" keyword (use let/const instead)',
                        file: filePath,
                    });
                }
            },
        });

        // Detect callback hell (nested callbacks > 3 levels)
        let maxCallbackDepth = 0;
        let currentDepth = 0;

        walk.ancestor(ast, {
            FunctionExpression(node, ancestors) {
                currentDepth = ancestors.filter(n =>
                    n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'
                ).length;
                if (currentDepth > maxCallbackDepth) {
                    maxCallbackDepth = currentDepth;
                }
            },
            ArrowFunctionExpression(node, ancestors) {
                currentDepth = ancestors.filter(n =>
                    n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'
                ).length;
                if (currentDepth > maxCallbackDepth) {
                    maxCallbackDepth = currentDepth;
                }
            },
        });

        if (maxCallbackDepth > 3) {
            smells.push({
                type: CODE_SMELL_TYPES.CALLBACK_HELL,
                severity: maxCallbackDepth > 5 ? 'haunted' : 'spooky',
                line: 1,
                message: `Callback nesting depth: ${maxCallbackDepth} (should be ≤3)`,
                file: filePath,
            });
        }

        // Detect long functions (>50 lines)
        walk.simple(ast, {
            FunctionDeclaration(node) {
                const length = node.loc.end.line - node.loc.start.line;
                if (length > 50) {
                    smells.push({
                        type: CODE_SMELL_TYPES.LONG_FUNCTION,
                        severity: length > 100 ? 'haunted' : 'spooky',
                        line: node.loc.start.line,
                        message: `Function "${node.id?.name || 'anonymous'}" is ${length} lines (should be ≤50)`,
                        file: filePath,
                    });
                }
            },
        });

        // Detect console.log (should use proper logging)
        walk.simple(ast, {
            CallExpression(node) {
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'console' &&
                    node.callee.property.name === 'log'
                ) {
                    smells.push({
                        type: CODE_SMELL_TYPES.CONSOLE_LOG,
                        severity: 'spooky',
                        line: node.loc.start.line,
                        message: 'Using console.log (use proper logger)',
                        file: filePath,
                    });
                }
            },
        });

        // Detect missing error handling in async functions
        walk.simple(ast, {
            FunctionDeclaration(node) {
                if (node.async) {
                    let hasTryCatch = false;
                    walk.simple(node, {
                        TryStatement() {
                            hasTryCatch = true;
                        },
                    });

                    if (!hasTryCatch) {
                        smells.push({
                            type: CODE_SMELL_TYPES.MISSING_ERROR_HANDLING,
                            severity: 'haunted',
                            line: node.loc.start.line,
                            message: `Async function "${node.id?.name || 'anonymous'}" missing try-catch`,
                            file: filePath,
                        });
                    }
                }
            },
        });

        // Detect complex conditions (multiple && or ||)
        walk.simple(ast, {
            IfStatement(node) {
                const conditionStr = code.substring(node.test.start, node.test.end);
                const andCount = (conditionStr.match(/&&/g) || []).length;
                const orCount = (conditionStr.match(/\|\|/g) || []).length;
                const total = andCount + orCount;

                if (total > 3) {
                    smells.push({
                        type: CODE_SMELL_TYPES.COMPLEX_CONDITION,
                        severity: 'spooky',
                        line: node.loc.start.line,
                        message: `Complex condition with ${total} operators (should be ≤3)`,
                        file: filePath,
                    });
                }
            },
        });

    } catch (error) {
        // If parsing fails, file might have syntax errors
        smells.push({
            type: 'parse-error',
            severity: 'cursed',
            line: 1,
            message: `Syntax error: ${error.message}`,
            file: filePath,
        });
    }

    // Check file size
    const lines = code.split('\n').length;
    if (lines > 500) {
        smells.push({
            type: CODE_SMELL_TYPES.LARGE_FILE,
            severity: lines > 1000 ? 'haunted' : 'spooky',
            line: 1,
            message: `File is ${lines} lines (should be ≤500)`,
            file: filePath,
        });
    }

    // Check for TODO comments
    const todoMatches = code.match(/\/\/\s*TODO/gi) || [];
    if (todoMatches.length > 0) {
        smells.push({
            type: CODE_SMELL_TYPES.TODO_COMMENT,
            severity: 'spooky',
            line: 1,
            message: `${todoMatches.length} TODO comment(s) found`,
            file: filePath,
        });
    }

    return smells;
}

/**
 * Calculate complexity score for code
 * @param {string} code - Source code
 * @returns {number} Complexity score (1-10)
 */
function calculateComplexity(code) {
    let score = 1;

    try {
        const ast = acorn.parse(code, {
            ecmaVersion: 'latest',
            sourceType: 'module',
        });

        let functionCount = 0;
        let conditionalCount = 0;
        let loopCount = 0;

        walk.simple(ast, {
            FunctionDeclaration() { functionCount++; },
            FunctionExpression() { functionCount++; },
            ArrowFunctionExpression() { functionCount++; },
            IfStatement() { conditionalCount++; },
            SwitchStatement() { conditionalCount++; },
            ConditionalExpression() { conditionalCount++; },
            ForStatement() { loopCount++; },
            WhileStatement() { loopCount++; },
            DoWhileStatement() { loopCount++; },
        });

        // Cyclomatic complexity approximation
        score = 1 + conditionalCount + loopCount;

        // Cap at 10
        score = Math.min(10, score);

    } catch (error) {
        // If parsing fails, assume high complexity
        score = 8;
    }

    return score;
}

/**
 * Get smell recommendations
 * @param {string} smellType - Smell type
 * @returns {string} Recommendation
 */
function getSmellRecommendation(smellType) {
    const recommendations = {
        [CODE_SMELL_TYPES.VAR_USAGE]: 'Replace with let or const for block scoping',
        [CODE_SMELL_TYPES.CALLBACK_HELL]: 'Refactor to use async/await or Promises',
        [CODE_SMELL_TYPES.LONG_FUNCTION]: 'Split into smaller, focused functions',
        [CODE_SMELL_TYPES.LARGE_FILE]: 'Split into multiple modules',
        [CODE_SMELL_TYPES.CONSOLE_LOG]: 'Use winston or morgan for logging',
        [CODE_SMELL_TYPES.TODO_COMMENT]: 'Create tickets and implement TODOs',
        [CODE_SMELL_TYPES.MISSING_ERROR_HANDLING]: 'Add try-catch blocks',
        [CODE_SMELL_TYPES.DEPRECATED_API]: 'Upgrade to modern alternatives',
        [CODE_SMELL_TYPES.COMPLEX_CONDITION]: 'Extract condition into named function',
        [CODE_SMELL_TYPES.MAGIC_NUMBER]: 'Define as named constant',
    };

    return recommendations[smellType] || 'Review and refactor';
}

module.exports = {
    CODE_SMELL_TYPES,
    detectCodeSmells,
    calculateComplexity,
    getSmellRecommendation,
};
