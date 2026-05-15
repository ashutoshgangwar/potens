import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useForm from '../../hooks/useForm.js';
import { validators } from '../../utils/validators.js';
import { Button, Input, Alert, Spinner } from '../../components/ui/index.js';
import { apiSendOtp, apiVerifyOtp, apiGetRoles } from '../../utils/api.js';


const validationRules = {
  fullName: validators.name,
  email: validators.email,
  phone: validators.phone,
  role: (value) => (!value ? 'Please select a role.' : ''),
  password: (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  },
  confirmPassword: (value, allValues) => {
    if (!value) return 'Please confirm your password.';
    return value === allValues.password ? '' : 'Passwords do not match.';
  },
};

const groupRolesByCategory = (roles) => {
  const map = {};
  for (const r of roles) {
    const cat = r.category || r.role_category || 'Other';
    if (!map[cat]) map[cat] = [];
    map[cat].push(r);
  }
  return map;
};

const SignupPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState('');
  const [rolesByCategory, setRolesByCategory] = useState({});

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(
    { fullName: '', email: '', phone: '', role: '', password: '', confirmPassword: '' },
    validationRules
  );
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = useRef([]);

  // Fetch roles
  const fetchRoles = () => {
    setRolesLoading(true);
    setRolesError('');
    apiGetRoles()
      .then((roles) => {
        setRolesByCategory(groupRolesByCategory(roles));
      })
      .catch((err) => {
        setRolesError(err.message || 'Could not load roles.');
      })
      .finally(() => {
        setRolesLoading(false);
      });
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      const user = await signUp({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
      });

      if (user?.needs_onboarding || user?.is_onboarded === false) {
        navigate('/profile-completion', { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes gradientBG {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ── Layout shell ── */
        .signup-root {
          display: flex;
          min-height: 100vh;
          flex-direction: row;
        }

        /* ── OTP input styling ── */
        .otp-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: nowrap;
        }
        .otp-input {
          width: 3rem;
          height: 3rem;
          text-align: center;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1.05rem;
          background: #fff;
          flex-shrink: 0;
        }
        .otp-input:focus {
          outline: none;
          border-color: rgba(99,102,241,1);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
        }

        /* ── Branding panel ── */
        .signup-brand {
          position: fixed;
          top: 0;
          left: 0;
          width: 50vw;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            -45deg,
            var(--color-primary),
            var(--color-primary-dark),
            var(--color-primary-light),
            #0072ff
          );
          background-size: 400% 400%;
          animation: gradientBG 12s ease infinite;
          color: var(--color-surface);
          z-index: 1;
        }

        .signup-brand-card {
          border-radius: 32px;
          padding: 2.8rem 2.2rem 2.2rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 95%;
          width: 440px;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid var(--color-primary-light);
        }

        .signup-brand-logo {
          max-height: 140px;
          width: auto;
          display: block;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 16px var(--color-primary-light));
        }

        .signup-brand-title {
          color: #000;
          font-weight: 800;
          font-size: 2.3rem;
          margin-bottom: 0.7rem;
          text-align: center;
          letter-spacing: -1px;
        }

        .signup-brand-subtitle {
          color: #000;
          font-size: 1.18rem;
          margin-bottom: 1.7rem;
          text-align: center;
          font-weight: 500;
        }

        .signup-brand-links {
          width: 100%;
          text-align: center;
          margin-bottom: 1.4rem;
          display: flex;
          justify-content: center;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .signup-brand-link {
          color: #000;
          text-decoration: underline;
          font-weight: 600;
          font-size: 1.05rem;
        }

        .signup-brand-support {
          color: #000;
          font-size: 1.02rem;
          text-align: center;
          font-weight: 500;
        }

        /* ── Form panel ── */
        .signup-form-panel {
          margin-left: 50vw;
          width: 50vw;
          min-height: 100vh;
          position: relative;
          z-index: 2;
          background: var(--color-bg);
        }

        /* ── Phone + Send OTP row ── */
        .phone-otp-row {
          display: flex;
          align-items: flex-start;
          gap: 0.525rem;
        }
        .phone-otp-row .phone-input-wrap {
          flex: 1;
          min-width: 0;
        }
        .phone-otp-row .send-otp-wrap {
          width: 7rem;
          flex-shrink: 0;
          /* Align button vertically with input (label ~1.375rem + gap) */
          padding-top: 1.625rem;
        }

        /* ────────────────────────────────────────────
           MOBILE  ≤ 768 px
        ──────────────────────────────────────────── */
        @media (max-width: 768px) {
          .signup-root {
            flex-direction: column;
          }

          /* ── Brand panel → compact top banner ── */
          .signup-brand {
            position: relative;
            width: 100%;
            height: auto;
            max-height: 58vh;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            padding: 1.5rem 1rem 1.2rem;
          }

          .signup-brand-card {
            width: 100%;
            max-width: 100%;
            padding: 1.35rem 1rem 1rem;
            border-radius: 20px;
            box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.18);
            flex-direction: column;
            align-items: center;
            gap: 0.65rem;
            text-align: center;
          }

          .signup-brand-logo {
            max-height: 88px;
            margin-bottom: 0.15rem;
            flex-shrink: 0;
          }

          /* Text column inside the card on mobile */
          .signup-brand-text-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.2rem;
            flex: 1;
            width: 100%;
          }

          .signup-brand-title {
            font-size: 1.25rem;
            margin-bottom: 0.1rem;
            letter-spacing: -0.5px;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
          }

          .signup-brand-subtitle {
            font-size: 0.98rem;
            margin-bottom: 0.45rem;
            line-height: 1.45;
          }

          .signup-brand-links {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            justify-content: center;
          }

          .signup-brand-link {
            font-size: 0.93rem;
          }

          .signup-brand-support {
            display: block;
            font-size: 0.9rem;
          }

          /* ── Form panel ── */
          .signup-form-panel {
            margin-left: 0;
            width: 100%;
            min-height: unset;
            flex: 0 0 auto;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 0.65rem 0.95rem 1.35rem;
          }

          /* ── Phone + OTP button row ── */
          .phone-otp-row {
            flex-direction: row;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .phone-otp-row .phone-input-wrap {
            flex: 1;
            min-width: 0;
          }
          .phone-otp-row .send-otp-wrap {
            width: 7rem;
            padding-top: 1.625rem;
          }

          /* ── OTP digit boxes ── */
          .otp-input {
            width: 2.4rem;
            height: 2.4rem;
            font-size: 0.95rem;
          }

          .otp-row {
            gap: 0.3rem;
          }

          /* Verify button inside OTP row */
          .otp-verify-wrap {
            flex-shrink: 0;
          }
        }

        /* ── Extra-small phones ≤ 400 px ── */
        @media (max-width: 400px) {
          .signup-brand-card {
            padding: 1rem 0.75rem;
            border-radius: 12px;
          }

          .signup-brand-title {
            font-size: 1.05rem;
          }

          .signup-brand-subtitle {
            font-size: 0.86rem;
            line-height: 1.4;
          }

          .otp-input {
            width: 2.1rem;
            height: 2.1rem;
            font-size: 0.88rem;
            border-radius: 6px;
          }

          .phone-otp-row .send-otp-wrap {
            width: 7rem;
          }
        }
      `}</style>

      <div className="signup-root auth-page">
        {/* ── Left / top branding panel ── */}
        <div className="signup-brand auth-brand">
          <div className="signup-brand-card">
            <img
              src="/logos/Potens_Energy_Logo.png"
              alt="Potens Energy Logo"
              className="signup-brand-logo"
            />
            {/* Text column — on desktop these styles are overridden by flex-column on the card */}
            <div className="signup-brand-text-col">
              <h1 className="signup-brand-title">
                Welcome to <span>Potens Portal</span>
              </h1>
              <p className="signup-brand-subtitle">
                Manage your energy journey with confidence.
                <br />
                <strong>Secure, unified, and built for scale.</strong>
                <br />
                <span style={{ fontWeight: 500 }}>
                  Support: 18003135280
                </span>
              </p>
            </div>
            <div className="signup-brand-links">
              <a href="#" className="signup-brand-link">
                YouTube
              </a>
              <a href="#" className="signup-brand-link">
                Privacy Policy
              </a>
              <a href="#" className="signup-brand-link">
                Other Info
              </a>
            </div>
            <p className="signup-brand-support">
              For help, contact{" "}
              <a
                href="mailto:support@potensenergy.in"
                style={{
                  color: "#000",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                support@potensenergy.in
              </a>
            </p>
          </div>
        </div>

        {/* ── Right / bottom form panel ── */}
        <div className="signup-form-panel auth-form-panel">
          <div className="auth-form-shell">
            <div className="auth-form-container auth-form-card">
              <div className="auth-form-header">
                <p className="auth-eyebrow">Create Account</p>
                <h2 className="auth-title">Create your account</h2>
                <p className="auth-subtitle">
                  Get started in minutes and unlock your full partner dashboard.
                </p>
              </div>

              {apiError && (
                <Alert
                  type="error"
                  message={apiError}
                  onClose={() => setApiError("")}
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />

                {/* ── Phone + Send OTP ── */}
                <div className="phone-otp-row">
                  <div className="phone-input-wrap">
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
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a2 2 0 011.895 1.368l1.02 3.06a2 2 0 01-.457 2.11l-1.373 1.373a16.042 16.042 0 006.586 6.586l1.373-1.373a2 2 0 012.11-.457l3.06 1.02A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      }
                    />
                  </div>

                  <div className="send-otp-wrap">
                    <Button
                      type="button"
                      onClick={async () => {
                        setOtpError('');
                        setOtpSuccess('');
                        if (!values.phone || values.phone.trim().length !== 10) {
                          setOtpError('Enter a valid 10-digit phone number.');
                          return;
                        }
                        setSendingOtp(true);
                        try {
                          const resp = await apiSendOtp({ phone: values.phone.trim() });
                          setOtpSent(true);
                          setOtpDigits(['', '', '', '', '', '']);
                          setOtpSuccess(resp.message || 'OTP sent to your phone.');
                          setTimeout(() => digitRefs.current[0]?.focus?.(), 60);
                        } catch (err) {
                          setOtpError(err.message || 'Failed to send OTP');
                        } finally {
                          setSendingOtp(false);
                        }
                      }}
                      loading={sendingOtp}
                      size="sm"
                      className="whitespace-nowrap"
                      fullWidth
                    >
                      Send OTP
                    </Button>
                  </div>
                </div>

                {otpError && (
                  <Alert type="error" message={otpError} onClose={() => setOtpError('')} className="mt-3" />
                )}
                {otpSuccess && (
                  <Alert type="success" message={otpSuccess} onClose={() => setOtpSuccess('')} className="mt-3" />
                )}

                {otpSent && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                    <div className="otp-row mt-2">
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => (digitRefs.current[i] = el)}
                          value={d}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                            const next = [...otpDigits];
                            next[i] = v;
                            setOtpDigits(next);
                            if (v && i < 5) digitRefs.current[i + 1]?.focus?.();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                              digitRefs.current[i - 1]?.focus?.();
                            }
                          }}
                          onPaste={(e) => {
                            const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                            const nums = paste.replace(/\D/g, '').slice(0, 6).split('');
                            if (nums.length) {
                              const next = ['','','','','',''];
                              nums.forEach((ch, idx) => { next[idx] = ch; });
                              setOtpDigits(next);
                              setTimeout(() => digitRefs.current[Math.min(nums.length,5)]?.focus?.(), 0);
                            }
                            e.preventDefault();
                          }}
                          inputMode="numeric"
                          maxLength={1}
                          className="otp-input"
                        />
                      ))}

                      <div className="otp-verify-wrap w-28">
                        <Button
                          type="button"
                          onClick={async () => {
                            setOtpError('');
                            setOtpSuccess('');
                            const otp = otpDigits.join('');
                            if (otp.length !== 6) {
                              setOtpError('Enter the 6-digit OTP.');
                              return;
                            }
                            setVerifyingOtp(true);
                            try {
                              const resp = await apiVerifyOtp({ phone: values.phone.trim(), otp });
                              setOtpSuccess(resp.message || 'Phone verified successfully.');
                            } catch (err) {
                              setOtpError(err.message || 'OTP verification failed');
                            } finally {
                              setVerifyingOtp(false);
                            }
                          }}
                          loading={verifyingOtp}
                          size="sm"
                          fullWidth
                        >
                          Verify OTP
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  }
                />

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {rolesLoading ? (
                    <div className="flex items-center gap-2 py-2.5 text-sm text-gray-500">
                      <Spinner size="sm" />
                      <span>Loading roles…</span>
                    </div>
                  ) : rolesError ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-red-500">{rolesError}</p>
                      <button
                        type="button"
                        onClick={fetchRoles}
                        className="text-sm text-indigo-600 underline hover:text-indigo-800"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <select
                      id="role"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={rolesLoading}
                      className={[
                        "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900",
                        "transition-colors duration-150 outline-none",
                        "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                        errors.role
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      <option value="">Select a role…</option>
                      {Object.entries(rolesByCategory).map(
                        ([category, categoryRoles]) => (
                          <optgroup key={category} label={category}>
                            {categoryRoles.map((r) => (
                              <option
                                key={r._id || r.id || r.name}
                                value={r._id || r.id || r.name}
                              >
                                {r.display_name || r.label || r.name}
                              </option>
                            ))}
                          </optgroup>
                        ),
                      )}
                    </select>
                  )}
                  {errors.role && (
                    <p className="text-xs text-red-500 mt-0.5">{errors.role}</p>
                  )}
                </div>

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
                  helperText={!errors.password && "Use at least 8 characters."}
                  leftIcon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                />

                <p className="terms-text">
                  By creating an account you agree to our{" "}
                  <a href="#" className="auth-link">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="auth-link">
                    Privacy Policy
                  </a>
                  .
                </p>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Create account
                </Button>

                <p className="auth-helper-note">
                  Your account details are encrypted and kept private.
                </p>
              </form>

              <p className="auth-switch">
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;