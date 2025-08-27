"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthStart = googleAuthStart;
exports.googleAuthCallback = googleAuthCallback;
exports.githubAuthStart = githubAuthStart;
exports.githubAuthCallback = githubAuthCallback;
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.refreshToken = refreshToken;
exports.getProfile = getProfile;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const env_config_1 = require("../config/env.config");
const JWT_SECRET = env_config_1.envConfig.JWT_SECRET;
const JWT_EXPIRES_IN = env_config_1.envConfig.JWT_EXPIRES_IN || "7d";
// =====================
// OAuth: Google & GitHub
// =====================
function buildFrontendCallbackUrl(query) {
    const base = (env_config_1.envConfig.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const qs = new URLSearchParams(query).toString();
    return `${base}/auth/callback${qs ? `?${qs}` : ""}`;
}
function signJwtForUser(user) {
    return jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
async function findOrCreateUserFromOAuth(profile, provider) {
    const email = (profile.email || "").trim().toLowerCase();
    if (!email)
        throw new Error("Email not provided by OAuth provider");
    let user = await user_model_1.default.findOne({ email });
    if (!user) {
        user = new user_model_1.default({
            name: profile.name || email.split("@")[0],
            email,
            avatar: profile.avatar,
            isOnline: true,
            lastSeen: new Date(),
            oauthProviders: provider?.name && provider?.id ? { [provider.name]: { id: provider.id } } : undefined,
        });
        await user.save();
    }
    else {
        // Update last seen / avatar if changed
        const updates = { isOnline: true, lastSeen: new Date() };
        if (profile.avatar && user.avatar !== profile.avatar)
            updates.avatar = profile.avatar;
        if (provider?.name && provider?.id) {
            updates["oauthProviders." + provider.name + ".id"] = provider.id;
        }
        await user_model_1.default.findByIdAndUpdate(user._id, updates);
    }
    return user;
}
// ---- Google OAuth ----
async function googleAuthStart(req, res) {
    try {
        const clientId = env_config_1.envConfig.GOOGLE_CLIENT_ID;
        const redirectUri = env_config_1.envConfig.GOOGLE_REDIRECT_URI;
        if (!clientId || !redirectUri) {
            return res.status(500).json({ success: false, message: "Google OAuth not configured" });
        }
        // CSRF protection: generate state and store in short-lived cookie
        const state = crypto_1.default.randomBytes(16).toString("hex");
        res.cookie("oauth_state_google", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 10, // 10 minutes
        });
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            include_granted_scopes: "true",
            prompt: "consent",
            state,
        });
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return res.redirect(authUrl);
    }
    catch (e) {
        const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Google auth init failed") });
        return res.redirect(url);
    }
}
async function googleAuthCallback(req, res) {
    try {
        const code = String(req.query.code || "");
        const state = String(req.query.state || "");
        const clientId = env_config_1.envConfig.GOOGLE_CLIENT_ID;
        const clientSecret = env_config_1.envConfig.GOOGLE_CLIENT_SECRET;
        const redirectUri = env_config_1.envConfig.GOOGLE_REDIRECT_URI;
        if (!code || !clientId || !clientSecret || !redirectUri) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Invalid Google callback") });
            return res.redirect(url);
        }
        // Validate state
        const cookieState = req.cookies?.oauth_state_google;
        if (!state || !cookieState || state !== cookieState) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Invalid state parameter") });
            return res.redirect(url);
        }
        // Exchange code for tokens
        const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });
        const tokenJson = await tokenResp.json();
        if (!tokenResp.ok) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Google token exchange failed") });
            return res.redirect(url);
        }
        // Fetch userinfo
        const userResp = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });
        const userInfo = await userResp.json();
        if (!userResp.ok) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Failed to fetch Google user info") });
            return res.redirect(url);
        }
        const user = await findOrCreateUserFromOAuth({
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
        }, { name: "google", id: userInfo.sub });
        const token = signJwtForUser(user);
        // Optionally set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        // Clear state cookie and redirect to frontend without leaking token in URL
        res.clearCookie('oauth_state_google');
        const url = buildFrontendCallbackUrl({});
        return res.redirect(url);
    }
    catch (e) {
        const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Google auth failed") });
        return res.redirect(url);
    }
}
// ---- GitHub OAuth ----
async function githubAuthStart(req, res) {
    try {
        const clientId = env_config_1.envConfig.GITHUB_CLIENT_ID;
        const redirectUri = env_config_1.envConfig.GITHUB_REDIRECT_URI;
        if (!clientId || !redirectUri) {
            return res.status(500).json({ success: false, message: "GitHub OAuth not configured" });
        }
        const state = crypto_1.default.randomBytes(16).toString("hex");
        res.cookie("oauth_state_github", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 10,
        });
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: "read:user user:email",
            allow_signup: "true",
            state,
        });
        const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        return res.redirect(authUrl);
    }
    catch (e) {
        const url = buildFrontendCallbackUrl({ error: encodeURIComponent("GitHub auth init failed") });
        return res.redirect(url);
    }
}
async function githubAuthCallback(req, res) {
    try {
        const code = String(req.query.code || "");
        const state = String(req.query.state || "");
        const clientId = env_config_1.envConfig.GITHUB_CLIENT_ID;
        const clientSecret = env_config_1.envConfig.GITHUB_CLIENT_SECRET;
        const redirectUri = env_config_1.envConfig.GITHUB_REDIRECT_URI;
        if (!code || !clientId || !clientSecret || !redirectUri) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Invalid GitHub callback") });
            return res.redirect(url);
        }
        const cookieState = req.cookies?.oauth_state_github;
        if (!state || !cookieState || state !== cookieState) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Invalid state parameter") });
            return res.redirect(url);
        }
        // Exchange code for access token
        const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });
        const tokenJson = await tokenResp.json();
        if (!tokenResp.ok || !tokenJson.access_token) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("GitHub token exchange failed") });
            return res.redirect(url);
        }
        // Fetch user info
        const ghUserResp = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${tokenJson.access_token}`, "User-Agent": "DevSwap.live" },
        });
        const ghUser = await ghUserResp.json();
        if (!ghUserResp.ok) {
            const url = buildFrontendCallbackUrl({ error: encodeURIComponent("Failed to fetch GitHub user") });
            return res.redirect(url);
        }
        // Fetch emails to get primary verified email
        let email = "";
        try {
            const ghEmailResp = await fetch("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${tokenJson.access_token}`, "User-Agent": "DevSwap.live" },
            });
            const emails = await ghEmailResp.json();
            const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
            email = primary?.email || emails?.[0]?.email || "";
        }
        catch { }
        const user = await findOrCreateUserFromOAuth({
            email,
            name: ghUser.name || ghUser.login,
            avatar: ghUser.avatar_url,
        }, { name: "github", id: String(ghUser.id || "") });
        const token = signJwtForUser(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.clearCookie('oauth_state_github');
        const url = buildFrontendCallbackUrl({});
        return res.redirect(url);
    }
    catch (e) {
        const url = buildFrontendCallbackUrl({ error: encodeURIComponent("GitHub auth failed") });
        return res.redirect(url);
    }
}
async function register(req, res) {
    try {
        const { name, email, password, teachSkills, learnSkills, bio } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        const trimmedName = (name || '').trim();
        // Check if user already exists
        const existingUser = await user_model_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        // Create new user
        const user = new user_model_1.default({
            name: trimmedName,
            email: normalizedEmail,
            password, // Will be hashed by pre-save hook
            teachSkills: teachSkills || [],
            learnSkills: learnSkills || [],
            bio,
            isOnline: true,
            lastSeen: new Date(),
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Set HTTP-only cookie for session
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: user.safeProfile(),
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        // Find user with password field
        const user = await user_model_1.default.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        // Update online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Set HTTP-only cookie for session
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        });
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: user.safeProfile(),
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
}
async function logout(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        // Update user offline status
        await user_model_1.default.findByIdAndUpdate(req.user.id, {
            isOnline: false,
            lastSeen: new Date(),
        });
        return res.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
}
async function refreshToken(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const user = await user_model_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            token,
            user: user.safeProfile(),
        });
    }
    catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({ message: "Token refresh failed" });
    }
}
async function getProfile(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const user = await user_model_1.default.findById(req.user.id).populate("pastSessions", "userA userB skillFromA skillFromB startedAt endedAt");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user: user.safeProfile() });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Failed to get profile" });
    }
}
