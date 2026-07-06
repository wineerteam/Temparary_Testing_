import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../../models/User.js";
import { authConfig } from "../config/authConfig.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";
import { handleGoogleAuth, handleGithubAuth } from "../services/authService.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/emailService.js";
import ActivityLog from "../../models/ActivityLog.js";
import { getLocationFromIP } from "../../utils/geo.js";

// Helper to set HttpOnly cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...authConfig.cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, authConfig.cookieOptions);
};

// Register local user
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, deviceId } = req.body;

  try {
    // Check if user exists by email or username
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      passwordHash,
      provider: "local",
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const accessToken = generateAccessToken(savedUser);
    const refreshToken = generateRefreshToken(savedUser);

    setTokenCookies(res, accessToken, refreshToken);

    // Silently log registration activity
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const geo = await getLocationFromIP(clientIp);

    const activityLog = new ActivityLog({
      userId: savedUser._id,
      activityType: "login",
      ipAddress: geo.ip || clientIp,
      location: geo.formatted || "Unknown Location",
      latitude: geo.latitude,
      longitude: geo.longitude,
      isp: geo.isp || "Unknown ISP",
      userAgent: userAgent,
      deviceId: deviceId || "",
      isProxyOrVpn: geo.isProxyOrVpn || false,
      details: "Registered new local user and logged in"
    });
    await activityLog.save();

    return res.status(201).json({
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        provider: savedUser.provider,
        avatar: savedUser.avatar,
        createdAt: savedUser.createdAt,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// Login user
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { usernameOrEmail, password, deviceId } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    if (user.provider !== "local") {
      return res.status(400).json({
        error: `This account was registered using ${user.provider}. Please use Continue with ${user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}.`,
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, refreshToken);

    user.lastLogin = new Date();
    await user.save();

    // Silently log login activity
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const geo = await getLocationFromIP(clientIp);

    const activityLog = new ActivityLog({
      userId: user._id,
      activityType: "login",
      ipAddress: geo.ip || clientIp,
      location: geo.formatted || "Unknown Location",
      latitude: geo.latitude,
      longitude: geo.longitude,
      isp: geo.isp || "Unknown ISP",
      userAgent: userAgent,
      deviceId: deviceId || "",
      isProxyOrVpn: geo.isProxyOrVpn || false,
      details: "Login via local credentials"
    });
    await activityLog.save();

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

// Refresh Access Token
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setTokenCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ error: "Server error during token refresh" });
  }
};

// Logout User
export const logout = async (req, res) => {
  res.clearCookie("accessToken", authConfig.cookieOptions);
  res.clearCookie("refreshToken", authConfig.cookieOptions);
  return res.json({ success: true, message: "Logged out successfully" });
};

// Get current logged in user details
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ error: "Server error fetching user profile" });
  }
};

// Forgot Password (initiates reset)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase(), provider: "local" });
    if (!user) {
      // For security, return success even if user not found
      return res.json({
        success: true,
        message: "If the email is registered, a password reset link has been sent.",
      });
    }

    // Generate reset token (expires in 15m)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: "15m" }
    );

    const resetUrl = `${authConfig.frontendUrl}/reset-password?token=${resetToken}`;
    
    // HTML email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #7c3aed; text-align: center;">Reset Your SkyGPT Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your SkyGPT account. Click the button below to choose a new password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #64748b; font-size: 14px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    // Send the email
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset Your SkyGPT Password",
      html: emailHtml,
    });

    const responsePayload = {
      success: true,
      message: "Password reset link has been sent to your email.",
    };

    // If Ethereal test mail was used, include the preview URL in the response for easy developer testing
    if (emailResult && emailResult.previewUrl) {
      responsePayload.previewUrl = emailResult.previewUrl;
      responsePayload.resetUrl = resetUrl;
      responsePayload.resetToken = resetToken;
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Server error processing request" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: "Invalid token or user not found" });
    }

    if (user.provider !== "local") {
      return res.status(400).json({ error: "Cannot reset password for social accounts" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }
};

// Google OAuth Authorization Redirect
export const googleRedirect = (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;
  
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google OAuth credentials not configured" });
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: GOOGLE_CALLBACK_URL || "http://localhost:8080/api/auth/google/callback",
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
};

// Google OAuth Callback
export const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${authConfig.frontendUrl}/login?error=Google auth failed`);
  }

  try {
    const user = await handleGoogleAuth(code);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, refreshToken);

    // Silently log OAuth login
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const geo = await getLocationFromIP(clientIp);

    const activityLog = new ActivityLog({
      userId: user._id,
      activityType: "login",
      ipAddress: geo.ip || clientIp,
      location: geo.formatted || "Unknown Location",
      latitude: geo.latitude,
      longitude: geo.longitude,
      isp: geo.isp || "Unknown ISP",
      userAgent: userAgent,
      deviceId: "", // OAuth redirect doesn't carry request body
      isProxyOrVpn: geo.isProxyOrVpn || false,
      details: "Login via Google OAuth callback"
    });
    await activityLog.save();

    // Redirect back to frontend dashboard
    return res.redirect(`${authConfig.frontendUrl}/`);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return res.redirect(`${authConfig.frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

// GitHub OAuth Authorization Redirect
export const githubRedirect = (req, res) => {
  const { GITHUB_CLIENT_ID, GITHUB_CALLBACK_URL } = process.env;

  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GitHub OAuth credentials not configured" });
  }

  const rootUrl = "https://github.com/login/oauth/authorize";
  const options = {
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL || "http://localhost:8080/api/auth/github/callback",
    scope: "user:email",
  };

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
};

// GitHub OAuth Callback
export const githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${authConfig.frontendUrl}/login?error=GitHub auth failed`);
  }

  try {
    const user = await handleGithubAuth(code);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokenCookies(res, accessToken, refreshToken);

    // Silently log OAuth login
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const geo = await getLocationFromIP(clientIp);

    const activityLog = new ActivityLog({
      userId: user._id,
      activityType: "login",
      ipAddress: geo.ip || clientIp,
      location: geo.formatted || "Unknown Location",
      latitude: geo.latitude,
      longitude: geo.longitude,
      isp: geo.isp || "Unknown ISP",
      userAgent: userAgent,
      deviceId: "", // OAuth redirect doesn't carry request body
      isProxyOrVpn: geo.isProxyOrVpn || false,
      details: "Login via GitHub OAuth callback"
    });
    await activityLog.save();

    // Redirect back to frontend dashboard
    return res.redirect(`${authConfig.frontendUrl}/`);
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return res.redirect(`${authConfig.frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};
