// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/user.model";
import { envConfig } from "../config/env.config";
import { emailService } from "../services/emailService";

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRES_IN = envConfig.JWT_EXPIRES_IN || "7d";

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
	};
}

function buildFrontendCallbackUrl(query: Record<string, string>) {
	const base = (envConfig.FRONTEND_URL || "http://localhost:3000").replace(
		/\/$/,
		""
	);
	const qs = new URLSearchParams(query).toString();
	return `${base}/auth/callback${qs ? `?${qs}` : ""}`;
}

function signJwtForUser(user: any) {
	return jwt.sign(
		{ id: (user._id as any).toString(), email: user.email },
		JWT_SECRET as string,
		{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
	);
}

async function findOrCreateUserFromOAuth(
	profile: {
		email: string;
		name?: string;
		avatar?: string;
	},
	provider?: { name: "google" | "github"; id?: string }
) {
	const email = (profile.email || "").trim().toLowerCase();
	if (!email) throw new Error("Email not provided by OAuth provider");

	let user = await User.findOne({ email });
	const isNewUser = !user;
	
	if (!user) {
		user = new User({
			name: profile.name || email.split("@")[0],
			email,
			avatar: profile.avatar,
			isOnline: true,
			lastSeen: new Date(),
			oauthProviders:
				provider?.name && provider?.id
					? { [provider.name]: { id: provider.id } }
					: undefined,
		});
		await user.save();
		
		// Send welcome email for new users (non-blocking)
		setImmediate(async () => {
			try {
				if (user) {
					await emailService.sendWelcomeEmail({
						name: user.name,
						email: user.email,
						_id: user._id?.toString(),
					});
					console.log(`Welcome email sent to ${user.email} (OAuth registration)`);
				}
			} catch (error) {
				if (user) {
					console.error(`Failed to send welcome email to ${user.email} (OAuth):`, error);
				}
			}
		});
	} else {
		const updates: any = { isOnline: true, lastSeen: new Date() };
		if (profile.avatar && user.avatar !== profile.avatar)
			updates.avatar = profile.avatar;
		if (provider?.name && provider?.id) {
			updates["oauthProviders." + provider.name + ".id"] = provider.id;
		}
		await User.findByIdAndUpdate(user._id, updates);
	}
	return user;
}

export async function googleAuthStart(req: Request, res: Response) {
	try {
		const clientId = envConfig.GOOGLE_CLIENT_ID;
		const redirectUri = envConfig.GOOGLE_REDIRECT_URI;
		if (!clientId || !redirectUri) {
			return res
				.status(500)
				.json({ success: false, message: "Google OAuth not configured" });
		}
		// CSRF protection: generate state and store in short-lived cookie
		const state = crypto.randomBytes(16).toString("hex");
		res.cookie("oauth_state_google", state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 10, // 10 minutes
		});
		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: "code",
			scope: "openid email profile",
			access_type: "offline",
			include_granted_scopes: "true",
			prompt: "consent",
			state,
		});
		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
		return res.redirect(authUrl);
	} catch (e: any) {
		const url = buildFrontendCallbackUrl({
			error: encodeURIComponent("Google auth init failed"),
		});
		return res.redirect(url);
	}
}

// Google auth callback

export async function googleAuthCallback(req: Request, res: Response) {
	try {
		const code = String(req.query.code || "");
		const state = String(req.query.state || "");
		const clientId = envConfig.GOOGLE_CLIENT_ID;
		const clientSecret = envConfig.GOOGLE_CLIENT_SECRET;
		const redirectUri = envConfig.GOOGLE_REDIRECT_URI;
		if (!code || !clientId || !clientSecret || !redirectUri) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Invalid Google callback"),
			});
			return res.redirect(url);
		}

		// Validate state
		const cookieState = (req as any).cookies?.oauth_state_google;
		if (!state || !cookieState || state !== cookieState) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Invalid state parameter"),
			});
			return res.redirect(url);
		}

		// Exchange code for tokens
		const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: "authorization_code",
			}),
		});
		const tokenJson: any = await tokenResp.json();
		if (!tokenResp.ok) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Google token exchange failed"),
			});
			return res.redirect(url);
		}

		// Fetch userinfo
		const userResp = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: { Authorization: `Bearer ${tokenJson.access_token}` },
			}
		);
		const userInfo: any = await userResp.json();
		if (!userResp.ok) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Failed to fetch Google user info"),
			});
			return res.redirect(url);
		}

		const user = await findOrCreateUserFromOAuth(
			{
				email: userInfo.email,
				name: userInfo.name,
				avatar: userInfo.picture,
			},
			{ name: "google", id: userInfo.sub }
		);
		
		// Send login notification email (non-blocking)
		setImmediate(async () => {
			try {
				const loginInfo = {
					ip: req.ip || req.connection?.remoteAddress || 'Unknown',
					userAgent: req.get('User-Agent') || 'Unknown',
					timestamp: new Date(),
				};
				
				await emailService.sendLoginNotification({
					name: user.name,
					email: user.email,
					_id: user._id?.toString(),
				}, loginInfo);
				console.log(`Login notification email sent to ${user.email} (Google OAuth)`);
			} catch (error) {
				console.error(`Failed to send login notification to ${user.email} (Google OAuth):`, error);
			}
		});
		
		const token = signJwtForUser(user);
		// Optionally set cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		// Clear state cookie and redirect to frontend without leaking token in URL
		res.clearCookie("oauth_state_google");
		const url = buildFrontendCallbackUrl({});
		return res.redirect(url);
	} catch (e: any) {
		const url = buildFrontendCallbackUrl({
			error: encodeURIComponent("Google auth failed"),
		});
		return res.redirect(url);
	}
}

