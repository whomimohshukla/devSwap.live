"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/session.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const session_controller_1 = require("../controllers/session.controller");
const router = (0, express_1.Router)();
// All session routes require authentication
router.use(auth_1.requireAuth);
// Session management
router.get("/:sessionId", session_controller_1.getSession);
router.post("/:sessionId/join", session_controller_1.joinSession);
router.post("/:sessionId/end", session_controller_1.endSession);
// User's sessions
router.get("/", session_controller_1.getUserSessions);
exports.default = router;
