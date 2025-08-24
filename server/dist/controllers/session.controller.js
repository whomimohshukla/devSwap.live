"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.endSession = endSession;
exports.getUserSessions = getUserSessions;
exports.joinSession = joinSession;
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const lessonPlan_model_1 = __importDefault(require("../models/lessonPlan.model"));
async function getSession(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const session = await session_model_1.default.findById(sessionId)
            .populate('userA userB', 'name avatar teachSkills learnSkills isOnline');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Check if user is part of this session
        const isParticipant = session.userA._id.toString() === userId ||
            session.userB._id.toString() === userId;
        if (!isParticipant) {
            return res.status(403).json({ message: "Access denied" });
        }
        // Get lesson plan if exists
        const lessonPlan = await lessonPlan_model_1.default.findOne({ sessionId: session._id });
        res.json({
            session,
            lessonPlan,
            isActive: session.isActive
        });
    }
    catch (error) {
        console.error("Get session error:", error);
        res.status(500).json({ message: "Failed to get session" });
    }
}
async function endSession(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;
        const { feedback, rating } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const session = await session_model_1.default.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Check if user is part of this session
        const isParticipant = session.userA.toString() === userId ||
            session.userB.toString() === userId;
        if (!isParticipant) {
            return res.status(403).json({ message: "Access denied" });
        }
        // End the session
        session.isActive = false;
        session.endedAt = new Date();
        await session.save();
        // Add session to users' past sessions
        await user_model_1.default.findByIdAndUpdate(session.userA, {
            $addToSet: { pastSessions: session._id }
        });
        await user_model_1.default.findByIdAndUpdate(session.userB, {
            $addToSet: { pastSessions: session._id }
        });
        res.json({
            message: "Session ended successfully",
            session
        });
    }
    catch (error) {
        console.error("End session error:", error);
        res.status(500).json({ message: "Failed to end session" });
    }
}
async function getUserSessions(req, res) {
    try {
        const userId = req.user?.id;
        const { status = 'all', page = 1, limit = 10 } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        let query = {
            $or: [
                { userA: userId },
                { userB: userId }
            ]
        };
        if (status === 'active') {
            query.isActive = true;
        }
        else if (status === 'ended') {
            query.isActive = false;
        }
        const sessions = await session_model_1.default.find(query)
            .populate('userA userB', 'name avatar')
            .sort({ startedAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await session_model_1.default.countDocuments(query);
        res.json({
            sessions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Get user sessions error:", error);
        res.status(500).json({ message: "Failed to get sessions" });
    }
}
async function joinSession(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const session = await session_model_1.default.findById(sessionId)
            .populate('userA userB', 'name avatar isOnline');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Check if user is part of this session
        const isParticipant = session.userA._id.toString() === userId ||
            session.userB._id.toString() === userId;
        if (!isParticipant) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (!session.isActive) {
            return res.status(400).json({ message: "Session is not active" });
        }
        // Update user online status
        await user_model_1.default.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
        });
        res.json({
            message: "Joined session successfully",
            session
        });
    }
    catch (error) {
        console.error("Join session error:", error);
        res.status(500).json({ message: "Failed to join session" });
    }
}
