import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Lock,
	Eye,
	EyeOff,
	AlertCircle,
	CheckCircle,
	Loader2,
	ArrowLeft,
} from "lucide-react";

interface ResetPasswordForm {
	newPassword: string;
	confirmPassword: string;
}

const ResetPassword: React.FC = () => {
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const token = searchParams.get("token");
	const email = searchParams.get("email");

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<ResetPasswordForm>();

	const newPassword = watch("newPassword");

	// Verify token on component mount
	useEffect(() => {
		if (!token || !email) {
			setError("Invalid reset link. Please request a new password reset.");
			setIsValidToken(false);
			return;
		}

		const verifyToken = async () => {
			try {
				const response = await fetch(
					`/api/auth/verify-reset-token?token=${token}&email=${email}`
				);
				const result = await response.json();

				if (result.success) {
					setIsValidToken(true);
				} else {
					setError(result.message || "Invalid or expired reset link");
					setIsValidToken(false);
				}
			} catch (err) {
				setError("Failed to verify reset link");
				setIsValidToken(false);
			}
		};

		verifyToken();
	}, [token, email]);

	const onSubmit = async (data: ResetPasswordForm) => {
		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					email,
					newPassword: data.newPassword,
				}),
			});

			const result = await response.json();

			if (result.success) {
				setSuccess(true);
				setTimeout(() => navigate("/login"), 3000);
			} else {
				setError(result.message || "Failed to reset password");
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isValidToken === null) {
		return (
			<div className="flex min-h-screen bg-[var(--color-ink)] items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand)]" />
			</div>
		);
	}

	if (isValidToken === false) {
		return (
			<div className="flex min-h-screen bg-[var(--color-ink)]">
				<div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16">
					<div className="w-full max-w-md">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-white mb-2">
								Invalid Reset Link
							</h2>
							<p className="text-muted mb-6">{error}</p>
							<div className="space-y-3">
								<Link
									to="/forgot-password"
									className="block w-full py-3 px-4 text-sm font-medium rounded-lg btn-primary"
								>
									Request New Reset Link
								</Link>
								<Link
									to="/login"
									className="block w-full py-2 px-4 text-sm text-center text-[var(--color-brand)] hover:text-white transition-colors"
								>
									Back to Sign In
								</Link>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="flex min-h-screen bg-[var(--color-ink)]">
				<div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16">
					<div className="w-full max-w-md">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-white mb-2">
								Password Reset Successful
							</h2>
							<p className="text-muted mb-6">
								Your password has been successfully reset. You will be redirected to the sign in page.
							</p>
							<Link
								to="/login"
								className="inline-flex items-center py-3 px-4 text-sm font-medium rounded-lg btn-primary"
							>
								Sign In Now
							</Link>
						</motion.div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[var(--color-ink)]">
			<div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16">
				<div className="w-full max-w-md space-y-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						{/* Back button */}
						<Link
							to="/login"
							className="inline-flex items-center text-sm text-muted hover:text-white mb-8 transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to sign in
						</Link>

						{/* Logo */}
						<div className="text-center">
							<Link to="/" className="inline-flex items-center space-x-2 group">
								<div className="relative">
									<Lock className="h-10 w-10 text-[var(--color-brand)] transition-colors" />
									<div
										className="absolute -inset-1 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"
										style={{ backgroundColor: "rgba(0,239,104,0.2)" }}
									/>
								</div>
								<span className="text-2xl font-bold text-white">
									DevSwap.live
								</span>
							</Link>
						</div>

						{/* Header */}
						<div className="text-center mt-8">
							<h2 className="text-3xl font-bold text-white">
								Set New Password
							</h2>
							<p className="mt-2 text-muted">
								Choose a strong password for your account
							</p>
						</div>
					</motion.div>

					<motion.form
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="mt-8 space-y-6"
						onSubmit={handleSubmit(onSubmit)}
					>
						{error && (
							<div className="flex items-center space-x-2 p-4 card text-white/90">
								<AlertCircle className="w-5 h-5 flex-shrink-0 text-white/80" />
								<span className="text-sm">{error}</span>
							</div>
						)}

						<div className="space-y-4">
							{/* New Password Field */}
							<div>
								<label
									htmlFor="newPassword"
									className="block text-sm font-medium label mb-2"
								>
									New Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-white/60" />
									</div>
									<input
										{...register("newPassword", {
											required: "New password is required",
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										className="block w-full pl-10 pr-12 py-3 input"
										placeholder="Enter new password"
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
										) : (
											<Eye className="h-5 w-5 text-white/60 hover:text-white/80" />
										)}
									</button>
								</div>
								{errors.newPassword && (
									<p className="mt-1 text-sm text-white/80">
										{errors.newPassword.message}
									</p>
								)}
							</div>

							{/* Confirm Password Field */}
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium label mb-2"
								>
									Confirm New Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-white/60" />
									</div>
									<input
										{...register("confirmPassword", {
											required: "Please confirm your password",
											validate: (value) =>
												value === newPassword || "Passwords do not match",
										})}
										type={showConfirmPassword ? "text" : "password"}
										autoComplete="new-password"
										className="block w-full pl-10 pr-12 py-3 input"
										placeholder="Confirm new password"
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
										) : (
											<Eye className="h-5 w-5 text-white/60 hover:text-white/80" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="mt-1 text-sm text-white/80">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<span className="flex items-center">
									Reset Password
									<ArrowLeft className="ml-2 w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
								</span>
							)}
						</button>

						{/* Sign in link */}
						<div className="text-center">
							<p className="text-muted">
								Remember your password?{" "}
								<Link
									to="/login"
									className="font-medium text-[var(--color-brand)] hover:text-white transition-colors"
								>
									Sign in
								</Link>
							</p>
						</div>
					</motion.form>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
