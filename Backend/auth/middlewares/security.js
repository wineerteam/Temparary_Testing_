import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Rate limiting for auth routes to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again after 15 minutes" },
});

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Custom XSS Sanitization Middleware
export const xssClean = (req, res, next) => {
  const clean = (value) => {
    if (typeof value === "string") {
      // Escape HTML tags to prevent XSS script injection
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    }
    if (Array.isArray(value)) {
      return value.map(clean);
    }
    if (typeof value === "object" && value !== null) {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = clean(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = clean(req.body);
  }
  if (req.query) {
    req.query = clean(req.query);
  }
  if (req.params) {
    req.params = clean(req.params);
  }

  next();
};

// Express Mongo Sanitize
export const mongoSanitizer = () => mongoSanitize();
