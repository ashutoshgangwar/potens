import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useForm from '../../hooks/useForm.js';
import { validators } from '../../utils/validators.js';
import { Button, Input, Alert } from '../../components/ui/index.js';

const validationRules = {
  fullName: validators.name,
  email: validators.email,
  phone: validators.phone,
  password: (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password must be at least 6 characters.';
    return '';
  },
  confirmPassword: (value, allValues) => {
    if (!value) return 'Please confirm your password.';
    return value === allValues.password ? '' : 'Passwords do not match.';
  },
};

const SignupPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(
    { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Sign up failed. Please try again.');
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
            <span className="logo-text">potense Admin</span>
          </div>
          <h1 className="brand-headline">Start managing your platform today.</h1>
          <p className="brand-sub">Create your admin account and get instant access to all features.</p>
          <ul className="brand-features">
            {['Free to get started', 'No credit card required', 'Invite your whole team', 'Enterprise-ready security'].map((f) => (
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
              <p className="auth-eyebrow">Create Account</p>
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">Get started in minutes and unlock your full partner dashboard.</p>
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
                id="fullName"
                name="fullName"
                type="text"
                label="Full name"
                placeholder="John Doe"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                required
                autoComplete="name"
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone number"
                placeholder="9876543210"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                required
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.895 1.368l1.02 3.06a2 2 0 01-.457 2.11l-1.373 1.373a16.042 16.042 0 006.586 6.586l1.373-1.373a2 2 0 012.11-.457l3.06 1.02A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required
                autoComplete="new-password"
                helperText={!errors.password && 'Use at least 6 characters.'}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              <p className="terms-text">
                By creating an account you agree to our{' '}
                <a href="#" className="auth-link">Terms of Service</a> and{' '}
                <a href="#" className="auth-link">Privacy Policy</a>.
              </p>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Create account
              </Button>

              <p className="auth-helper-note">Your account details are encrypted and kept private.</p>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
