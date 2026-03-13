// src/controllers/passwordReset.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import { emailService } from "../services/emailService";

// Request password reset
export async function requestPasswordReset(req: Request, res: Response) {
	try {
		const { email } = req.body;
		const normalizedEmail = (email || "").trim().toLowerCase();

		// Find user by email
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			// Don't reveal if email exists or not for security
			return res.json({
				success: true,
				message: "If an account with that email exists, a password reset link has been sent.",
			});
		}

		// Check if user has password (OAuth users can't reset password)
		if (!user.password) {
			return res.status(400).json({
				success: false,
				message: "This account uses OAuth authentication. Please sign in with your OAuth provider.",
			});
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
		
		// Set token and expiration (15 minutes)
		user.passwordResetToken = resetTokenHash;
		user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
		await user.save();

		// Create reset URL
		const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${normalizedEmail}`;

		// Send reset email (non-blocking)
		setImmediate(async () => {
			try {
				await emailService.sendPasswordResetEmail({
					name: user.name,
					email: user.email,
					resetUrl,
					_id: user._id?.toString() || '',
				});
				console.log(`Password reset email sent to ${user.email}`);
			} catch (error) {
				console.error(`Failed to send password reset email to ${user.email}:`, error);
			}
		});

		res.json({
			success: true,
			message: "If an account with that email exists, a password reset link has been sent.",
		});
	} catch (error) {
		console.error("Password reset request error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to process password reset request",
		});
	}
}

// Verify reset token
export async function verifyResetToken(req: Request, res: Response) {
	try {
		const { token, email } = req.query;
		
		if (!token || !email) {
			return res.status(400).json({
				success: false,
				message: "Reset token and email are required",
			});
		}

		const normalizedEmail = (email as string).trim().toLowerCase();
		const resetTokenHash = crypto.createHash("sha256").update(token as string).digest("hex");

		// Find user with valid reset token
		const user = await User.findOne({
			email: normalizedEmail,
			passwordResetToken: resetTokenHash,
			passwordResetExpires: { $gt: new Date() },
		}).select("+passwordResetToken +passwordResetExpires");

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired reset token",
			});
		}

		res.json({
			success: true,
			message: "Reset token is valid",
		});
	} catch (error) {
		console.error("Token verification error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to verify reset token",
		});
	}
}

// Reset password
export async function resetPassword(req: Request, res: Response) {
	try {
		const { token, email, newPassword } = req.body;
		
		if (!token || !email || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Reset token, email, and new password are required",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters long",
			});
		}

		const normalizedEmail = email.trim().toLowerCase();
		const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

		// Find user with valid reset token
		const user = await User.findOne({
			email: normalizedEmail,
			passwordResetToken: resetTokenHash,
			passwordResetExpires: { $gt: new Date() },
		}).select("+passwordResetToken +passwordResetExpires +password");

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired reset token",
			});
		}

		// Update password and clear reset fields
		user.password = newPassword;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// Send confirmation email (non-blocking)
		setImmediate(async () => {
			try {
				await emailService.sendPasswordResetConfirmationEmail({
					name: user.name,
					email: user.email,
					_id: user._id?.toString() || '',
				});
				console.log(`Password reset confirmation email sent to ${user.email}`);
			} catch (error) {
				console.error(`Failed to send password reset confirmation email to ${user.email}:`, error);
			}
		});

		res.json({
			success: true,
			message: "Password has been reset successfully",
		});
	} catch (error) {
		console.error("Password reset error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to reset password",
		});
	}
}
