// Codebase Analysis API Routes
// REST endpoints for codebase self-analysis

const express = require('express');
const router = express.Router();
const codebaseScanner = require('../services/analysis/codebase-scanner');
const rateLimit = require('express-rate-limit');

// Rate limiting (codebase scans are expensive)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2, // Only 2 scans per minute
    message: 'Too many codebase scans, please try again later.',
});

/**
 * @route POST /api/codebase/scan
 * @desc Scan entire codebase for code smells
 * @access Private (Admin only - add auth middleware)
 */
router.post('/scan', limiter, async (req, res) => {
    try {
        const { options = {} } = req.body;

        console.log('Starting codebase scan...');
        const results = await codebaseScanner.scanCodebase(options);

        res.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error('Codebase scan error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to scan codebase',
        });
    }
});

/**
 * @route GET /api/codebase/cursed-files
 * @desc Get cursed files from last scan
 * @access Private
 */
router.post('/cursed-files', async (req, res) => {
    try {
        const { scanResults } = req.body;

        if (!scanResults) {
            return res.status(400).json({
                success: false,
                error: 'Scan results required',
            });
        }

        const cursedFiles = codebaseScanner.findCursedFiles(scanResults);

        res.json({
            success: true,
            cursedFiles,
            count: cursedFiles.length,
        });
    } catch (error) {
        console.error('Cursed files error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get cursed files',
        });
    }
});

/**
 * @route POST /api/codebase/files-by-smell
 * @desc Get files with specific code smell
 * @access Private
 */
router.post('/files-by-smell', async (req, res) => {
    try {
        const { scanResults, smellType } = req.body;

        if (!scanResults || !smellType) {
            return res.status(400).json({
                success: false,
                error: 'Scan results and smell type required',
            });
        }

        const files = codebaseScanner.getFilesBySmell(scanResults, smellType);

        res.json({
            success: true,
            smellType,
            files,
            count: files.length,
        });
    } catch (error) {
        console.error('Files by smell error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get files',
        });
    }
});

/**
 * @route POST /api/codebase/improvement-proposal
 * @desc Generate improvement proposal
 * @access Private
 */
router.post('/improvement-proposal', async (req, res) => {
    try {
        const { scanResults } = req.body;

        if (!scanResults) {
            return res.status(400).json({
                success: false,
                error: 'Scan results required',
            });
        }

        const proposal = await codebaseScanner.generateImprovementProposal(scanResults);

        res.json({
            success: true,
            proposal,
        });
    } catch (error) {
        console.error('Improvement proposal error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate proposal',
        });
    }
});

/**
 * @route POST /api/codebase/analyze-file
 * @desc Analyze a single file
 * @access Public
 */
router.post('/analyze-file', limiter, async (req, res) => {
    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: 'File path is required',
            });
        }

        const analysis = await codebaseScanner.analyzeFile(filePath);

        res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('File analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze file',
        });
    }
});

module.exports = router;
