import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { RequestsController } from "../controllers/requests.controller";

const router = Router();

// Authenticated routes for handling user requests
router.get("/incoming", requireAuth, RequestsController.getIncoming);
router.get("/sent", requireAuth, RequestsController.getSent);
router.post("/", requireAuth, RequestsController.create);
router.post("/:id/accept", requireAuth, RequestsController.accept);
router.post("/:id/decline", requireAuth, RequestsController.decline);

export default router;
