"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requests_controller_1 = require("../controllers/requests.controller");
const router = (0, express_1.Router)();
// Authenticated routes for handling user requests
router.get("/incoming", auth_1.requireAuth, requests_controller_1.RequestsController.getIncoming);
router.get("/sent", auth_1.requireAuth, requests_controller_1.RequestsController.getSent);
router.post("/", auth_1.requireAuth, requests_controller_1.RequestsController.create);
router.post("/:id/accept", auth_1.requireAuth, requests_controller_1.RequestsController.accept);
router.post("/:id/decline", auth_1.requireAuth, requests_controller_1.RequestsController.decline);
exports.default = router;
