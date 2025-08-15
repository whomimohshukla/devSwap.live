// src/controllers/userController.ts
import { Request, Response } from "express";
import { User, IUser, IUserDocument } from "../models/user.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SkillName } from "../models/skill.data";

// Extend Request interface to include user (for authenticated routes)
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
	};
}

// ======================= AUTHENTICATION CONTROLLERS =======================

export async function register(req: Request, res: Response) {
	try {
		const {
			name,
			email,
			password,
			bio,
			teachSkills,
			learnSkills,
			location,
			skillLevels,
		} = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
		}

		const normalizedEmail = email.trim().toLowerCase();

		// Check if user already exists
		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: "Email already in use",
			});
		}

		// Create new user
		const userData: Partial<IUser> = {
			name: name.trim(),
			email: normalizedEmail,
			password,
			bio,
			teachSkills,
			learnSkills,
			location,
			skillLevels,
			isOnline: true,
			lastSeen: new Date(),
		};

		const user = new User(userData);
		await user.save();

		res.status(201).json({
			success: true,
			message: "User created successfully",
			data: user.safeProfile(),
		});
	} catch (error: any) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: "Error creating user",
			error: error.message,
		});
	}
}

export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
		}

		const normalizedEmail = email.trim().toLowerCase();

		// Need password in query, so use .select("+password")
		const user = await User.findOne({ email: normalizedEmail }).select(
			"+password"
		);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Incorrect password",
			});
		}

		// Update user online status and last seen
		await User.findByIdAndUpdate(user._id, {
			isOnline: true,
			lastSeen: new Date(),
		});

		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET as string,
			{ expiresIn: "7d" }
		);

		// Set HTTP-only cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
			sameSite: "lax",
		});

		res.status(200).json({
			success: true,
			message: "User logged in successfully",
			data: user.safeProfile(),
			token, // optionally send token in body too
		});
	} catch (error: any) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Error logging in",
			error: error.message,
		});
	}
}

export async function logout(req: AuthenticatedRequest, res: Response) {
	try {
		if (req.user?.id) {
			// Update user offline status
			await User.findByIdAndUpdate(req.user.id, {
				isOnline: false,
				lastSeen: new Date(),
			});
		}

		// Clear the cookie
		res.clearCookie("token");

		res.status(200).json({
			success: true,
			message: "User logged out successfully",
		});
	} catch (error: any) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Error logging out",
			error: error.message,
		});
	}
}

// ======================= USER PROFILE CONTROLLERS =======================

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const user = await User.findById(req.user.id)
			.populate("pastSessions")
			.select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error: any) {
		console.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching current user",
			error: error.message,
		});
	}
}

export async function getUserById(req: Request, res: Response) {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID",
			});
		}

		const user = await User.findById(id)
			.populate("pastSessions")
			.select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error: any) {
		console.error("Get user by ID error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching user",
			error: error.message,
		});
	}
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
	try {
		const updates = req.body;

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		// Remove fields that shouldn't be updated directly
		delete updates.password;
		delete updates._id;
		delete updates.createdAt;
		delete updates.updatedAt;
		delete updates.email; // Email changes might need verification

		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ ...updates, lastSeen: new Date() },
			{ new: true, runValidators: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: user,
		});
	} catch (error: any) {
		console.error("Update profile error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating profile",
			error: error.message,
		});
	}
}

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Current password and new password are required",
			});
		}

		const user = await User.findById(req.user.id).select("+password");
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Verify current password
		const isValidPassword = await user.comparePassword(currentPassword);
		if (!isValidPassword) {
			return res.status(400).json({
				success: false,
				message: "Current password is incorrect",
			});
		}

		// Update password (will be hashed by pre-save hook)
		user.password = newPassword;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password updated successfully",
		});
	} catch (error: any) {
		console.error("Update password error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating password",
			error: error.message,
		});
	}
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const user = await User.findByIdAndDelete(req.user.id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Clear the cookie
		res.clearCookie("token");

		res.status(200).json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error: any) {
		console.error("Delete account error:", error);
		res.status(500).json({
			success: false,
			message: "Error deleting account",
			error: error.message,
		});
	}
}

// ======================= USER SEARCH & DISCOVERY CONTROLLERS =======================

