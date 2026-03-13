import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimiter";
import {
	register,
	login,
	logout,
	refreshToken,
	getProfile,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import {
	googleAuthStart,
	googleAuthCallback,
	githubAuthStart,
	githubAuthCallback,
} from "../controllers/auth.controller";
import {
	requestPasswordReset,
	verifyResetToken,
	resetPassword,
} from "../controllers/passwordReset.controller";

const router = Router();

// Public routes
router.post("/register", strictLimiter, register);
router.post("/login", strictLimiter, login);

// Password reset routes
router.post("/forgot-password", strictLimiter, requestPasswordReset);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", strictLimiter, resetPassword);

// OAuth routes
router.get("/google", strictLimiter, googleAuthStart);
router.get("/google/callback", googleAuthCallback);
router.get("/github", strictLimiter, githubAuthStart);
router.get("/github/callback", githubAuthCallback);

// Protected routes
router.post("/logout", requireAuth, logout);
router.post("/refresh", requireAuth, refreshToken);
router.get("/profile", requireAuth, getProfile);

export default router;
