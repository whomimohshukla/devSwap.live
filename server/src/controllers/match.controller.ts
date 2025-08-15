// src/controllers/matchController.ts
import { Request, Response } from "express";
import {
	addUserToPool,
	matchAndCreateSession,
	removeUserFromPool,
} from "../services/matchingService";
import User from "../models/user.model";

export async function joinMatching(req: Request, res: Response) {
	const userId = req.user.id;
	const user = await User.findById(userId);
	if (!user) return res.status(404).json({ message: "User not found" });

	// Add to pool
	await addUserToPool(userId, user.teachSkills || [], user.learnSkills || []);

	// Attempt to find match and create session
	const result = await matchAndCreateSession(userId);
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

export async function leaveMatching(req: Request, res: Response) {
	const userId = req.user.id;
	const user = await User.findById(userId);
	if (!user) return res.json({ message: "already removed" });

	await removeUserFromPool(
		userId,
		user.teachSkills || [],
		user.learnSkills || []
	);
	return res.json({ message: "removed from pool" });
}
