import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Mail,
	ArrowLeft,
	ArrowRight,
	AlertCircle,
	CheckCircle,
	Loader2,
} from "lucide-react";

interface ForgotPasswordForm {
	email: string;
}

const ForgotPassword: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordForm>();

	const onSubmit = async (data: ForgotPasswordForm) => {
		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.success) {
				setSuccess(true);
			} else {
				setError(result.message || "Failed to send reset email");
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

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
									<Mail className="h-10 w-10 text-[var(--color-brand)] transition-colors" />
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
								Forgot your password?
							</h2>
							<p className="mt-2 text-muted">
								No worries, we'll send you reset instructions.
							</p>
						</div>
					</motion.div>

					{!success ? (
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
								{/* Email Field */}
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium label mb-2"
									>
										Email address
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Mail className="h-5 w-5 text-white/60" />
										</div>
										<input
											{...register("email", {
												required: "Email is required",
												pattern: {
													value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
													message: "Invalid email address",
												},
											})}
											type="email"
											autoComplete="email"
											className="block w-full pl-10 pr-3 py-3 input"
											placeholder="Enter your email"
										/>
									</div>
									{errors.email && (
										<p className="mt-1 text-sm text-white/80">
											{errors.email.message}
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
										Send reset instructions
										<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</span>
								)}
							</button>

							{/* Sign up link */}
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
					) : (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="mt-8 text-center"
						>
							<div className="p-8 card">
								<CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white mb-2">
									Check your email
								</h3>
								<p className="text-muted mb-6">
									We've sent password reset instructions to your email address.
								</p>
								<div className="space-y-3">
									<button
										onClick={() => setSuccess(false)}
										className="w-full py-2 px-4 text-sm border border-[var(--color-surface)] rounded-lg text-white hover:bg-white/10 transition-colors"
									>
										Didn't receive? Try again
									</button>
									<Link
										to="/login"
										className="block w-full py-2 px-4 text-sm text-center text-[var(--color-brand)] hover:text-white transition-colors"
									>
										Back to sign in
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
