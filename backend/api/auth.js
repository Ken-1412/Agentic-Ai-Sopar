const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email, password, and name'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error creating user'
        });
    }
});

/**
 * @route   POST /api/auth/signin
 * @desc    Login user
 * @access  Public
 */
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            error: 'Error signing in'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
