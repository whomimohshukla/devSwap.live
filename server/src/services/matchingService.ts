// src/services/matchingService.ts
import redis from "../lib/redisClient";
import { User } from "../models/user.model";
import { Session, ISessionDocument } from "../models/session.model";
import { loadClaimScript, CLAIM_PAIR_LUA } from "../lib/redisScripts";

import mongoose from "mongoose";

type Skill = string;

const TEACH_PREFIX = "teach:"; // set of userIds who can teach skill X
const LEARN_PREFIX = "learn:"; // set of userIds who want to learn skill X
const ONLINE_ZSET = "online:score"; // optional sorted set for ranking candidates

// optional scoring helper: higher score => more preferable candidate
export async function setOnlineScore(userId: string, score = 1) {
	await redis.zadd(ONLINE_ZSET, score.toString(), userId);
}

export async function removeOnlineScore(userId: string) {
	await redis.zrem(ONLINE_ZSET, userId);
}

export async function addUserToPool(
	userId: string,
	teach: Skill[],
	learn: Skill[]
) {
	if (!userId) throw new Error("missing userId");
	const pipeline = redis.pipeline();
	teach.forEach((skill) => pipeline.sadd(`${TEACH_PREFIX}${skill}`, userId));
	learn.forEach((skill) => pipeline.sadd(`${LEARN_PREFIX}${skill}`, userId));
	pipeline.exec().catch((err) => console.error("redis add pool err", err));
	// optional: set score
	await setOnlineScore(userId, Date.now() / 1000); // recency score
}

export async function removeUserFromPool(
	userId: string,
	teach: Skill[],
	learn: Skill[]
) {
	const pipeline = redis.pipeline();
	teach.forEach((skill) => pipeline.srem(`${TEACH_PREFIX}${skill}`, userId));
	learn.forEach((skill) => pipeline.srem(`${LEARN_PREFIX}${skill}`, userId));
	pipeline.exec().catch((err) => console.error("redis remove pool err", err));
	await removeOnlineScore(userId);
}

/**
 * findCandidateIds — do set intersections to find matching candidates
 * Strategy: try every pair of (myLearn, myTeach) and SINTER the two sets:
 * SINTER teach:myLearnSkill  learn:myTeachSkill  -> candidates
 */
export async function findCandidateIds(
	myId: string,
	myTeach: Skill[],
	myLearn: Skill[]
) {
	for (const learnSkill of myLearn) {
		for (const teachSkill of myTeach) {
			const teachKey = `${TEACH_PREFIX}${learnSkill}`;
			const learnKey = `${LEARN_PREFIX}${teachSkill}`;
			const candidates: string[] = await redis.sinter(teachKey, learnKey);
			const filtered = candidates.filter((id) => id !== myId);
			if (filtered.length > 0) {
				// optional ranking: return top K sorted by ONLINE_ZSET score
				return {
					candidates: filtered,
					teachKey,
					learnKey,
					matchedPair: { teachSkill, learnSkill },
				};
			}
		}
	}
	return null;
}

/**
 * claimPairAtomically — use Lua script to ensure both users are removed from pool
 * Returns true if claim succeeded.
 */
export async function claimPairAtomically(
	myId: string,
	candidateId: string,
	teachKeyForCandidate: string,
	learnKeyForCandidate: string,
	teachKeyForMe: string,
	learnKeyForMe: string
) {
	const sha = await loadClaimScript();
	try {
		const res = await redis.evalsha(
			sha,
			0,
			myId,
			candidateId,
			teachKeyForCandidate,
			learnKeyForCandidate,
			teachKeyForMe,
			learnKeyForMe
		);
		return Array.isArray(res) && res[0] === "OK";
	} catch (err) {
		// script might not be loaded on some nodes -> fallback to EVAL
		try {
			const res = await redis.eval(
				CLAIM_PAIR_LUA,
				0,
				myId,
				candidateId,
				teachKeyForCandidate,
				learnKeyForCandidate,
				teachKeyForMe,
				learnKeyForMe
			);
			return Array.isArray(res) && res[0] === "OK";
		} catch (e) {
			console.error("claim script error", e);
			return false;
		}
	}
}

/**
 * main match flow:
 * - find candidates with SINTER
 * - try to claim one atomically with Lua script
 * - if claimed, create Session in MongoDB
 */
export async function matchAndCreateSession(myId: string) {
	const me = await User.findById(myId).lean();
	if (!me) throw new Error("User not found");

	const matched = await findCandidateIds(myId, me.teachSkills, me.learnSkills);
	if (!matched) return null;

	const { candidates, teachKey, learnKey, matchedPair } = matched;
	// try candidates one by one
	for (const candidateId of candidates) {
		// attempt atomic claim
		const success = await claimPairAtomically(
			myId,
			candidateId,
			`${TEACH_PREFIX}${matchedPair.teachSkill}`, // candidate must teach myLearn
			`${LEARN_PREFIX}${matchedPair.teachSkill}`, // candidate must learn myTeach (careful ordering)
			`${TEACH_PREFIX}${matchedPair.learnSkill}`,
			`${LEARN_PREFIX}${matchedPair.learnSkill}`
		);
		if (!success) continue; // someone else claimed them, try next

		// load matched user
		const matchedUser = await User.findById(candidateId);
		if (!matchedUser) {
			// create fallback: rollback? but claim removed them from sets; safe to ignore
			continue;
		}

		// ...
		const session: ISessionDocument = await Session.create({
			userA: myId,
			userB: candidateId,
			skillFromA: me.teachSkills[0] || matchedPair.learnSkill,
			skillFromB: matchedUser.teachSkills[0] || matchedPair.teachSkill,
			isActive: true,
			startedAt: new Date(),
		});

		// Remove scores in sorted set
		await removeOnlineScore(myId);
		await removeOnlineScore(candidateId);

		return { sessionId: String((session as any)._id), matchedUser };
	}

	return null;
}
