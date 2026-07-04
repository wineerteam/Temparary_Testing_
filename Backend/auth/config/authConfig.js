export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || "skygpt_jwt_access_secret_key_2026_prod",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "skygpt_jwt_refresh_secret_key_2026_prod",
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "7d",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/api/auth/google/callback",
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:8080/api/auth/github/callback",
  }
};
