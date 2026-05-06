import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useForm from "../../hooks/useForm.js";
import { validators } from "../../utils/validators.js";
import { Button, Input, Card, Alert } from "../../components/ui/index.js";
import { apiForgotPassword } from "../../utils/api.js";

const validationRules = {
  email: validators.email,
  password: validators.required,
};

const forgotValidationRules = {
  identifier: validators.required,
  password: validators.password,
  confirmPassword: (value, allValues) =>
    validators.confirmPassword(allValues.password)(value),
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(
    { email: "", password: "" },
    validationRules,
  );

  const {
    values: forgotValues,
    errors: forgotErrors,
    handleChange: handleForgotChange,
    handleBlur: handleForgotBlur,
    validateAll: validateForgotAll,
    reset: resetForgotForm,
    setErrors: setForgotErrors,
  } = useForm(
    { identifier: "", password: "", confirmPassword: "" },
    forgotValidationRules,
  );

  const openForgotModal = () => {
    setForgotError("");
    setForgotSuccess("");
    resetForgotForm();
    setIsForgotModalOpen(true);
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotError("");
    setForgotSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateAll()) return;

    setLoading(true);
    try {
      const user = await login({
        email: values.email,
        password: values.password,
      });
      // Log the logged-in user for debugging
      // eslint-disable-next-line no-console
      // console.log("Login success:", user);
      // If user needs onboarding, redirect to profile-completion
      if (user?.needs_onboarding || user?.is_onboarded === false) {
        navigate("/profile-completion", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!validateForgotAll()) return;

    const rawIdentifier = forgotValues.identifier.trim();
    const normalizedPhone = rawIdentifier.replace(/\D/g, "");
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawIdentifier);
    const isPhone = /^\d{10}$/.test(normalizedPhone);

    if (!isEmail && !isPhone) {
      setForgotErrors((prev) => ({
        ...prev,
        identifier: "Enter a valid email address or 10-digit phone number.",
      }));
      return;
    }

    setForgotLoading(true);
    try {
      const payload = {
        password: forgotValues.password,
        confirmPassword: forgotValues.confirmPassword,
      };

      if (isEmail) {
        payload.email = rawIdentifier;
      } else {
        payload.phone = normalizedPhone;
      }

      const response = await apiForgotPassword(payload);
      setForgotSuccess(
        response?.message || "Password reset successful. You can now sign in.",
      );
      resetForgotForm();
      closeForgotModal();
      navigate("/login", { replace: true });
    } catch (err) {
      setForgotError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setForgotLoading(false);
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
        .login-root {
          display: flex;
          min-height: 100vh;
          flex-direction: row;
        }

        /* ── Branding panel ── */
        .login-brand {
          position: fixed;
          top: 0;
          left: 0;
          width: 50vw;
          height: 100vh;
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

        .login-brand-card {
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

        .login-brand-logo {
          max-height: 140px;
          width: auto;
          display: block;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 16px var(--color-primary-light));
        }

        .login-brand-title {
          color: #000;
          font-weight: 800;
          font-size: 2.3rem;
          margin-bottom: 0.7rem;
          text-align: center;
          letter-spacing: -1px;
        }

        .login-brand-subtitle {
          color: #000;
          font-size: 1.18rem;
          margin-bottom: 1.7rem;
          text-align: center;
          font-weight: 500;
        }

        .login-brand-links {
          width: 100%;
          text-align: center;
          margin-bottom: 1.4rem;
          display: flex;
          justify-content: center;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .login-brand-link {
          color: #000;
          text-decoration: underline;
          font-weight: 600;
          font-size: 1.05rem;
        }

        .login-brand-support {
          color: #000;
          font-size: 1.02rem;
          text-align: center;
          font-weight: 500;
        }

        /* ── Form panel ── */
        .login-form-panel {
          margin-left: 50vw;
          width: 50vw;
          min-height: 100vh;
          position: relative;
          z-index: 2;
          background: var(--color-bg);
        }

        /* ────────────────────────────────────────────
           MOBILE  ≤ 768 px
        ──────────────────────────────────────────── */
        @media (max-width: 768px) {
          .login-root {
            flex-direction: column;
          }

          /* Brand panel becomes a compact top banner */
          .login-brand {
            position: relative;          /* back in flow */
            width: 100%;
            height: auto;
            padding: 2rem 1rem 1.6rem;
          }

          .login-brand-card {
            width: 100%;
            max-width: 100%;
            padding: 1.6rem 1.2rem 1.2rem;
            border-radius: 20px;
          }

          .login-brand-logo {
            max-height: 80px;
            margin-bottom: 1rem;
          }

          .login-brand-title {
            font-size: 1.5rem;
            margin-bottom: 0.4rem;
          }

          .login-brand-subtitle {
            font-size: 0.97rem;
            margin-bottom: 1rem;
          }

          .login-brand-links {
            gap: 0.8rem;
            margin-bottom: 0.9rem;
          }

          .login-brand-link {
            font-size: 0.93rem;
          }

          .login-brand-support {
            font-size: 0.9rem;
          }

          /* Form panel takes full width below the banner */
          .login-form-panel {
            margin-left: 0;
            width: 100%;
            min-height: unset;
          }
        }

        /* Extra-small phones */
        @media (max-width: 400px) {
          .login-brand-card {
            padding: 1.2rem 0.8rem;
            border-radius: 14px;
          }

          .login-brand-title {
            font-size: 1.25rem;
          }
        }

        /* Forgot password modal */
        .forgot-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
          backdrop-filter: blur(4px);
        }

        .forgot-modal-card {
          width: 100%;
          max-width: 520px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
          padding: 1.4rem;
        }

        .forgot-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .forgot-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.2rem;
        }

        .forgot-modal-subtitle {
          font-size: 0.92rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .forgot-modal-close {
          border: 0;
          background: transparent;
          font-size: 1.45rem;
          line-height: 1;
          color: #6b7280;
          cursor: pointer;
          padding: 0.15rem;
        }

        .forgot-modal-close:hover {
          color: #111827;
        }

        .forgot-modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .forgot-modal-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.2rem;
        }

        @media (max-width: 480px) {
          .forgot-modal-card {
            padding: 1rem;
            border-radius: 14px;
          }

          .forgot-modal-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="login-root auth-page">
        {/* ── Left / top branding panel ── */}
        <div className="login-brand auth-brand">
          <div className="login-brand-card">
            <img
              src="/logos/Potens_Energy_Logo.png"
              alt="Potens Energy Logo"
              className="login-brand-logo"
            />
            <h1 className="login-brand-title">
              Welcome to <span>Potens Portal</span>
            </h1>
            <p className="login-brand-subtitle">
              Manage your energy journey with confidence.
              <br />
              <span style={{ fontWeight: 700 }}>
                Secure, unified, and built for scale.
              </span>
              <br />
              <span style={{ fontWeight: 500 }}>
                Support Contact: 18003135280
              </span>
            </p>
            {/* <a
              href="https://wa.me/918003135280?text=Hello%20I%20need%20support"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 700,
                color: "#25D366",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              💬 Need help? Chat on WhatsApp
            </a> */}
            <div className="login-brand-links">
              <a href="#" className="login-brand-link">
                YouTube
              </a>
              <a href="#" className="login-brand-link">
                Privacy Policy
              </a>
              <a href="#" className="login-brand-link">
                Other Info
              </a>
            </div>
            <p className="login-brand-support">
              For help, contact{" "}
              <a
                href="mailto:info@potensgreenengineering.in"
                style={{
                  color: "#000",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                info@potensgreenengineering.in
              </a>
            </p>
          </div>
        </div>

        {/* ── Right / bottom form panel ── */}
        <div className="login-form-panel auth-form-panel">
          <div className="auth-form-shell">
            <div className="auth-form-container auth-form-card">
              <div className="auth-form-header">
                <p className="auth-eyebrow">Sign In</p>
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">
                  Sign in to manage your profile and dashboard updates.
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

                <div className="auth-forgot">
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={openForgotModal}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Sign in
                </Button>

                <p className="auth-helper-note">
                  Secure login protected with encrypted session handling.
                </p>
              </form>

              <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="auth-link">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {isForgotModalOpen && (
        <div
          className="forgot-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeForgotModal();
          }}
          role="presentation"
        >
          <Card className="forgot-modal-card">
            <div className="forgot-modal-header">
              <div>
                <h3 className="forgot-modal-title">Forgot password</h3>
                <p className="forgot-modal-subtitle">
                  Enter your email or phone number and set a new password.
                </p>
              </div>
              <button
                type="button"
                className="forgot-modal-close"
                aria-label="Close forgot password"
                onClick={closeForgotModal}
              >
                ×
              </button>
            </div>

            {forgotError && (
              <Alert
                type="error"
                message={forgotError}
                onClose={() => setForgotError("")}
                className="mb-4"
              />
            )}

            {forgotSuccess && (
              <Alert
                type="success"
                message={forgotSuccess}
                onClose={() => setForgotSuccess("")}
                className="mb-4"
              />
            )}

            <form
              onSubmit={handleForgotSubmit}
              noValidate
              className="forgot-modal-form"
            >
              <Input
                id="identifier"
                name="identifier"
                label="Email or phone"
                type="text"
                placeholder="user@example.com or 9876543210"
                value={forgotValues.identifier}
                onChange={handleForgotChange}
                onBlur={handleForgotBlur}
                error={forgotErrors.identifier}
                required
              />

              <Input
                id="forgotPassword"
                name="password"
                label="New password"
                type="password"
                placeholder="Enter new password"
                value={forgotValues.password}
                onChange={handleForgotChange}
                onBlur={handleForgotBlur}
                error={forgotErrors.password}
                required
                autoComplete="new-password"
              />

              <Input
                id="confirmForgotPassword"
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                placeholder="Re-enter new password"
                value={forgotValues.confirmPassword}
                onChange={handleForgotChange}
                onBlur={handleForgotBlur}
                error={forgotErrors.confirmPassword}
                required
                autoComplete="new-password"
              />

              <div className="forgot-modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeForgotModal}
                  disabled={forgotLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={forgotLoading}>
                  Reset password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;
