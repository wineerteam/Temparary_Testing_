import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "Invalid reset token. Request a new link.");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (!password || !confirmPassword) {
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
    setMessage("");
    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      setMessage(res.message || "Password updated successfully");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
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
          <h2 style={styles.title}>Set new password</h2>
          <p style={styles.subtitle}>Create a strong, secure new password</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={!token}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={!token}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              ...styles.submitButton,
              ...(loading || !token ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p style={styles.footerText}>
          Back to{" "}
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

export default ResetPassword;
