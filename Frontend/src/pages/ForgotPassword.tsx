import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Mail,
	Lock,
	Terminal,
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
							Account Recovery
						</h2>
						<p className="mt-2 text-white/60">
							Dispatch a credential reset link to your primary email.
						</p>
					</div>
				</motion.div>

				{!success ? (
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
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-white/80 mb-2"
								>
									Identification Email
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
										className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-3 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all"
										placeholder="Enter registered email"
									/>
								</div>
								{errors.email && (
									<p className="mt-1 text-sm text-red-400">
										{errors.email.message}
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
									Initialize Recovery Flow
									<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
								</span>
							)}
						</button>

						<div className="text-center">
							<p className="text-white/60">
								Remembered your credentials?{" "}
								<Link
									to="/login"
									className="font-medium text-[#00ef68] hover:text-white transition-colors"
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
						<div className="p-8 rounded-3xl border border-white/10 bg-white/[0.04]">
							<CheckCircle className="w-16 h-16 text-[#00ef68] mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2 tracking-tight">
								Verification Sent
							</h3>
							<p className="text-white/60 mb-6">
								Credential reset instructions have been dispatched to your primary email address.
							</p>
							<div className="space-y-3">
								<button
									onClick={() => setSuccess(false)}
									className="w-full py-3 px-4 text-sm rounded-2xl border border-white/10 bg-white/5 text-white/80 font-semibold hover:border-[#00ef68]/30 transition-all"
								>
									Retry Dispatch
								</button>
								<Link
									to="/login"
									className="block w-full py-2 px-4 text-sm text-center text-[#00ef68] hover:text-white transition-colors font-semibold"
								>
									Return to sign in
								</Link>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default ForgotPassword;
