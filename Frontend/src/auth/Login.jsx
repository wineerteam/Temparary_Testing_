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
          <h2 style={styles.title}>Welcome back to SkyGPT</h2>
          <p style={styles.subtitle}>Sign in to access your secure workspace</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="usernameOrEmail" style={styles.label}>Username or Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div style={styles.dividerContainer}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.oauthContainer}>
          <button onClick={handleGoogleLogin} style={styles.oauthButton}>
            <i className="fa-brands fa-google" style={{ ...styles.oauthIcon, color: "#ea4335" }}></i>
            Continue with Google
          </button>

          <button onClick={handleGithubLogin} style={styles.oauthButton}>
            <i className="fa-brands fa-github" style={{ ...styles.oauthIcon, color: "#ffffff" }}></i>
            Continue with GitHub
          </button>
        </div>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.footerLink}>Sign up</Link>
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
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "500",
  },
  forgotLink: {
    color: "#63b3ed",
    fontSize: "13px",
    textDecoration: "none",
    transition: "color 0.2s",
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
    marginTop: "10px",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "#718096",
    fontSize: "12px",
    padding: "0 12px",
    fontWeight: "600",
  },
  oauthContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  oauthButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s, border-color 0.2s",
    gap: "10px",
  },
  oauthIcon: {
    fontSize: "18px",
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

export default Login;
