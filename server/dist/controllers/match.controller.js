"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinMatching = joinMatching;
exports.leaveMatching = leaveMatching;
const matchingService_1 = require("../services/matchingService");
const user_model_1 = __importDefault(require("../models/user.model"));
const socket_1 = require("../lib/socket");
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
    // Notify this user that they joined the queue (Frontend listens for 'match:queue:joined')
    try {
        (0, socket_1.getIO)().to(userId).emit("match:queue:joined", { userId, timestamp: Date.now() });
    }
    catch (e) {
        console.warn("socket emit match:queue:joined failed", e);
    }
    // Attempt to find match and create session
    const result = await (0, matchingService_1.matchAndCreateSession)(userId);
    if (!result) {
        return res
            .status(202)
            .json({ message: "Added to pool. Waiting for match." });
    }
    // Respond with session info and matched user safe profile
    const matchedUser = result.matchedUser;
    // Emit match:found to both participants using their personal rooms
    try {
        const meSafe = user.safeProfile ? user.safeProfile() : user;
        const youSafe = matchedUser.safeProfile ? matchedUser.safeProfile() : matchedUser;
        (0, socket_1.getIO)().to(userId).emit("match:found", {
            sessionId: result.sessionId,
            partner: youSafe,
            from: matchedUser._id?.toString?.() || undefined,
        });
        (0, socket_1.getIO)().to(matchedUser._id.toString()).emit("match:found", {
            sessionId: result.sessionId,
            partner: meSafe,
            from: userId,
        });
    }
    catch (e) {
        console.warn("socket emit match:found failed", e);
    }
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
    // Notify this user that they left the queue
    try {
        (0, socket_1.getIO)().to(userId).emit("match:queue:left", { userId, timestamp: Date.now() });
    }
    catch (e) {
        console.warn("socket emit match:queue:left failed", e);
    }
    return res.json({ message: "removed from pool" });
}
