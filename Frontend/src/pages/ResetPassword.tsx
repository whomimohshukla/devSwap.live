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
	Terminal,
	ArrowRight,
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
			<div className="flex min-h-screen bg-[#0b0c0d] items-center justify-center">
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
				</div>
				<Loader2 className="relative w-8 h-8 animate-spin text-[#00ef68]" />
			</div>
		);
	}

	if (isValidToken === false) {
		return (
			<div className="relative flex min-h-screen bg-[#0b0c0d]">
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
				</div>
				<div className="relative flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16">
					<div className="w-full max-w-md">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
								Invalid Reset Token
							</h2>
							<p className="text-white/60 mb-6">{error}</p>
							<div className="space-y-3">
								<Link
									to="/forgot-password"
									className="block w-full py-3 px-4 text-sm font-bold rounded-2xl bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 transition-all"
								>
									Request New Recovery Token
								</Link>
								<Link
									to="/login"
									className="block w-full py-2 px-4 text-sm text-center text-[#00ef68] hover:text-white transition-colors font-semibold"
								>
									Return to Sign In
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
			<div className="relative flex min-h-screen bg-[#0b0c0d]">
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
				</div>
				<div className="relative flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16">
					<div className="w-full max-w-md">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<CheckCircle className="w-16 h-16 text-[#00ef68] mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
								Credentials Synchronized
							</h2>
							<p className="text-white/60 mb-6">
								Your credential rotation is complete. Redirecting to authentication phase...
							</p>
							<Link
								to="/login"
								className="inline-flex items-center py-3 px-6 text-sm font-bold rounded-2xl bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 transition-all"
							>
								Proceed to Sign In
							</Link>
						</motion.div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='relative min-h-screen bg-[#0b0c0d] pt-24 pb-16'>
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
			</div>
			<div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8"
				>
					<Link
						to="/login"
						className="inline-flex items-center text-sm text-white/50 hover:text-white mb-8 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Return to authentication
					</Link>

					{/* Logo */}
					<div className="text-center">
						<Link to="/" className="inline-flex items-center space-x-2 group focus:outline-none">
							<div className="relative">
								<Terminal className="h-8 w-8 text-[#00ef68] transition-transform duration-300 group-hover:scale-110" />
							</div>
							<span className="text-2xl font-bold text-white tracking-tight">
								DevSwap<span className="text-[#00ef68]">.</span>live
							</span>
						</Link>
					</div>

					{/* Header */}
					<div className="text-center mt-8">
						<h2 className="text-3xl font-extrabold text-white tracking-tight">
							Synchronize Credentials
						</h2>
						<p className="mt-2 text-white/60">
							Establish a new high-entropy password for your account.
						</p>
					</div>
				</motion.div>

				<motion.form
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
					onSubmit={handleSubmit(onSubmit)}
				>
					{error && (
						<div className="flex items-center space-x-2 p-4 rounded-2xl border border-white/10 bg-black/30 text-white/90">
							<AlertCircle className="w-5 h-5 flex-shrink-0 text-white/80" />
							<span className="text-sm">{error}</span>
						</div>
					)}

					<div className="space-y-4">
						{/* New Password Field */}
						<div>
							<label
								htmlFor="newPassword"
								className="block text-sm font-medium text-white/80 mb-2"
							>
								Primary Credential
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
									className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm"
									placeholder="Enter new high-entropy password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
							{errors.newPassword && (
								<p className="mt-1 text-sm text-red-400">
									{errors.newPassword.message}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-white/80 mb-2"
							>
								Verify Credential
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-white/60" />
								</div>
								<input
									{...register("confirmPassword", {
										required: "Please confirm your password",
										validate: (value) =>
											value === newPassword ||
											"Passwords do not match",
									})}
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm"
									placeholder="Confirm new credential"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80"
									onClick={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-400">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00ef68] px-4 py-3 text-sm font-bold text-[#0b0c0d] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] focus:outline-none focus:ring-2 focus:ring-[#00ef68]/40 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<span className="flex items-center">
								Commit New Credentials
								<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</span>
						)}
					</button>
				</motion.form>
			</div>
		</div>
	);
};

export default ResetPassword;
