// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import LessonPlan from "../models/lessonPlan.model";
import Session from "../models/session.model";
import User from "../models/user.model";
import {
  generateLessonPlan,
  generateSessionSummary,
} from "../services/aiService";

//sessions controllers
export async function createLessonPlan(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    // Find session and populate users
    const session = await Session.findById(sessionId).populate(
      "userA userB",
      "name teachSkills learnSkills skillLevels"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if lesson plan already exists
    const existingPlan = await LessonPlan.findOne({ sessionId });
    if (existingPlan) {
      return res.json({ lessonPlan: existingPlan });
    }

    // Check cache for similar lesson plans
    const cachedPlan = await LessonPlan.findOne({
      teacherSkill: session.skillFromA,
      learnerSkill: session.skillFromB,
      cached: true,
    }).sort({ generatedAt: -1 });

    if (cachedPlan) {
      // Create new plan based on cached template
      const newPlan = new LessonPlan({
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
    const userA = session.userA as any;
    const userB = session.userB as any;

    const teacherLevel =
      userA.skillLevels?.find((s: any) => s.skillName === session.skillFromA)
        ?.level || "Intermediate";
    const learnerLevel =
      userB.skillLevels?.find((s: any) => s.skillName === session.skillFromB)
        ?.level || "Beginner";

    const aiContent = await generateLessonPlan({
      teacherSkill: session.skillFromA,
      learnerSkill: session.skillFromB,
      teacherLevel,
      learnerLevel,
      teacherName: userA.name,
      learnerName: userB.name,
    });

    const lessonPlan = new LessonPlan({
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
  } catch (error) {
    console.error("Error creating lesson plan:", error);
    res.status(500).json({ message: "Failed to create lesson plan" });
  }
}

//controller to genrate the summary

export async function generateSummary(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { sessionNotes, duration } = req.body;

    const session = await Session.findById(sessionId).populate(
      "userA userB",
      "name"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const summary = await generateSessionSummary({
      sessionId,
      teacherSkill: session.skillFromA,
      learnerSkill: session.skillFromB,
      sessionNotes,
      duration,
      participants: [(session.userA as any).name, (session.userB as any).name],
    });

    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
}

export async function getCachedPlans(req: Request, res: Response) {
  try {
    const { skill } = req.query;

    const query = skill
      ? {
          $or: [{ teacherSkill: skill }, { learnerSkill: skill }],
          cached: true,
        }
      : { cached: true };

    const plans = await LessonPlan.find(query)
      .sort({ generatedAt: -1 })
      .limit(20);

    res.json({ plans });
  } catch (error) {
    console.error("Error fetching cached plans:", error);
    res.status(500).json({ message: "Failed to fetch cached plans" });
  }
}
