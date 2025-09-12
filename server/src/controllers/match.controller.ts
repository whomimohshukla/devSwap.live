// src/controllers/matchController.ts
import { Request, Response } from "express";
import {
	addUserToPool,
	matchAndCreateSession,
	removeUserFromPool,
} from "../services/matchingService";
import User from "../models/user.model";
import { getIO } from "../lib/socket";


// Join the queue
export async function joinMatching(req: Request, res: Response) {
	if (!req.user?.id) {
		return res.status(401).json({ message: "Authentication required" });
	}
	const userId = req.user.id;
	const user = await User.findById(userId);
	if (!user) return res.status(404).json({ message: "User not found" });

	// Add to pool
	await addUserToPool(userId, user.teachSkills || [], user.learnSkills || []);

	// Notify this user that they joined the queue (Frontend listens for 'match:queue:joined')
	try {
		getIO()
			.to(userId)
			.emit("match:queue:joined", { userId, timestamp: Date.now() });
	} catch (e) {
		console.warn("socket emit match:queue:joined failed", e);
	}

	// Attempt to find match and create session
	const result = await matchAndCreateSession(userId);
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
		const youSafe = matchedUser.safeProfile
			? matchedUser.safeProfile()
			: matchedUser;
		getIO()
			.to(userId)
			.emit("match:found", {
				sessionId: result.sessionId,
				partner: youSafe,
				from: matchedUser._id?.toString?.() || undefined,
			});
		getIO()
			.to((matchedUser._id as any).toString())
			.emit("match:found", {
				sessionId: result.sessionId,
				partner: meSafe,
				from: userId,
			});
	} catch (e) {
		console.warn("socket emit match:found failed", e);
	}
	return res.json({
		sessionId: result.sessionId,
		matchedUser: matchedUser.safeProfile
			? matchedUser.safeProfile()
			: matchedUser,
	});
}


// Leave the queue
export async function leaveMatching(req: Request, res: Response) {
	if (!req.user?.id) {
		return res.status(401).json({ message: "Authentication required" });
	}
	const userId = req.user.id;
	const user = await User.findById(userId);
	if (!user) return res.json({ message: "already removed" });

	await removeUserFromPool(
		userId,
		user.teachSkills || [],
		user.learnSkills || []
	);

	// Notify this user that they left the queue
	try {
		getIO()
			.to(userId)
			.emit("match:queue:left", { userId, timestamp: Date.now() });
	} catch (e) {
		console.warn("socket emit match:queue:left failed", e);
	}
	return res.json({ message: "removed from pool" });
}
