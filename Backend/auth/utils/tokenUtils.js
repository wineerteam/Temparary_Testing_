import jwt from "jsonwebtoken";
import { authConfig } from "../config/authConfig.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    authConfig.jwtSecret,
    { expiresIn: authConfig.accessTokenExpiresIn }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    authConfig.jwtRefreshSecret,
    { expiresIn: authConfig.refreshTokenExpiresIn }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtRefreshSecret);
  } catch (error) {
    return null;
  }
};
