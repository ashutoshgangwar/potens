import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useForm from '../../hooks/useForm.js';
import { validators } from '../../utils/validators.js';
import { Button, Input, Card, Alert } from '../../components/ui/index.js';

const validationRules = {
  email: validators.email,
  password: validators.required,
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(
    { email: '', password: '' },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      await login({ email: values.email, password: values.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
              <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="8" y="8" width="10" height="10" rx="3" fill="white" fillOpacity="0.8" />
              <rect x="22" y="22" width="10" height="10" rx="3" fill="white" fillOpacity="0.8" />
            </svg>
            <span className="logo-text">Potens Portal</span>
          </div>
          <h1 className="brand-headline">Manage your profile journey with confidence.</h1>
          <p className="brand-sub">A secure, unified partner portal built for speed and scale.</p>
          <ul className="brand-features">
            {['Step-by-step onboarding', 'Secure account access', 'Profile progress tracking', 'Fast dashboard access'].map((f) => (
              <li key={f} className="brand-feature-item">
                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-shell">
          <div className="auth-form-container auth-form-card">
            <div className="auth-form-header">
              <p className="auth-eyebrow">Sign In</p>
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Sign in to manage your profile and dashboard updates.</p>
            </div>

            {apiError && (
              <Alert
                type="error"
                message={apiError}
                onClose={() => setApiError('')}
                className="mb-5"
              />
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@company.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
                autoComplete="email"
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required
                autoComplete="current-password"
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <div className="auth-forgot">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Sign in
              </Button>

              <p className="auth-helper-note">Secure login protected with encrypted session handling.</p>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
