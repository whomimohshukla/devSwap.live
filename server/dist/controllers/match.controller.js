"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinMatching = joinMatching;
exports.leaveMatching = leaveMatching;
const matchingService_1 = require("../services/matchingService");
const user_model_1 = __importDefault(require("../models/user.model"));
async function joinMatching(req, res) {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const user = await user_model_1.default.findById(userId);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    // Add to pool
    await (0, matchingService_1.addUserToPool)(userId, user.teachSkills || [], user.learnSkills || []);
    // Attempt to find match and create session
    const result = await (0, matchingService_1.matchAndCreateSession)(userId);
    if (!result) {
        return res
            .status(202)
            .json({ message: "Added to pool. Waiting for match." });
    }
    // Respond with session info and matched user safe profile
    const matchedUser = result.matchedUser;
    return res.json({
        sessionId: result.sessionId,
        matchedUser: matchedUser.safeProfile
            ? matchedUser.safeProfile()
            : matchedUser,
    });
}
async function leaveMatching(req, res) {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const user = await user_model_1.default.findById(userId);
    if (!user)
        return res.json({ message: "already removed" });
    await (0, matchingService_1.removeUserFromPool)(userId, user.teachSkills || [], user.learnSkills || []);
    return res.json({ message: "removed from pool" });
}
