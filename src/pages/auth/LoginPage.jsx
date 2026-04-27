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
      const user = await login({ email: values.email, password: values.password });
      // Log the logged-in user for debugging
      // eslint-disable-next-line no-console
      console.log('Login success:', user);
      // If user needs onboarding, redirect to profile-completion
      if (user?.needs_onboarding || user?.is_onboarded === false) {
        navigate('/profile-completion', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel with full-screen logo */}
      <div
        className="auth-brand"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '50vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(-45deg, var(--color-primary), var(--color-primary-dark), var(--color-primary-light), #0072ff)',
          backgroundSize: '400% 400%',
          animation: 'gradientBG 12s ease infinite',
          color: 'var(--color-surface)',
          zIndex: 1,
        }}
      >
        <style>{`
          @keyframes gradientBG {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}</style>
        <div style={{
          background: 'rgba(255,255,255,0.18)',
          borderRadius: '32px',
          padding: '2.8rem 2.2rem 2.2rem 2.2rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '95%',
          width: '440px',
            background: 'rgba(255,255,255,0.95)',
          border: '1.5px solid var(--color-primary-light)',
        }}>
          <img src="/logos/Potens_Energy_Logo.png" alt="Potens Energy Logo" style={{ maxHeight: '140px', width: 'auto', display: 'block', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 16px var(--color-primary-light))' }} />
          <h1 style={{ color: '#000', fontWeight: 800, fontSize: '2.3rem', marginBottom: '0.7rem', textAlign: 'center', letterSpacing: '-1px' }}>Welcome to <span style={{ color: '#000' }}>Potens Portal</span></h1>
          <p style={{ color: '#000', fontSize: '1.18rem', marginBottom: '1.7rem', textAlign: 'center', fontWeight: 500 }}>
            Manage your energy journey with confidence.<br />
            <span style={{ fontWeight: 700, color: '#000' }}>Secure, unified, and built for scale.</span>
          </p>
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.4rem', display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#000', textDecoration: 'underline', fontWeight: 600, fontSize: '1.05rem' }}>YouTube</a>
            <a href="#" style={{ color: '#000', textDecoration: 'underline', fontWeight: 600, fontSize: '1.05rem' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#000', textDecoration: 'underline', fontWeight: 600, fontSize: '1.05rem' }}>Other Info</a>
          </div>
          <p style={{ color: '#000', fontSize: '1.02rem', textAlign: 'center', fontWeight: 500 }}>
            {/* Add more links or info here as needed */}
            For help, contact <a href="mailto:support@potensenergy.in" style={{ color: '#000', textDecoration: 'underline', fontWeight: 600 }}>support@potensenergy.in</a>
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel" style={{ marginLeft: '50vw', width: '50vw', minHeight: '100vh', position: 'relative', zIndex: 2, background: 'var(--color-bg)' }}>
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
