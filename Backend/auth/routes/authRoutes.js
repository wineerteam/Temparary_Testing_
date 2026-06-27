import express from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
  forgotPassword,
  resetPassword,
  googleRedirect,
  googleCallback,
  githubRedirect,
  githubCallback,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middlewares/validation.js";

const router = express.Router();

// Local auth routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", protect, me);

// Password recovery routes
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

// OAuth Google routes
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

// OAuth GitHub routes
router.get("/github", githubRedirect);
router.get("/github/callback", githubCallback);

export default router;
