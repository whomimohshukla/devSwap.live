"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLessonPlan = createLessonPlan;
exports.generateSummary = generateSummary;
exports.getCachedPlans = getCachedPlans;
const lessonPlan_model_1 = __importDefault(require("../models/lessonPlan.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const aiService_1 = require("../services/aiService");
//sessions controllers
async function createLessonPlan(req, res) {
    try {
        const { sessionId } = req.params;
        // Find session and populate users
        const session = await session_model_1.default.findById(sessionId).populate("userA userB", "name teachSkills learnSkills skillLevels");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Check if lesson plan already exists
        const existingPlan = await lessonPlan_model_1.default.findOne({ sessionId });
        if (existingPlan) {
            return res.json({ lessonPlan: existingPlan });
        }
        // Check cache for similar lesson plans
        const cachedPlan = await lessonPlan_model_1.default.findOne({
            teacherSkill: session.skillFromA,
            learnerSkill: session.skillFromB,
            cached: true,
        }).sort({ generatedAt: -1 });
        if (cachedPlan) {
            // Create new plan based on cached template
            const newPlan = new lessonPlan_model_1.default({
                ...cachedPlan.toObject(),
                _id: undefined,
                sessionId: session._id,
                generatedAt: new Date(),
                cached: false,
            });
            await newPlan.save();
            return res.json({ lessonPlan: newPlan });
        }
        // Generate new lesson plan using AI
        const userA = session.userA;
        const userB = session.userB;
        const teacherLevel = userA.skillLevels?.find((s) => s.skillName === session.skillFromA)
            ?.level || "Intermediate";
        const learnerLevel = userB.skillLevels?.find((s) => s.skillName === session.skillFromB)
            ?.level || "Beginner";
        const aiContent = await (0, aiService_1.generateLessonPlan)({
            teacherSkill: session.skillFromA,
            learnerSkill: session.skillFromB,
            teacherLevel,
            learnerLevel,
            teacherName: userA.name,
            learnerName: userB.name,
        });
        const lessonPlan = new lessonPlan_model_1.default({
            sessionId: session._id,
            teacherSkill: session.skillFromA,
            learnerSkill: session.skillFromB,
            teacherLevel,
            learnerLevel,
            content: aiContent,
            aiModel: "gpt-4",
            cached: false,
        });
        await lessonPlan.save();
        res.json({ lessonPlan });
    }
    catch (error) {
        console.error("Error creating lesson plan:", error);
        res.status(500).json({ message: "Failed to create lesson plan" });
    }
}
//controller to genrate the summary
async function generateSummary(req, res) {
    try {
        const { sessionId } = req.params;
        const { sessionNotes, duration } = req.body;
        const session = await session_model_1.default.findById(sessionId).populate("userA userB", "name");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        const summary = await (0, aiService_1.generateSessionSummary)({
            sessionId,
            teacherSkill: session.skillFromA,
            learnerSkill: session.skillFromB,
            sessionNotes,
            duration,
            participants: [session.userA.name, session.userB.name],
        });
        res.json({ summary });
    }
    catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ message: "Failed to generate summary" });
    }
}
async function getCachedPlans(req, res) {
    try {
        const { skill } = req.query;
        const query = skill
            ? {
                $or: [{ teacherSkill: skill }, { learnerSkill: skill }],
                cached: true,
            }
            : { cached: true };
        const plans = await lessonPlan_model_1.default.find(query)
            .sort({ generatedAt: -1 })
            .limit(20);
        res.json({ plans });
    }
    catch (error) {
        console.error("Error fetching cached plans:", error);
        res.status(500).json({ message: "Failed to fetch cached plans" });
    }
}
