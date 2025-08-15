"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Profile & account
router.get("/me", auth_1.requireAuth, user_controller_1.getCurrentUser);
router.get("/:id", auth_1.requireAuth, user_controller_1.getUserById);
router.put("/me", auth_1.requireAuth, user_controller_1.updateProfile);
router.put("/me/password", auth_1.requireAuth, user_controller_1.updatePassword);
router.delete("/me", auth_1.requireAuth, user_controller_1.deleteAccount);
// Discovery
router.get("/search", rateLimiter_1.strictLimiter, user_controller_1.searchUsers);
router.get("/matches", auth_1.requireAuth, user_controller_1.findMatches);
router.get("/online", rateLimiter_1.strictLimiter, user_controller_1.getOnlineUsers);
// Skills
router.post("/skills", auth_1.requireAuth, user_controller_1.addSkill);
router.delete("/skills", auth_1.requireAuth, user_controller_1.removeSkill);
router.put("/skills/level", auth_1.requireAuth, user_controller_1.updateSkillLevel);
// Status & activity
router.put("/status/online", auth_1.requireAuth, user_controller_1.updateOnlineStatus);
router.put("/status/last-seen", auth_1.requireAuth, user_controller_1.updateLastSeen);
router.get("/stats/overview", rateLimiter_1.strictLimiter, user_controller_1.getUserStats);
router.get("/activity", auth_1.requireAuth, user_controller_1.getUserActivity);
exports.default = router;
