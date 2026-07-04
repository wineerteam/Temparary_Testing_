import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error");

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError || "");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to log in");
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
    <div className="saberali-container">
      {/* Self-contained CSS Stylesheet matching Image 9 (Saberali App) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        .saberali-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background-color: #09090b;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* Left Side: Brand Showcase Panel (Electric Blue) */
        .showcase-panel {
          flex: 1.1;
          background-color: #2563eb;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        /* Ambient bubble decoration in showcase background */
        .showcase-bubble {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 40px solid rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }
        .bubble-top {
          top: -100px;
          left: -100px;
        }
        .bubble-bottom {
          bottom: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 2;
        }

        .showcase-logo-circle {
          display: flex;
          width: 36px;
          height: 36px;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .showcase-logo-img {
          width: 22px;
          height: 22px;
        }

        .showcase-logo-fallback {
          font-size: 16px;
          font-weight: 800;
          color: #2563eb;
        }

        .showcase-info {
          margin-top: 40px;
          max-width: 480px;
          text-align: left;
          z-index: 2;
        }

        .showcase-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .showcase-desc {
          color: rgba(255, 255, 255, 0.85);
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        /* Mock Dashboard Panel (cropped at bottom) */
        .mock-dashboard {
          width: 110%;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 16px;
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-self: flex-start;
          z-index: 2;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          transform: translateY(20px);
        }

        .mock-db-header {
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid #27272a;
          padding-bottom: 12px;
        }

        .db-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-r { background-color: #ef4444; }
        .dot-y { background-color: #eab308; }
        .dot-g { background-color: #22c55e; }
        .db-path {
          color: #71717a;
          font-size: 11px;
          font-family: monospace;
          margin-left: 8px;
        }

        .mock-db-content {
          display: flex;
          gap: 16px;
        }

        .mock-db-sidebar {
          width: 28%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-right: 1px solid #27272a;
          padding-right: 12px;
        }

        .sidebar-item {
          height: 12px;
          border-radius: 3px;
          background: #27272a;
        }
        .sidebar-item-active {
          background: #2563eb;
        }

        .mock-db-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mock-chart-title {
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .mock-chart-container {
          height: 90px;
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          border-bottom: 1px solid #27272a;
          padding-bottom: 4px;
        }

        .chart-bar {
          flex: 1;
          background: #27272a;
          border-top-left-radius: 2px;
          border-top-right-radius: 2px;
          transition: height 0.3s;
        }
        .chart-bar-highlight {
          background: #2563eb;
        }

        /* Right Side: Form Panel (Slate Black) */
        .form-panel {
          flex: 0.9;
          background-color: #09090b;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px;
          z-index: 20;
        }

        .form-wrapper {
          width: 100%;
          max-width: 360px;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .form-desc {
          color: #71717a;
          font-size: 14px;
          margin: 0;
        }

        /* Form Inputs */
        .saber-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .input-label {
          color: #e4e4e7;
          font-size: 14px;
          font-weight: 500;
        }

        .input-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-anchor {
          color: #2563eb;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-anchor:hover {
          color: #3b82f6;
        }

        .input-box {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 8px;
          color: #ffffff;
          padding: 13px 16px;
          font-size: 14.5px;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          box-sizing: border-box;
        }

        .input-box:hover {
          border-color: #3f3f46;
        }

        .input-box:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        /* Submit Button */
        .btn-submit {
          background: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 8px;
          color: #ffffff;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s;
          margin-top: 10px;
        }

        .btn-submit:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .divider-row {
          display: flex;
          align-items: center;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #27272a;
        }

        .divider-text {
          color: #52525b;
          font-size: 11px;
          padding: 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Social Auth Stack */
        .oauth-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 8px;
          color: #ffffff;
          padding: 12px;
          font-size: 14.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
          gap: 10px;
        }

        .oauth-btn:hover {
          background: #27272a;
          border-color: #3f3f46;
        }

        .oauth-icon {
          font-size: 15px;
        }

        /* Error Box */
        .alert-danger {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 13.5px;
          padding: 10px 14px;
          margin-bottom: 20px;
          text-align: left;
        }

        /* Footer links */
        .footer-action {
          text-align: center;
          color: #71717a;
          font-size: 14px;
          margin-top: 28px;
          margin-bottom: 0;
        }

        .footer-highlight {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          margin-left: 4px;
          transition: color 0.15s;
        }
        .footer-highlight:hover {
          color: #3b82f6;
          text-decoration: underline;
        }

        @media (max-width: 960px) {
          .showcase-panel {
            display: none;
          }
          .form-panel {
            padding: 40px 24px;
            flex: 1;
          }
        }
      `}</style>

      {/* Left Panel: Showcase */}
      <div className="showcase-panel">
        <div className="showcase-bubble bubble-top"></div>
        <div className="showcase-bubble bubble-bottom"></div>

        <div className="showcase-header">
          <div className="showcase-logo-circle">
            <img
              src="/blacklogo.png"
              alt="Logo"
              className="showcase-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span className="showcase-logo-fallback" style={{ display: "none" }}>S</span>
          </div>
          <span className="brand-name" style={{ color: "#ffffff" }}>SkyGPT</span>
        </div>

        <div className="showcase-info">
          <h2 className="showcase-title">Designed for full cognitive telemetry Support</h2>
          <p className="showcase-desc">
            View all your session analytics, manage isolated user query logs, and monitor search data in real-time from anywhere.
          </p>

          {/* Interactive CSS Mock Dashboard */}
          <div className="mock-dashboard">
            <div className="mock-db-header">
              <div className="db-dot dot-r"></div>
              <div className="db-dot dot-y"></div>
              <div className="db-dot dot-g"></div>
              <span className="db-path">app.skygpt.co/statistics</span>
            </div>

            <div className="mock-db-content">
              <div className="mock-db-sidebar">
                <div className="sidebar-item sidebar-item-active" style={{ width: "80%" }}></div>
                <div className="sidebar-item" style={{ width: "60%" }}></div>
                <div className="sidebar-item" style={{ width: "70%" }}></div>
              </div>

              <div className="mock-db-main">
                <p className="mock-chart-title">Telemetry Search Count</p>
                <div className="mock-chart-container">
                  <div className="chart-bar" style={{ height: "40px" }}></div>
                  <div className="chart-bar chart-bar-highlight" style={{ height: "75px" }}></div>
                  <div className="chart-bar" style={{ height: "25px" }}></div>
                  <div className="chart-bar chart-bar-highlight" style={{ height: "60px" }}></div>
                  <div className="chart-bar" style={{ height: "45px" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "12px", zIndex: 2, textAlign: "left" }}>
          © 2026 SkyGPT. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="form-panel">
        <div className="form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Log in</h2>
            <p className="form-desc">Enter your credentials to continue</p>
          </div>

          {error && <div className="alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="saber-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail" className="input-label">Username or Email</label>
              <input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter email or username"
                className="input-box"
                required
              />
            </div>

            <div className="form-group">
              <div className="input-row">
                <label htmlFor="password" className="input-label">Password</label>
                <Link to="/forgot-password" className="forgot-anchor">Forgot password?</Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-box"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="divider-row">
            <span className="divider-line"></span>
            <span className="divider-text">or</span>
            <span className="divider-line"></span>
          </div>

          <div className="oauth-stack">
            <button onClick={handleGoogleLogin} className="oauth-btn">
              <i className="fa-brands fa-google oauth-icon" style={{ color: "#ea4335" }}></i>
              Log in with Google
            </button>

            <button onClick={handleGithubLogin} className="oauth-btn">
              <i className="fa-brands fa-github oauth-icon" style={{ color: "#ffffff" }}></i>
              Log in with GitHub
            </button>
          </div>

          <p className="footer-action">
            Don't have an account? 
            <Link to="/signup" className="footer-highlight">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
