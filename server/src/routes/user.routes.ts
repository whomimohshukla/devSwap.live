import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";
import {
  getCurrentUser,
  getUserById,
  updateProfile,
  updatePassword,
  deleteAccount,
  searchUsers,
  findMatches,
  getOnlineUsers,
  addSkill,
  removeSkill,
  updateSkillLevel,
  updateOnlineStatus,
  updateLastSeen,
  getUserStats,
  getUserActivity,
} from "../controllers/user.controller";

const router = Router();

// Profile & account
router.get("/me", requireAuth, getCurrentUser);
router.get("/:id", requireAuth, getUserById);
router.put("/me", requireAuth, updateProfile);
router.put("/me/password", requireAuth, updatePassword);
router.delete("/me", requireAuth, deleteAccount);

// Discovery
router.get("/search", strictLimiter, searchUsers);
router.get("/matches", requireAuth, findMatches);
router.get("/online", strictLimiter, getOnlineUsers);

// Skills
router.post("/skills", requireAuth, addSkill);
router.delete("/skills", requireAuth, removeSkill);
router.put("/skills/level", requireAuth, updateSkillLevel);

// Status & activity
router.put("/status/online", requireAuth, updateOnlineStatus);
router.put("/status/last-seen", requireAuth, updateLastSeen);
router.get("/stats/overview", strictLimiter, getUserStats);
router.get("/activity", requireAuth, getUserActivity);

export default router;
