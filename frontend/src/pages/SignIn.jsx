import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import '../styles/Auth.css';

const SignIn = () => {
    const navigate = useNavigate();
    const { signin, loading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await signin(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Sign in error:', err);
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
                    <p className="auth-subtitle">Welcome back to your meal assistant</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                            required
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
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-loading">Signing in...</span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <Link to="/signup" className="auth-link">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
