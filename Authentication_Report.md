# SkyGPT Authentication & Security System Report (Hinglish)

Yeh report SkyGPT project ke **Authentication aur Security System** ke har ek logic, module, token parameters, encryption, aur security layers ko simple Hinglish me explain karti hai. Har ek topic me **What, Why, How, Alternatives, Working, Syntax (with File Path), aur Analogy** cover kiya gaya hai.

---

## Index of Topics Covered
1. **JSON Web Tokens (JWT)** (Access & Refresh Tokens)
2. **BcryptJS** (Password Hashing & Salting)
3. **HttpOnly Cookies** (Secure Session Cookie Management)
4. **Silent Refresh & Token Rotation** (Automatic session persistence)
5. **Express Validator** (Input validation middleware)
6. **Rate Limiting (authLimiter)** (Protection against Brute-force attacks)
7. **Custom XSS Sanitization & Mongo Sanitize** (Script & Database injection shields)
8. **OAuth 2.0 Integration** (Google & GitHub login flow)
9. **Secure Password Recovery Flow** (Reset links, tokens, and email alerts)

---

## 1. JSON Web Tokens (JWT)
* **What**: JWT ek open standard compact string token format (Header.Payload.Signature) hai jo JSON objects ko digital sign ke saath securely transfer karne ke kaam aata hai.
* **Why**: Server ko stateful session keys save karne se bachane (Stateless backend) ke liye JWT use kiya gaya hai. Isme Access Token (15 min lifespan) aur Refresh Token (7 days lifespan) design use hua hai.
* **How & File Path**: [tokenUtils.js](file:///e:/SkyGPT_old/Backend/auth/utils/tokenUtils.js) (Generation) aur [authMiddleware.js](file:///e:/SkyGPT_old/Backend/auth/middlewares/authMiddleware.js) (Verification).
* **Syntax**:
  ```javascript
  // Backend/auth/utils/tokenUtils.js
  import jwt from "jsonwebtoken";

  export const generateAccessToken = (user) => {
    return jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
  };
  ```
* **Alternate**: Express Sessions with Redis store, Session Cookies with Database verification.
* **Working**: Login hone par server token data encrypt signature banata hai. Client use browser local memory cookies me save rakhta hai. Har API call ke time browser ise headers me pass karta hai. Middleware token verify karta hai bina database lookup kiye, jisse server performance high rehti hai.
* **Analogy**: Ek concert entry ticket ki tarah. Ticket par security stamp aur validity time (Payload & Signature) printed hota hai. Entry guard check post par sirf stamp dekhta hai aur pass de deta hai; ticket verify karne ke liye use office computer system check karne ki zarurat nahi hoti.

---

## 2. BcryptJS
* **What**: BcryptJS ek popular cryptographic password hashing library hai jo automatic salt-generation use karti hai password encrypt karne ke liye.
* **Why**: Database security ke liye pure passwords (plain text passwords) ko database me save karna illegal aur bada security threat hai. Kal ko database hack bhi ho jaye toh attackers ko normal readable passwords na milein, isliye use hash value me store kiya jata hai.
* **How & File Path**: [authController.js](file:///e:/SkyGPT_old/Backend/auth/controllers/authController.js) registration aur login check handles me.
* **Syntax**:
  ```javascript
  // Backend/auth/controllers/authController.js
  import bcrypt from "bcryptjs";

  // Register encryption
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  // Login verification
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  ```
* **Alternate**: Argon2, PBKDF2, Node.js Crypto modules (scrypt).
* **Working**: Salt ek random string add karta hai aur is input string ko complex hashing algorithm (Blowfish cipher engine) ke loop se process karta hai. Result block static hash string values output deta hai. Compare ke time check hash matching calculate karke correct status true/false return karta hai.
* **Analogy**: Ek lock maker system. Lock design input text change (plain password) ko customized multi-layer complex patterns me loop karke ek encrypted code key design kar deta hai. Dobara password matching verify karne ke liye logic codes check karte hain ki inputs same frame matching patterns produce kar rahe hain ya nahi.

---

## 3. HttpOnly Cookies
* **What**: HttpOnly cookie ek aisi security setting parameter hai jise client JavaScript code (like document.cookie API commands) browser dev console par direct access ya read nahi kar sakta.
* **Why**: LocalStorage aur SessionStorage me tokens save karne se browser standard Cross-Site Scripting (XSS) attacks vulnerable ho jata hai jisme dangerous scripts aapke users ke access tokens chori kar sakte hain. HttpOnly cookies is threat ko fully block kar deti hain.
* **How & File Path**: [authConfig.js](file:///e:/SkyGPT_old/Backend/auth/config/authConfig.js) cookies settings me aur controllers me token settings parameters me apply hota hai.
* **Syntax**:
  ```javascript
  // Backend/auth/config/authConfig.js
  cookieOptions: {
      httpOnly: true, // Prevent client JS access
      secure: process.env.NODE_ENV === "production", // HTTPS only
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-origin protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
  }
  ```
* **Alternate**: Custom Headers transmission, LocalStorage memory cache structure.
* **Working**: Server response set-cookie parameters instructions ke sath client browser par inject karta hai. Browser cookies settings register karke locking state activate karta hai. Backend API call dispatch time par browser request packet me security check matching origin cookies automatically pack karke forward karta hai.
* **Analogy**: Bank security deposit locker key jo bank manager ke pass safe locked box me rehti hai. Lock system parameters keys customer ke view list me access (HTML read) hone ke bajaye direct bank system verification gates ke through direct execute hoti hain.

---

## 4. Silent Refresh & Token Rotation
* **What**: Access Token expiry hone par client UI blocks interrupt kiye bina automatic token rotation verification background fetch background me check parameters update execute karana.
* **Why**: Access token safety rules ke liye short life indicators duration (15 minutes) ke sath configured hote hain. Agar client har 15 minute me authentication manual state check screen popups dikhayega toh user experience bad ho jayega. Silent refresh background cookie validation refresh refresh dynamic validation process manage karta hai.
* **How & File Path**: [authMiddleware.js](file:///e:/SkyGPT_old/Backend/auth/middlewares/authMiddleware.js) file validation framework protect loop logic me configuration.
* **Syntax**:
  ```javascript
  // Backend/auth/middlewares/authMiddleware.js
  // Fallback silent refresh when Access Token is expired
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
          const user = await User.findById(decodedRefresh.id);
          const newAccessToken = generateAccessToken(user);
          
          res.cookie("accessToken", newAccessToken, {
              ...authConfig.cookieOptions,
              maxAge: 15 * 60 * 1000, // 15 min reset
          });
          req.user = user;
          return next();
      }
  }
  ```
* **Alternate**: Local storage expiry intervals check intervals trigger, manual page refresh logic.
* **Working**: Protect middleware check flow check access token fails or validates expired check indicators run. Server checking validation cookie check refresh code state dynamic checks execute. Database verify values confirm status, issues dynamic new fresh cookie arrays updates instantly.
* **Analogy**: VIP card duration tracker code verification gate. Security guard check validity. Agar short term pass expire milta hai toh aapko security gate se wapas bahar bhejne ke bajaye wahan verify system verification check register verification pass refresh background processing kar deta hai.

---

## 5. Express Validator
* **What**: Ek backend data check parsing structure middleware utility collection.
* **Why**: Users inputs strings (Register signup emails, passwords matching parameter inputs) checks parameters rules verification security guidelines implement check indicators logic configurations verify.
* **How & File Path**: [validation.js](file:///e:/SkyGPT_old/Backend/auth/middlewares/validation.js) rules configure validation.
* **Syntax**:
  ```javascript
  // Backend/auth/middlewares/validation.js
  export const registerValidation = [
      body("username").trim().notEmpty().isLength({ min: 3 }),
      body("email").trim().isEmail().normalizeEmail(),
      body("password").notEmpty().isLength({ min: 6 }),
      body("confirmPassword").custom((value, { req }) => {
          if (value !== req.body.password) throw new Error("Passwords do not match");
          return true;
      })
  ];
  ```
* **Alternate**: Joi validation library, Yup schema validators, custom regex manual if-else parsing checkers.
* **Working**: Requests data arrays parsing controllers processing level check list middlewares execute check parameters. Validation matches results array compile checks variables arrays, checks errors. Matches errors compile returns Status 400 with response payload description.
* **Analogy**: Airport check-in baggage criteria inspector. Bag size dimension matching criteria verify checker standard parameters checks pass values confirm parameters forward structure.

---

## 6. Rate Limiting (authLimiter)
* **What**: Ek custom request frequency controller security limiter middleware system.
* **Why**: Bruteforce login credential cracking scripts, API spam bots request systems parameters overload block server threads prevent, security layers.
* **How & File Path**: [security.js](file:///e:/SkyGPT_old/Backend/auth/middlewares/security.js) limiter config.
* **Syntax**:
  ```javascript
  // Backend/auth/middlewares/security.js
  export const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min window
      max: 100, // limit each IP to 100 requests per windowMs
      message: { error: "Too many authentication attempts, please try again after 15 minutes" }
  });
  ```
* **Alternate**: Cloudflare CDN rules, Redis token bucket limits, IP ban server firewalls natively.
* **Working**: Middleware request incoming IP parameters tracker counters array register memory database structure tracking indicators log counters checks. Limit values parameter bounds bypass trigger state status 429 response message reject return.
* **Analogy**: Metro station ticket access gate machine parameters swipe limits. Ek user token card continuous lines tap attempts limit locks triggers block gate entry permissions.

---

## 7. Custom XSS Sanitization & Mongo Sanitize
* **What**: Inputs sanitize system script filters aur NoSQL DB query parsing shields.
* **Why**: XSS Script payload injection attempts user inputs (e.g. `<script>steal()</script>`) and MongoDB query attacks injection scripts (`{ "$gt": "" }`) prevent values.
* **How & File Path**: [security.js](file:///e:/SkyGPT_old/Backend/auth/middlewares/security.js) security cleaning methods.
* **Syntax**:
  ```javascript
  // Backend/auth/middlewares/security.js
  export const xssClean = (req, res, next) => {
      const clean = (value) => {
          if (typeof value === "string") {
              return value
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
          }
          return value;
      };
      if (req.body) req.body = clean(req.body);
      next();
  };
  ```
* **Alternate**: DOMPurify HTML blocks, Mongoose model sanitize engines.
* **Working**: API request payload process elements parsing data properties, regex matching loops replacement keys apply targets formatting structure text codes changes.
* **Analogy**: Metal detector baggage security check gate scans inputs blocks unauthorized weapons elements before cargo load.

---

## 8. OAuth 2.0 Integration (Google & GitHub)
* **What**: Social network accounts identity providers integration framework validation loops.
* **Why**: Users login signup experience smooth, high speed login options with google github social profiles authenticate.
* **How & File Path**: [authController.js](file:///e:/SkyGPT_old/Backend/auth/controllers/authController.js) logic routines, redirects paths and [authService.js](file:///e:/SkyGPT_old/Backend/auth/services/authService.js) API fetch calls token exchanges.
* **Syntax**:
  ```javascript
  // Backend/auth/services/authService.js
  export const handleGoogleAuth = async (code) => {
    // 1. Exchange code for access token via oauth2.googleapis.com/token
    // 2. Fetch profile from googleapis.com/oauth2/v3/userinfo
    // 3. Find or Create User schema profile in database
  };
  ```
* **Alternate**: Passport.js library setups, Firebase Auth oauth integrations.
* **Working**: User click options redirects auth client token authorization code parameters returns callback URL. Backend receives authorization code parameters client secrets validation google services checks profile parameters, confirms database profile sync details, set credentials cookies.
* **Analogy**: VIP card identity scanner verification system check pass. Verification passport card confirms central authority validation check logs allow permissions.

---

## 9. Secure Password Recovery Flow
* **What**: Database account recovery security systems alerts.
* **Why**: Users password forget login resets securely handles password updates.
* **How & File Path**: [authController.js](file:///e:/SkyGPT_old/Backend/auth/controllers/authController.js) (Forgot & Reset endpoints) and email templates layouts.
* **Syntax**:
  ```javascript
  // Backend/auth/controllers/authController.js
  const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: "15m" }
  );
  const resetUrl = `${authConfig.frontendUrl}/reset-password?token=${resetToken}`;
  // Send email via nodemailer sendEmail utility
  ```
* **Alternate**: OTP SMS codes verification setups, security questions recovery engines.
* **Working**: Email input lookup validation user database profiles checks. Match user records generates short expiration token reset links template email triggers user inbox. Reset links verify decode validation keys, updates passwords hashes matching values database fields.
* **Analogy**: Temporary backup security house key. Safe temporary vault key which works only for 15 minutes to allow password room doors modification logs update actions.

---
Reports are completed and saved. You can check all details.
