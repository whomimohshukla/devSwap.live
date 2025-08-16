// src/routes/session.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getSession,
  endSession,
  getUserSessions,
  joinSession
} from "../controllers/session.controller";

const router = Router();

// All session routes require authentication
router.use(requireAuth);

// Session management
router.get("/:sessionId", getSession);
router.post("/:sessionId/join", joinSession);
router.post("/:sessionId/end", endSession);

// User's sessions
router.get("/", getUserSessions);

export default router;