export async function searchUsers(req: Request, res: Response) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const search = req.query.search as string;
		const teachSkill = req.query.teachSkill as SkillName;
		const learnSkill = req.query.learnSkill as SkillName;
		const isOnline = req.query.isOnline === "true";
		const location = req.query.location as string;

		// Build query
		const query: any = {};

		if (search) {
			query.$text = { $search: search };
		}

		if (teachSkill) {
			query.teachSkills = { $in: [teachSkill] };
		}

		if (learnSkill) {
			query.learnSkills = { $in: [learnSkill] };
		}

		if (req.query.isOnline !== undefined) {
			query.isOnline = isOnline;
		}

		if (location) {
			query.location = { $regex: location, $options: "i" };
		}

		const options = {
			page,
			limit,
			select: "-password",
			sort: { lastSeen: -1 },
		};

		const result = await User.paginate(query, options);

		res.status(200).json({
			success: true,
			data: result.docs,
			pagination: {
				currentPage: result.page,
				totalPages: result.totalPages,
				totalDocs: result.totalDocs,
				hasNextPage: result.hasNextPage,
				hasPrevPage: result.hasPrevPage,
				nextPage: result.nextPage,
				prevPage: result.prevPage,
			},
		});
	} catch (error: any) {
		console.error("Search users error:", error);
		res.status(500).json({
			success: false,
			message: "Error searching users",
			error: error.message,
		});
	}
}

export async function findMatches(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const matches = await User.findMatchFor(req.user.id);

		res.status(200).json({
			success: true,
			data: matches,
		});
	} catch (error: any) {
		console.error("Find matches error:", error);
		res.status(500).json({
			success: false,
			message: "Error finding matches",
			error: error.message,
		});
	}
}

export async function getOnlineUsers(req: Request, res: Response) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;

		const options = {
			page,
			limit,
			select: "-password",
			sort: { lastSeen: -1 },
		};

		const result = await User.paginate({ isOnline: true }, options);

		res.status(200).json({
			success: true,
			data: result.docs,
			pagination: {
				currentPage: result.page,
				totalPages: result.totalPages,
				totalDocs: result.totalDocs,
				hasNextPage: result.hasNextPage,
				hasPrevPage: result.hasPrevPage,
			},
		});
	} catch (error: any) {
		console.error("Get online users error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching online users",
			error: error.message,
		});
	}
}

// ======================= SKILL MANAGEMENT CONTROLLERS =======================

export async function addSkill(req: AuthenticatedRequest, res: Response) {
	try {
		const { skillName, skillType, level } = req.body; // skillType: 'teach' | 'learn'

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!skillName || !skillType) {
			return res.status(400).json({
				success: false,
				message: "Skill name and type are required",
			});
		}

		const updateQuery: any = {};

		if (skillType === "teach") {
			updateQuery.$addToSet = { teachSkills: skillName };
		} else if (skillType === "learn") {
			updateQuery.$addToSet = { learnSkills: skillName };
		} else {
			return res.status(400).json({
				success: false,
				message: "Invalid skill type. Must be 'teach' or 'learn'",
			});
		}

		const user = await User.findByIdAndUpdate(req.user.id, updateQuery, {
			new: true,
		}).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Also add to skillLevels if level is provided
		if (level) {
			const existingSkillIndex = user.skillLevels?.findIndex(
				(skill) => skill.skillName === skillName
			);

			if (existingSkillIndex === -1 || existingSkillIndex === undefined) {
				user.skillLevels?.push({ skillName, level });
				await user.save();
			}
		}

		res.status(200).json({
			success: true,
			message: "Skill added successfully",
			data: user,
		});
	} catch (error: any) {
		console.error("Add skill error:", error);
		res.status(500).json({
			success: false,
			message: "Error adding skill",
			error: error.message,
		});
	}
}

export async function removeSkill(req: AuthenticatedRequest, res: Response) {
	try {
		const { skillName, skillType } = req.body;

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!skillName || !skillType) {
			return res.status(400).json({
				success: false,
				message: "Skill name and type are required",
			});
		}

		const updateQuery: any = {};

		if (skillType === "teach") {
			updateQuery.$pull = { teachSkills: skillName };
		} else if (skillType === "learn") {
			updateQuery.$pull = { learnSkills: skillName };
		} else {
			return res.status(400).json({
				success: false,
				message: "Invalid skill type. Must be 'teach' or 'learn'",
			});
		}

		const user = await User.findByIdAndUpdate(req.user.id, updateQuery, {
			new: true,
		}).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Also remove from skillLevels
		if (user.skillLevels) {
			user.skillLevels = user.skillLevels.filter(
				(skill) => skill.skillName !== skillName
			);
			await user.save();
		}

		res.status(200).json({
			success: true,
			message: "Skill removed successfully",
			data: user,
		});
	} catch (error: any) {
		console.error("Remove skill error:", error);
		res.status(500).json({
			success: false,
			message: "Error removing skill",
			error: error.message,
		});
	}
}

