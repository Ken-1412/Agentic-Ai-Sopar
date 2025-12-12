const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    preferences: {
        tastes: {
            type: [String],
            default: []
        },
        moods: {
            type: [String],
            default: []
        },
        carbonPreference: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    },
    modelTrained: {
        type: Boolean,
        default: false
    },
    lastTrainedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to get public profile (no sensitive data)
UserSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        preferences: this.preferences,
        modelTrained: this.modelTrained,
        lastTrainedAt: this.lastTrainedAt,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', UserSchema);
