import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimiter";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", strictLimiter, register);
router.post("/login", strictLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