export async function updateSkillLevel(
	req: AuthenticatedRequest,
	res: Response
) {
	try {
		const { skillName, level } = req.body;

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!skillName || !level) {
			return res.status(400).json({
				success: false,
				message: "Skill name and level are required",
			});
		}

		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Find and update existing skill level or add new one
		const existingSkillIndex = user.skillLevels?.findIndex(
			(skill) => skill.skillName === skillName
		);

		if (
			existingSkillIndex !== undefined &&
			existingSkillIndex !== -1 &&
			user.skillLevels
		) {
			user.skillLevels[existingSkillIndex].level = level;
		} else {
			user.skillLevels?.push({ skillName, level });
		}

		await user.save();

		res.status(200).json({
			success: true,
			message: "Skill level updated successfully",
			data: user,
		});
	} catch (error: any) {
		console.error("Update skill level error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating skill level",
			error: error.message,
		});
	}
}

// ======================= STATUS & ACTIVITY CONTROLLERS =======================

export async function updateOnlineStatus(
	req: AuthenticatedRequest,
	res: Response
) {
	try {
		const { isOnline } = req.body;

		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const user = await User.findByIdAndUpdate(
			req.user.id,
			{
				isOnline: isOnline,
				lastSeen: new Date(),
			},
			{ new: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Online status updated successfully",
			data: user,
		});
	} catch (error: any) {
		console.error("Update online status error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating online status",
			error: error.message,
		});
	}
}

export async function updateLastSeen(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		await User.findByIdAndUpdate(req.user.id, {
			lastSeen: new Date(),
		});

		res.status(200).json({
			success: true,
			message: "Last seen updated successfully",
		});
	} catch (error: any) {
		console.error("Update last seen error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating last seen",
			error: error.message,
		});
	}
}

// ======================= STATISTICS & ANALYTICS CONTROLLERS =======================

export async function getUserStats(req: Request, res: Response) {
	try {
		const stats = await User.aggregate([
			{
				$group: {
					_id: null,
					totalUsers: { $sum: 1 },
					onlineUsers: {
						$sum: { $cond: [{ $eq: ["$isOnline", true] }, 1, 0] },
					},
					avgTeachSkills: { $avg: { $size: "$teachSkills" } },
					avgLearnSkills: { $avg: { $size: "$learnSkills" } },
				},
			},
		]);

		const topTeachSkills = await User.aggregate([
			{ $unwind: "$teachSkills" },
			{ $group: { _id: "$teachSkills", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);

		const topLearnSkills = await User.aggregate([
			{ $unwind: "$learnSkills" },
			{ $group: { _id: "$learnSkills", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);

		const recentUsers = await User.find()
			.select("-password")
			.sort({ createdAt: -1 })
			.limit(5);

		res.status(200).json({
			success: true,
			data: {
				overview: stats[0] || {
					totalUsers: 0,
					onlineUsers: 0,
					avgTeachSkills: 0,
					avgLearnSkills: 0,
				},
				topTeachSkills,
				topLearnSkills,
				recentUsers,
			},
		});
	} catch (error: any) {
		console.error("Get user stats error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching user statistics",
			error: error.message,
		});
	}
}

export async function getUserActivity(
	req: AuthenticatedRequest,
	res: Response
) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const user = await User.findById(req.user.id)
			.populate({
				path: "pastSessions",
				options: {
					sort: { createdAt: -1 },
					limit: 10,
				},
			})
			.select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const activityData = {
			user: user.safeProfile(),
			recentSessions: user.pastSessions,
			totalSkills:
				(user.teachSkills?.length || 0) + (user.learnSkills?.length || 0),
			joinedDate: user.createdAt,
			lastActive: user.lastSeen,
		};

		res.status(200).json({
			success: true,
			data: activityData,
		});
	} catch (error: any) {
		console.error("Get user activity error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching user activity",
			error: error.message,
		});
	}
}
