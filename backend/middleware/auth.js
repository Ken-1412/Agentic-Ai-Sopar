const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

module.exports = {
    protect,
    generateToken
};
