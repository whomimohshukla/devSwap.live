// src/controllers/session.controller.ts
import { Request, Response } from "express";
import Session from "../models/session.model";
import User from "../models/user.model";
import LessonPlan from "../models/lessonPlan.model";

export async function getSession(req: Request, res: Response) {
	try {
		const { sessionId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const session = await Session.findById(sessionId).populate(
			"userA userB",
			"name avatar teachSkills learnSkills isOnline"
		);

		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		// Check if user is part of this session
		const isParticipant =
			session.userA._id.toString() === userId ||
			session.userB._id.toString() === userId;

		if (!isParticipant) {
			return res.status(403).json({ message: "Access denied" });
		}

		// Get lesson plan if exists
		const lessonPlan = await LessonPlan.findOne({ sessionId: session._id });

		res.json({
			session,
			lessonPlan,
			isActive: session.isActive,
		});
	} catch (error) {
		console.error("Get session error:", error);
		res.status(500).json({ message: "Failed to get session" });
	}
}

export async function endSession(req: Request, res: Response) {
	try {
		const { sessionId } = req.params;
		const userId = req.user?.id;
		const { feedback, rating } = req.body;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const session = await Session.findById(sessionId);
		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		// Check if user is part of this session
		const isParticipant =
			session.userA.toString() === userId ||
			session.userB.toString() === userId;

		if (!isParticipant) {
			return res.status(403).json({ message: "Access denied" });
		}

		// End the session
		session.isActive = false;
		session.endedAt = new Date();
		await session.save();

		// Add session to users' past sessions
		await User.findByIdAndUpdate(session.userA, {
			$addToSet: { pastSessions: session._id },
		});
		await User.findByIdAndUpdate(session.userB, {
			$addToSet: { pastSessions: session._id },
		});

		res.json({
			message: "Session ended successfully",
			session,
		});
	} catch (error) {
		console.error("End session error:", error);
		res.status(500).json({ message: "Failed to end session" });
	}
}

export async function getUserSessions(req: Request, res: Response) {
	try {
		const userId = req.user?.id;
		const { status = "all", page = 1, limit = 10 } = req.query;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		let query: any = {
			$or: [{ userA: userId }, { userB: userId }],
		};

		if (status === "active") {
			query.isActive = true;
		} else if (status === "ended") {
			query.isActive = false;
		}

		const sessions = await Session.find(query)
			.populate("userA userB", "name avatar")
			.sort({ startedAt: -1 })
			.limit(Number(limit))
			.skip((Number(page) - 1) * Number(limit));

		const total = await Session.countDocuments(query);

		res.json({
			sessions,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		console.error("Get user sessions error:", error);
		res.status(500).json({ message: "Failed to get sessions" });
	}
}

export async function joinSession(req: Request, res: Response) {
	try {
		const { sessionId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const session = await Session.findById(sessionId).populate(
			"userA userB",
			"name avatar isOnline"
		);

		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		// Check if user is part of this session
		const isParticipant =
			session.userA._id.toString() === userId ||
			session.userB._id.toString() === userId;

		if (!isParticipant) {
			return res.status(403).json({ message: "Access denied" });
		}

		if (!session.isActive) {
			return res.status(400).json({ message: "Session is not active" });
		}

		// Update user online status
		await User.findByIdAndUpdate(userId, {
			isOnline: true,
			lastSeen: new Date(),
		});

		res.json({
			message: "Joined session successfully",
			session,
		});
	} catch (error) {
		console.error("Join session error:", error);
		res.status(500).json({ message: "Failed to join session" });
	}
}
