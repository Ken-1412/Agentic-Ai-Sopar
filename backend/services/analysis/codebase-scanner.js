// Codebase Scanner Service
// Scans SAPOR's own codebase for code smells and technical debt

const fs = require('fs').promises;
const path = require('path');
const fg = require('fast-glob');
const { detectCodeSmells, calculateComplexity } = require('../../utils/code-smells');
const { generateDebtReport } = require('../../utils/tech-debt');
const llmService = require('../llm');

class CodebaseScanner {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../../../');
        this.excludePatterns = [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/*.min.js',
            '**/coverage/**',
        ];
    }

    /**
     * Scan entire codebase
     * @param {object} options - Scan options
     * @returns {Promise<object>} Analysis results
     */
    async scanCodebase(options = {}) {
        const {
            includePatterns = ['**/*.js', '**/*.jsx'],
            maxFiles = 100,
            useAI = false,
        } = options;

        console.log('🔍 Starting codebase scan...');
        console.log(`   Root: ${this.projectRoot}`);

        // Find all JavaScript files
        const files = await fg(includePatterns, {
            cwd: this.projectRoot,
            ignore: this.excludePatterns,
            absolute: true,
        });

        console.log(`   Found ${files.length} files`);

        // Limit file count
        const filesToScan = files.slice(0, maxFiles);
        if (files.length > maxFiles) {
            console.log(`   ⚠️  Limiting to first ${maxFiles} files`);
        }

        // Analyze each file
        const analyzedFiles = [];
        const allSmells = [];

        for (const filePath of filesToScan) {
            const analysis = await this.analyzeFile(filePath);
            analyzedFiles.push(analysis);
            allSmells.push(...analysis.smells);
        }

        // Generate summary
        const summary = this.generateSummary(analyzedFiles, allSmells);

        // Generate technical debt report
        const debtReport = generateDebtReport({
            files: analyzedFiles,
            summary: { ...summary, allSmells },
        });

        // Optional: Get AI analysis
        let aiAnalysis = null;
        if (useAI && allSmells.length > 0) {
            try {
                aiAnalysis = await this.getAIAnalysis(summary, debtReport);
            } catch (error) {
                console.warn('AI analysis failed:', error.message);
            }
        }

        console.log('✅ Codebase scan complete');

        return {
            scannedAt: new Date(),
            projectRoot: this.projectRoot,
            filesScanned: filesToScan.length,
            totalFiles: files.length,
            files: analyzedFiles,
            summary,
            debtReport,
            aiAnalysis,
        };
    }

    /**
     * Analyze a single file
     * @param {string} filePath - Absolute path to file
     * @returns {Promise<object>} File analysis
     */
    async analyzeFile(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.projectRoot, filePath);

            const smells = detectCodeSmells(code, relativePath);
            const complexity = calculateComplexity(code);
            const lines = code.split('\n').length;

            return {
                path: relativePath,
                absolutePath: filePath,
                lines,
                complexity,
                smells,
                smellCount: smells.length,
            };
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
            return {
                path: path.relative(this.projectRoot, filePath),
                absolutePath: filePath,
                lines: 0,
                complexity: 0,
                smells: [],
                smellCount: 0,
                error: error.message,
            };
        }
    }

    /**
     * Generate summary statistics
     * @param {array} files - Analyzed files
     * @param {array} allSmells - All detected smells
     * @returns {object} Summary
     */
    generateSummary(files, allSmells) {
        const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
        const avgComplexity = files.reduce((sum, f) => sum + f.complexity, 0) / files.length;

        const smellCounts = {};
        allSmells.forEach(smell => {
            smellCounts[smell.type] = (smellCounts[smell.type] || 0) + 1;
        });

        const severityCounts = {
            cursed: allSmells.filter(s => s.severity === 'cursed').length,
            haunted: allSmells.filter(s => s.severity === 'haunted').length,
            spooky: allSmells.filter(s => s.severity === 'spooky').length,
        };

        // Detect languages
        const languages = {};
        files.forEach(f => {
            const ext = path.extname(f.path);
            languages[ext] = (languages[ext] || 0) + 1;
        });

        return {
            fileCount: files.length,
            totalLines,
            avgComplexity: Math.round(avgComplexity * 10) / 10,
            totalSmells: allSmells.length,
            smellCounts,
            severityCounts,
            languages,
        };
    }

    /**
     * Get AI analysis of codebase
     * @param {object} summary - Codebase summary
     * @param {object} debtReport - Technical debt report
     * @returns {Promise<object>} AI analysis
     */
    async getAIAnalysis(summary, debtReport) {
        const codeSnapshot = {
            fileCount: summary.fileCount,
            totalLines: summary.totalLines,
            languages: Object.keys(summary.languages),
            issues: debtReport.topDebtFiles.map(f => ({
                file: f.file,
                severity: f.severity,
                type: 'technical-debt',
                description: `${f.smellCount} code smells, ${f.hours}h debt`,
            })),
        };

        const analysis = await llmService.analyzeCodebase(codeSnapshot);
        return analysis;
    }

    /**
     * Find cursed files (highest severity)
     * @param {object} scanResults - Scan results
     * @returns {array} Cursed files
     */
    findCursedFiles(scanResults) {
        return scanResults.files
            .filter(f => f.smells.some(s => s.severity === 'cursed'))
            .sort((a, b) => b.smellCount - a.smellCount)
            .slice(0, 10);
    }

    /**
     * Get files by smell type
     * @param {object} scanResults - Scan results
     * @param {string} smellType - Smell type
     * @returns {array} Files with that smell
     */
    getFilesBySmell(scanResults, smellType) {
        return scanResults.files
            .filter(f => f.smells.some(s => s.type === smellType))
            .map(f => ({
                file: f.path,
                occurrences: f.smells.filter(s => s.type === smellType).length,
                lines: f.smells
                    .filter(s => s.type === smellType)
                    .map(s => s.line),
            }));
    }

    /**
     * Generate improvement proposal
     * @param {object} scanResults - Scan results
     * @returns {object} Improvement proposal
     */
    async generateImprovementProposal(scanResults) {
        const { debtReport } = scanResults;

        // Group recommendations by priority
        const quickWins = debtReport.recommendations.filter(r => r.estimatedHours < 1);
        const mediumEffort = debtReport.recommendations.filter(r =>
            r.estimatedHours >= 1 && r.estimatedHours < 4
        );
        const largeEffort = debtReport.recommendations.filter(r => r.estimatedHours >= 4);

        return {
            summary: {
                totalIssues: debtReport.totalDebt.smellCount,
                estimatedHours: debtReport.totalDebt.totalHours,
                estimatedCost: debtReport.totalDebt.totalCost,
                healthScore: debtReport.healthScore,
            },
            phases: [
                {
                    phase: 1,
                    title: 'Quick Wins',
                    description: 'Low-effort, high-impact improvements',
                    recommendations: quickWins,
                    estimatedHours: quickWins.reduce((sum, r) => sum + r.estimatedHours, 0),
                },
                {
                    phase: 2,
                    title: 'Medium Effort',
                    description: 'Moderate refactoring tasks',
                    recommendations: mediumEffort,
                    estimatedHours: mediumEffort.reduce((sum, r) => sum + r.estimatedHours, 0),
                },
                {
                    phase: 3,
                    title: 'Major Refactoring',
                    description: 'Large-scale improvements',
                    recommendations: largeEffort,
                    estimatedHours: largeEffort.reduce((sum, r) => sum + r.estimatedHours, 0),
                },
            ],
            topCursedFiles: debtReport.topCursedFiles,
        };
    }
}

// Export singleton
module.exports = new CodebaseScanner();
