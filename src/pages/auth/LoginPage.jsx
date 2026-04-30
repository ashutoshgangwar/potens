import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useForm from "../../hooks/useForm.js";
import { validators } from "../../utils/validators.js";
import { Button, Input, Card, Alert } from "../../components/ui/index.js";

const validationRules = {
  email: validators.email,
  password: validators.required,
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateAll } = useForm(
    { email: "", password: "" },
    validationRules,
  );

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
      console.log("Login success:", user);
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
                  <a href="#" className="forgot-link">
                    Forgot password?
                  </a>
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
    </>
  );
};

export default LoginPage;
