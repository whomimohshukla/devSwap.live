"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/ai.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
// All AI routes require authentication
router.use(auth_1.requireAuth);
// General AI assistant (Q&A / topic outline)
router.post("/assist", ai_controller_1.assist);
// Lesson plan generation
router.post("/lesson-plan/:sessionId", ai_controller_1.createLessonPlan);
// Session summary generation
router.post("/summary/:sessionId", ai_controller_1.generateSummary);
// Cached lesson plans
router.get("/cached-plans", ai_controller_1.getCachedPlans);
exports.default = router;
