import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import '../styles/Auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const { signup, loading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setValidationError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setValidationError('All fields are required');
            return;
        }

        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        try {
            await signup(formData.email, formData.password, formData.name);
            navigate('/dashboard');
        } catch (err) {
            // Error is handled by store
            console.error('Signup error:', err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">
                        <span className="auth-logo">🍽️</span>
                        SAPOR
                    </h1>
                    <p className="auth-subtitle">Create your personalized meal assistant</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                        <span className="form-hint">At least 6 characters</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>

                    {(validationError || error) && (
                        <div className="auth-error">
                            {validationError || error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-loading">Creating account...</span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account?</p>
                    <Link to="/signin" className="auth-link">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
