const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

/**
 * @route   POST /api/training/train
 * @desc    Train ML model for current user
 * @access  Private
 */
router.post('/train', protect, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id.toString();

        // Get user preferences
        const { tastes, moods, carbonPreference } = user.preferences;

        if (!tastes || tastes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please add at least one taste preference before training'
            });
        }

        // Prepare arguments for Python script
        const args = [
            path.join(__dirname, '../../model/trainer.py'),
            '--userId', userId,
            '--tastes', tastes.join(','),
            '--moods', moods.join(','),
            '--carbon', carbonPreference
        ];

        console.log('🤖 Starting ML training for user:', userId);
        console.log('   Tastes:', tastes.join(', '));
        console.log('   Moods:', moods.join(', '));
        console.log('   Carbon:', carbonPreference);

        // Execute Python training script
        const pythonProcess = spawn('python3', args);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log('   Python:', data.toString().trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('   Python Error:', data.toString().trim());
        });

        pythonProcess.on('close', async (code) => {
            if (code === 0) {
                // Training successful - update user
                await User.findByIdAndUpdate(user._id, {
                    modelTrained: true,
                    lastTrainedAt: new Date()
                });

                console.log('✅ Training completed successfully');

                res.json({
                    success: true,
                    message: 'Model trained successfully',
                    output: output.trim(),
                    modelPath: `models/${userId}.pkl`
                });
            } else {
                console.error('❌ Training failed with code:', code);
                res.status(500).json({
                    success: false,
                    error: 'Training failed',
                    details: errorOutput || output
                });
            }
        });

    } catch (error) {
        console.error('Training error:', error);
        res.status(500).json({
            success: false,
            error: 'Error starting training',
            details: error.message
        });
    }
});

/**
 * @route   GET /api/training/status
 * @desc    Check if user's model exists and is current
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id.toString();
        const modelPath = path.join(__dirname, '../../models', `${userId}.pkl`);

        const modelExists = fs.existsSync(modelPath);

        res.json({
            success: true,
            modelTrained: user.modelTrained,
            modelExists,
            lastTrainedAt: user.lastTrainedAt,
            needsRetraining: !user.modelTrained || !modelExists
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Error checking model status'
        });
    }
});

module.exports = router;
