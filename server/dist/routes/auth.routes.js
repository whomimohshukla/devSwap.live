"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", rateLimiter_1.strictLimiter, auth_controller_1.register);
router.post("/login", rateLimiter_1.strictLimiter, auth_controller_1.login);
// Protected routes
router.post("/logout", auth_1.requireAuth, auth_controller_1.logout);
router.post("/refresh", auth_1.requireAuth, auth_controller_1.refreshToken);
router.get("/profile", auth_1.requireAuth, auth_controller_1.getProfile);
exports.default = router;
