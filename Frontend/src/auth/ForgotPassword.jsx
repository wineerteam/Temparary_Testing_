import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
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
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src="/src/assets/blacklogo.png"
            alt="SkyGPT Logo"
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <h2 style={styles.title}>Reset your password</h2>
          <p style={styles.subtitle}>Enter your email to receive a recovery link</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}

        {resetUrl && (
          <div style={styles.linkContainer}>
            <p style={styles.linkLabel}>Demo Reset Link:</p>
            <a href={resetUrl} style={styles.resetButtonLink}>
              Click to Reset Password
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={styles.footerText}>
          Remember your password?{" "}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "radial-gradient(circle at center, #1b162c 0%, #0d0b13 100%)",
    fontFamily: "Outfit, Inter, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    width: "48px",
    height: "48px",
    marginBottom: "16px",
    filter: "invert(1) brightness(100)",
  },
  title: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#a0aec0",
    fontSize: "14px",
    margin: 0,
  },
  errorAlert: {
    background: "rgba(229, 62, 62, 0.15)",
    border: "1px solid rgba(229, 62, 62, 0.4)",
    borderRadius: "8px",
    color: "#fc8181",
    fontSize: "14px",
    padding: "12px",
    marginBottom: "20px",
    textAlign: "center",
  },
  successAlert: {
    background: "rgba(72, 187, 120, 0.15)",
    border: "1px solid rgba(72, 187, 120, 0.4)",
    borderRadius: "8px",
    color: "#68d391",
    fontSize: "14px",
    padding: "12px",
    marginBottom: "20px",
    textAlign: "center",
  },
  linkContainer: {
    background: "rgba(99, 179, 237, 0.1)",
    border: "1px solid rgba(99, 179, 237, 0.3)",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "20px",
    textAlign: "center",
  },
  linkLabel: {
    color: "#a0aec0",
    fontSize: "12px",
    margin: "0 0 8px 0",
  },
  resetButtonLink: {
    display: "inline-block",
    background: "#3182ce",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left",
  },
  label: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "12px 16px",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
  },
  submitButton: {
    background: "linear-gradient(135deg, #7f5af0 0%, #5833c7 100%)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.1s, opacity 0.2s",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footerText: {
    textAlign: "center",
    color: "#a0aec0",
    fontSize: "14px",
    marginTop: "24px",
    marginBottom: 0,
  },
  footerLink: {
    color: "#63b3ed",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default ForgotPassword;
