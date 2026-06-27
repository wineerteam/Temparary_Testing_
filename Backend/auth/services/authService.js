import User from "../../models/User.js";

export const handleGoogleAuth = async (code) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth environment variables are missing");
  }

  // 1. Exchange code for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL || "http://localhost:8080/api/auth/google/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Google token exchange failed: ${tokenData.error_description || tokenData.error}`);
  }

  // 2. Fetch user profile info
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const profile = await profileResponse.json();
  if (profile.error) {
    throw new Error(`Google profile fetch failed: ${profile.error_description || profile.error}`);
  }

  const { email, name, picture, sub } = profile;
  if (!email) {
    throw new Error("No email found in Google profile");
  }

  // 3. Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    // Generate unique username from name or email prefix
    let baseUsername = (name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
    let username = baseUsername;
    let count = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    user = new User({
      username,
      email,
      provider: "google",
      avatar: picture || "",
    });
  } else {
    // Update avatar and login timestamp
    if (picture && !user.avatar) {
      user.avatar = picture;
    }
  }

  user.lastLogin = new Date();
  await user.save();

  return user;
};

export const handleGithubAuth = async (code) => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth environment variables are missing");
  }

  // 1. Exchange code for access token
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: GITHUB_CALLBACK_URL || "http://localhost:8080/api/auth/github/callback",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`GitHub token exchange failed: ${tokenData.error_description || tokenData.error}`);
  }

  const accessToken = tokenData.access_token;

  // 2. Fetch user profile
  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
      "User-Agent": "SkyGPT-App",
    },
  });

  const profile = await profileResponse.json();
  if (!profile.login) {
    throw new Error("GitHub profile fetch failed");
  }

  // 3. Fetch user emails if private/missing in profile
  let email = profile.email;
  if (!email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "SkyGPT-App",
      },
    });
    const emails = await emailsResponse.json();
    if (Array.isArray(emails)) {
      const primaryEmailObj = emails.find((e) => e.primary && e.verified) || emails[0];
      if (primaryEmailObj) {
        email = primaryEmailObj.email;
      }
    }
  }

  if (!email) {
    // Generate a fallback github email if user has none
    email = `${profile.login}@users.noreply.github.com`;
  }

  // 4. Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    let baseUsername = profile.login.replace(/\s+/g, "").toLowerCase();
    let username = baseUsername;
    let count = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    user = new User({
      username,
      email,
      provider: "github",
      avatar: profile.avatar_url || "",
    });
  } else {
    if (profile.avatar_url && !user.avatar) {
      user.avatar = profile.avatar_url;
    }
  }

  user.lastLogin = new Date();
  await user.save();

  return user;
};