// ---- GitHub OAuth ----
export async function githubAuthStart(req: Request, res: Response) {
	try {
		const clientId = envConfig.GITHUB_CLIENT_ID;
		const redirectUri = envConfig.GITHUB_REDIRECT_URI;
		if (!clientId || !redirectUri) {
			return res
				.status(500)
				.json({ success: false, message: "GitHub OAuth not configured" });
		}
		const state = crypto.randomBytes(16).toString("hex");
		res.cookie("oauth_state_github", state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 10,
		});
		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: "read:user user:email",
			allow_signup: "true",
			state,
		});
		const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
		return res.redirect(authUrl);
	} catch (e: any) {
		const url = buildFrontendCallbackUrl({
			error: encodeURIComponent("GitHub auth init failed"),
		});
		return res.redirect(url);
	}
}
 
// GitHub auth callback
export async function githubAuthCallback(req: Request, res: Response) {
	try {
		const code = String(req.query.code || "");
		const state = String(req.query.state || "");
		const clientId = envConfig.GITHUB_CLIENT_ID;
		const clientSecret = envConfig.GITHUB_CLIENT_SECRET;
		const redirectUri = envConfig.GITHUB_REDIRECT_URI;
		if (!code || !clientId || !clientSecret || !redirectUri) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Invalid GitHub callback"),
			});
			return res.redirect(url);
		}

		const cookieState = (req as any).cookies?.oauth_state_github;
		if (!state || !cookieState || state !== cookieState) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Invalid state parameter"),
			});
			return res.redirect(url);
		}

		// Exchange code for access token
		const tokenResp = await fetch(
			"https://github.com/login/oauth/access_token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					redirect_uri: redirectUri,
				}),
			}
		);
		const tokenJson: any = await tokenResp.json();
		if (!tokenResp.ok || !tokenJson.access_token) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("GitHub token exchange failed"),
			});
			return res.redirect(url);
		}

		// Fetch user info
		const ghUserResp = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokenJson.access_token}`,
				"User-Agent": "DevSwap.live",
			},
		});
		const ghUser: any = await ghUserResp.json();
		if (!ghUserResp.ok) {
			const url = buildFrontendCallbackUrl({
				error: encodeURIComponent("Failed to fetch GitHub user"),
			});
			return res.redirect(url);
		}

		// Fetch emails to get primary verified email
		let email = "";
		try {
			const ghEmailResp = await fetch("https://api.github.com/user/emails", {
				headers: {
					Authorization: `Bearer ${tokenJson.access_token}`,
					"User-Agent": "DevSwap.live",
				},
			});
			const emails: any[] = await ghEmailResp.json();
			const primary = Array.isArray(emails)
				? emails.find((e) => e.primary && e.verified)
				: null;
			email = primary?.email || emails?.[0]?.email || "";
		} catch {}

		const user = await findOrCreateUserFromOAuth(
			{
				email,
				name: ghUser.name || ghUser.login,
				avatar: ghUser.avatar_url,
			},
			{ name: "github", id: String(ghUser.id || "") }
		);
		
		// Send login notification email (non-blocking)
		setImmediate(async () => {
			try {
				const loginInfo = {
					ip: req.ip || req.connection?.remoteAddress || 'Unknown',
					userAgent: req.get('User-Agent') || 'Unknown',
					timestamp: new Date(),
				};
				
				await emailService.sendLoginNotification({
					name: user.name,
					email: user.email,
					_id: user._id?.toString(),
				}, loginInfo);
				console.log(`Login notification email sent to ${user.email} (GitHub OAuth)`);
			} catch (error) {
				console.error(`Failed to send login notification to ${user.email} (GitHub OAuth):`, error);
			}
		});
		
		const token = signJwtForUser(user);
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		res.clearCookie("oauth_state_github");
		const url = buildFrontendCallbackUrl({});
		return res.redirect(url);
	} catch (e: any) {
		const url = buildFrontendCallbackUrl({
			error: encodeURIComponent("GitHub auth failed"),
		});
		return res.redirect(url);
	}
}


// register user
export async function register(req: Request, res: Response) {
	try {
		const { name, email, password, teachSkills, learnSkills, bio } = req.body;

		const normalizedEmail = (email || "").trim().toLowerCase();
		const trimmedName = (name || "").trim();

		// Check if user already exists
		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			return res
				.status(400)
				.json({ success: false, message: "User already exists" });
		}

		// Create new user
		const user = new User({
			name: trimmedName,
			email: normalizedEmail,
			password, // Will be hashed by pre-save hook
			teachSkills: teachSkills || [],
			learnSkills: learnSkills || [],
			bio,
			isOnline: true,
			lastSeen: new Date(),
		});

		await user.save();

		// Send welcome email (non-blocking)
		setImmediate(async () => {
			try {
				await emailService.sendWelcomeEmail({
					name: user.name,
					email: user.email,
					_id: user._id?.toString(),
				});
				console.log(`Welcome email sent to ${user.email}`);
			} catch (error) {
				console.error(`Failed to send welcome email to ${user.email}:`, error);
			}
		});

		const token = jwt.sign(
			{ id: (user._id as any).toString(), email: user.email },
			JWT_SECRET as string,
			{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
		);

		// Set HTTP-only cookie for session
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		});

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			token,
			user: user.safeProfile(),
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ success: false, message: "Registration failed" });
	}
}


// login user
export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		const normalizedEmail = (email || "").trim().toLowerCase();

		// Find user with password field
		const user = await User.findOne({ email: normalizedEmail }).select(
			"+password"
		);
		if (!user) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" });
		}

		// Check password
		const isValidPassword = await user.comparePassword(password);
		if (!isValidPassword) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" });
		}

		// Update online status
		user.isOnline = true;
		user.lastSeen = new Date();
		await user.save();

		// Send login notification email (non-blocking)
		setImmediate(async () => {
			try {
				const loginInfo = {
					ip: req.ip || req.connection?.remoteAddress || 'Unknown',
					userAgent: req.get('User-Agent') || 'Unknown',
					timestamp: new Date(),
				};
				
				await emailService.sendLoginNotification({
					name: user.name,
					email: user.email,
					_id: user._id?.toString(),
				}, loginInfo);
				console.log(`Login notification email sent to ${user.email}`);
			} catch (error) {
				console.error(`Failed to send login notification to ${user.email}:`, error);
			}
		});

		const token = jwt.sign(
			{ id: (user._id as any).toString(), email: user.email },
			JWT_SECRET as string,
			{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
		);

		// Set HTTP-only cookie for session
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		});

		res.json({
			success: true,
			message: "Login successful",
			token,
			user: user.safeProfile(),
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ success: false, message: "Login failed" });
	}
}


// logout user
export async function logout(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res
				.status(401)
				.json({ success: false, message: "Authentication required" });
		}

		// Update user offline status
		await User.findByIdAndUpdate(req.user.id, {
			isOnline: false,
			lastSeen: new Date(),
		});

		return res.json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		return res.status(500).json({ success: false, message: "Logout failed" });
	}
}

// refresh JWT token
export async function refreshToken(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const token = jwt.sign(
			{ id: (user._id as any).toString(), email: user.email },
			JWT_SECRET as string,
			{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
		);

		res.json({
			token,
			user: user.safeProfile(),
		});
	} catch (error) {
		console.error("Token refresh error:", error);
		res.status(500).json({ message: "Token refresh failed" });
	}
}

// get user profile

export async function getProfile(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const user = await User.findById(req.user.id).populate(
			"pastSessions",
			"userA userB skillFromA skillFromB startedAt endedAt"
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: user.safeProfile() });
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ message: "Failed to get profile" });
	}
}
