import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register(username, email, password, confirmPassword);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  return (
    <div className="login-page-container">
      {/* Self-contained CSS Stylesheet for human-made minimalist design */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .login-page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100vw;
          background-color: #0b0b0f;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        /* Minimalist professional card */
        .login-card {
          background: #121216;
          border: 1px solid #22222a;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
        }

        /* Clean Logo Container */
        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }
        
        .logo-circle {
          display: inline-flex;
          width: 44px;
          height: 44px;
          margin-bottom: 16px;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          background: #1b1b22;
          border: 1px solid #32323f;
        }

        .logo-img {
          width: 24px;
          height: 24px;
        }

        .logo-fallback-char {
          font-size: 18px;
          font-weight: 700;
          color: #a78bfa;
        }

        .title-main {
          color: #ffffff;
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .subtitle-sec {
          color: #9494a3;
          font-size: 13.5px;
          margin: 0;
          line-height: 1.4;
        }

        /* Form Layout */
        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .field-label {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 500;
        }

        .input-text {
          background: #18181f;
          border: 1px solid #2e2e3a;
          border-radius: 6px;
          color: #ffffff;
          padding: 11px 13px;
          font-size: 14px;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          box-sizing: border-box;
        }

        .input-text:hover {
          border-color: #3e3e4f;
        }

        .input-text:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }

        /* Submit Button */
        .btn-submit {
          background: #7c3aed;
          border: 1px solid #7c3aed;
          border-radius: 6px;
          color: #ffffff;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
          margin-top: 6px;
        }

        .btn-submit:hover {
          background: #6d28d9;
          border-color: #6d28d9;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .divider-box {
          display: flex;
          align-items: center;
          margin: 20px 0;
        }

        .divider-bar {
          flex: 1;
          height: 1px;
          background: #22222a;
        }

        .divider-lbl {
          color: #64748b;
          font-size: 11px;
          padding: 0 10px;
          font-weight: 500;
        }

        /* Stacked OAuth Buttons */
        .oauth-btn-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .oauth-flat-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #18181f;
          border: 1px solid #2e2e3a;
          border-radius: 6px;
          color: #ffffff;
          padding: 11px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
          gap: 8px;
        }

        .oauth-flat-btn:hover {
          background: #202029;
          border-color: #3e3e4f;
        }

        .oauth-icon {
          font-size: 14px;
        }

        /* Flat Error Box */
        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
          color: #fca5a5;
          font-size: 13px;
          padding: 10px 12px;
          margin-bottom: 16px;
          text-align: left;
        }

        /* Footer Link */
        .footer-action {
          text-align: center;
          color: #64748b;
          font-size: 13.5px;
          margin-top: 24px;
          margin-bottom: 0;
        }

        .footer-link-highlight {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          margin-left: 4px;
          transition: color 0.15s;
        }

        .footer-link-highlight:hover {
          color: #c084fc;
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <img
              src="/blacklogo.png"
              alt="Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span className="logo-fallback-char" style={{ display: "none" }}>S</span>
          </div>
          <h2 className="title-main">Create your account</h2>
          <p className="subtitle-sec">Sign up for your free SkyGPT account</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="username" className="field-label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="input-text"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="field-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-text"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-text"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-text"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="divider-box">
          <span className="divider-bar"></span>
          <span className="divider-lbl">or</span>
          <span className="divider-bar"></span>
        </div>

        <div className="oauth-btn-stack">
          <button onClick={handleGoogleLogin} className="oauth-flat-btn">
            <i className="fa-brands fa-google oauth-icon" style={{ color: "#ea4335" }}></i>
            Continue with Google
          </button>

          <button onClick={handleGithubLogin} className="oauth-flat-btn">
            <i className="fa-brands fa-github oauth-icon" style={{ color: "#ffffff" }}></i>
            Continue with GitHub
          </button>
        </div>

        <p className="footer-action">
          Already have an account?
          <Link to="/login" className="footer-link-highlight">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
