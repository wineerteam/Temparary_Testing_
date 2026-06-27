import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "../utils/tokenUtils.js";
import User from "../../models/User.js";
import { authConfig } from "../config/authConfig.js";

export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Check cookies
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // If access token is found, verify it
  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // 3. Fallback: If access token is invalid or missing, check refresh token for silent login
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  if (refreshToken) {
    const decodedRefresh = verifyRefreshToken(refreshToken);
    if (decodedRefresh) {
      try {
        const user = await User.findById(decodedRefresh.id);
        if (user) {
          // Generate new access token
          const newAccessToken = generateAccessToken(user);
          
          // Update cookie
          res.cookie("accessToken", newAccessToken, {
            ...authConfig.cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 mins
          });

          req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
          };
          return next();
        }
      } catch (error) {
        console.error("Silent refresh error in protect middleware:", error);
      }
    }
  }

  return res.status(401).json({ error: "Not authorized, token failed" });
};
