"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.refreshToken = refreshToken;
exports.getProfile = getProfile;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
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
