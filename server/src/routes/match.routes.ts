import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";
import { joinMatching, leaveMatching } from "../controllers/match.controller";

const router = Router();

router.post("/join", requireAuth, strictLimiter, joinMatching);
router.post("/leave", requireAuth, strictLimiter, leaveMatching);

export default router;
