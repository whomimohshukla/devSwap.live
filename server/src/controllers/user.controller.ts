import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";
import jwt from "jsonwebtoken"; // lowercase import — correct usage

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
			return res.status(400).json({ message: "Missing required fields" });
		}

		const normalizedEmail = email.trim().toLowerCase();

		const exists = await User.findOne({ email: normalizedEmail });
		if (exists) {
			return res.status(409).json({ message: "Email already in use" });
		}

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
			return res.status(400).json({ message: "Missing required fields" });
		}

		const normalizedEmail = email.trim().toLowerCase();

		// Need password in query, so use .select("+password")
		const user = await User.findOne({ email: normalizedEmail }).select(
			"+password"
		);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Incorrect password" });
		}

		const token = jwt.sign(
			{ id: user._id },
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
