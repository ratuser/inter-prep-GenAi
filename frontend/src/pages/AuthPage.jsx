import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Mail, Lock, User, Github, Chrome, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const API_URL = 'http://localhost:5000/api/auth';

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const toggleMode = () => {
        setIsSignUp((prev) => !prev);
        setMessage(null);
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message) setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Client-side validation
        if (isSignUp) {
            if (!formData.fullName.trim()) {
                return setMessage({ type: 'error', text: 'Full name is required' });
            }
            if (formData.password !== formData.confirmPassword) {
                return setMessage({ type: 'error', text: 'Passwords do not match' });
            }
            if (formData.password.length < 6) {
                return setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            }
        }

        if (!formData.email.trim() || !formData.password) {
            return setMessage({ type: 'error', text: 'Email and password are required' });
        }

        setLoading(true);

        try {
            const endpoint = isSignUp ? '/register' : '/login';
            const body = isSignUp
                ? { fullName: formData.fullName, email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password };

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setMessage({
                type: 'success',
                text: isSignUp ? 'Account created successfully!' : 'Login successful!',
            });

            // Redirect after a short delay so user sees the success message
            setTimeout(() => {
                navigate('/dashboard');
            }, 1200);

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background geometric shapes */}
            <div className="auth-bg-shape auth-bg-shape-1" />
            <div className="auth-bg-shape auth-bg-shape-2" />
            <div className="auth-bg-shape auth-bg-shape-3" />
            <div className="auth-curve auth-curve-1" />
            <div className="auth-curve auth-curve-2" />
            <div className="auth-curve auth-curve-3" />

            {/* Left Panel - Welcome */}
            <motion.div
                className="auth-left"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Link to="/" className="auth-left-logo">
                    <div className="auth-left-logo-icon">
                        <Sparkles size={16} color="#fff" />
                    </div>
                    <span className="auth-left-logo-text">
                        Inter<span className="gradient-text">Prep</span>
                    </span>
                </Link>

                <h1 className="auth-welcome-heading">
                    Welcome{isSignUp ? '!' : ' Back!'}
                </h1>
                <div className="auth-welcome-line" />
                <p className="auth-welcome-text">
                    {isSignUp
                        ? 'Join InterPrep and supercharge your interview preparation with AI-powered mock interviews, real-time feedback, and personalized learning paths.'
                        : 'Log in to continue your interview prep journey. Your personalized practice sessions and progress are waiting for you.'
                    }
                </p>
                <Link to="/" className="auth-learn-more">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
            </motion.div>

            {/* Right Panel - Form Card */}
            <motion.div
                className="auth-right"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            >
                <div className="auth-card">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isSignUp ? 'signup' : 'login'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="auth-card-title">
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </h2>
                            <p className="auth-card-subtitle">
                                {isSignUp
                                    ? 'Start your journey to interview success'
                                    : 'Access your InterPrep dashboard'
                                }
                            </p>

                            {/* Status Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`auth-message auth-message-${message.type}`}
                                >
                                    {message.type === 'success'
                                        ? <CheckCircle size={16} />
                                        : <AlertCircle size={16} />
                                    }
                                    <span>{message.text}</span>
                                </motion.div>
                            )}

                            <form className="auth-form" onSubmit={handleSubmit}>
                                {/* Sign Up: Full Name */}
                                {isSignUp && (
                                    <motion.div
                                        className="auth-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <label className="auth-label" htmlFor="fullName">Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User
                                                size={16}
                                                style={{
                                                    position: 'absolute',
                                                    left: '0.85rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255,255,255,0.25)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                className="auth-input"
                                                type="text"
                                                placeholder="John Doe"
                                                autoComplete="name"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Email */}
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="email">
                                        {isSignUp ? 'Email Address' : 'Email / Username'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail
                                            size={16}
                                            style={{
                                                position: 'absolute',
                                                left: '0.85rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'rgba(255,255,255,0.25)',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        <input
                                            id="email"
                                            name="email"
                                            className="auth-input"
                                            type="email"
                                            placeholder={isSignUp ? 'you@example.com' : 'Enter your email'}
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="password">Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock
                                            size={16}
                                            style={{
                                                position: 'absolute',
                                                left: '0.85rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'rgba(255,255,255,0.25)',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        <input
                                            id="password"
                                            name="password"
                                            className="auth-input"
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password (Sign Up only) */}
                                {isSignUp && (
                                    <motion.div
                                        className="auth-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <label className="auth-label" htmlFor="confirmPassword">
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock
                                                size={16}
                                                style={{
                                                    position: 'absolute',
                                                    left: '0.85rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255,255,255,0.25)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                className="auth-input"
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Submit */}
                                <button
                                    className="auth-submit"
                                    type="submit"
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                    </span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="auth-divider">
                                <div className="auth-divider-line" />
                                <span className="auth-divider-text">or continue with</span>
                                <div className="auth-divider-line" />
                            </div>

                            {/* Social Login */}
                            <div className="auth-social">
                                <button className="auth-social-btn" aria-label="Sign in with Google" type="button">
                                    <Chrome size={20} />
                                </button>
                                <button className="auth-social-btn" aria-label="Sign in with GitHub" type="button">
                                    <Github size={20} />
                                </button>
                            </div>

                            {/* Toggle */}
                            <div className="auth-toggle">
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    className="auth-toggle-link"
                                    onClick={toggleMode}
                                    type="button"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
