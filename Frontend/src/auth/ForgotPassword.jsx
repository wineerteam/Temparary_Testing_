import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setMessage("");
    setResetUrl("");
    setPreviewUrl("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      if (res.previewUrl) {
        setPreviewUrl(res.previewUrl);
      }
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
    } catch (err) {
      setError(err.message || "Failed to initiate password reset");
    } finally {
      setLoading(false);
    }
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
          gap: 16px;
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

        /* Flat Alerts */
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

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 6px;
          color: #a7f3d0;
          font-size: 13px;
          padding: 10px 12px;
          margin-bottom: 16px;
          text-align: left;
        }

        /* Demo Link Container */
        .demo-link-container {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
          text-align: center;
        }

        .demo-link-label {
          color: #94a3b8;
          font-size: 12px;
          margin: 0 0 6px 0;
          font-weight: 500;
        }

        .demo-reset-anchor {
          display: inline-block;
          background: #2563eb;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: background-color 0.15s;
        }

        .demo-reset-anchor:hover {
          background: #1d4ed8;
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
          <h2 className="title-main">Reset password</h2>
          <p className="subtitle-sec">Enter your email to receive reset link</p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {message && <div className="alert-success">{message}</div>}

        {(resetUrl || previewUrl) && (
          <div className="demo-link-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {previewUrl && (
              <>
                <p className="demo-link-label" style={{ color: '#a7f3d0' }}>Mock Email Sent!</p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="demo-reset-anchor" style={{ background: '#10b981', color: '#ffffff', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', display: 'inline-block', fontSize: '13px', fontWeight: '500' }}>
                  Open Sent Email Preview 📬
                </a>
              </>
            )}
            {resetUrl && (
              <>
                <p className="demo-link-label" style={{ marginTop: previewUrl ? '8px' : '0' }}>Demo Reset Link:</p>
                <a href={resetUrl} className="demo-reset-anchor">
                  Click to Reset Password
                </a>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="email" className="field-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-text"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="footer-action">
          Remember your password?
          <Link to="/login" className="footer-link-highlight">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
