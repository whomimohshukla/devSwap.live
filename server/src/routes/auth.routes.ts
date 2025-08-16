import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimiter";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", strictLimiter, register);
router.post("/login", strictLimiter, login);

// Protected routes
router.post("/logout", requireAuth, logout);
router.post("/refresh", requireAuth, refreshToken);
router.get("/profile", requireAuth, getProfile);

export default router;
