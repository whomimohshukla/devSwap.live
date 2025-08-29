// src/routes/ai.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createLessonPlan,
  generateSummary,
  getCachedPlans,
  assist,
} from "../controllers/ai.controller";

const router = Router();

// All AI routes require authentication
router.use(requireAuth);

// General AI assistant (Q&A / topic outline)
router.post("/assist", assist);

// Lesson plan generation
router.post("/lesson-plan/:sessionId", createLessonPlan);

// Session summary generation
router.post("/summary/:sessionId", generateSummary);

// Cached lesson plans
router.get("/cached-plans", getCachedPlans);

export default router;
