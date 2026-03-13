import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	Terminal,
	ArrowRight,
	AlertCircle,
	Github,
} from "lucide-react";
import { useAuthStore } from "../lib/auth";
import { startOAuth } from "../lib/api";

interface LoginForm {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();
	const { login } = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>();

	const onSubmit = async (data: LoginForm) => {
		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			await login(data.email, data.password);
			setSuccess("Logged in successfully! Redirecting...");
			setTimeout(() => navigate("/dashboard"), 600);
		} catch (err: any) {
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Login failed. Please try again.";
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex min-h-screen bg-[#0b0c0d]'>
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
			</div>
			{/* Left Side - Form */}
			<div className='relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16'>
				<div className='w-full max-w-md'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						{/* Logo */}
						<div className='text-center'>
							<Link
								to='/'
								className='inline-flex items-center space-x-2 group focus:outline-none focus-visible:outline-none'
							>
								<div className='relative'>
									<Terminal className='h-8 w-8 text-[#00ef68] transition-transform duration-300 group-hover:scale-110' />
								</div>
								<span className='text-2xl font-bold text-white tracking-tight'>
									DevSwap<span className='text-[#00ef68]'>.</span>live
								</span>
							</Link>
						</div>

						{/* Header */}
						<div className='text-center mt-8'>
							<h2 className='text-3xl font-bold text-white tracking-tight'>
								Welcome back
							</h2>
							<p className='mt-2 text-white/60'>
								Sign in to continue matching and running sessions.
							</p>
						</div>
					</motion.div>

					{/* Social Auth */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.05 }}
						className='mt-10 space-y-3'
					>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
							<button
								type='button'
								aria-label='Continue with Google'
								onClick={() => startOAuth("google")}
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)] transition-all duration-300'
							>
								<span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0b0c0d] text-xs font-bold'>
									G
								</span>
								<span>Continue with Google</span>
							</button>
							<button
								type='button'
								aria-label='Continue with GitHub'
								onClick={() => startOAuth("github")}
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)] transition-all duration-300'
							>
								<Github className='w-5 h-5' />
								<span>Authenticate with GitHub</span>
							</button>
						</div>
						<div className='flex items-center gap-3'>
							<div className='h-px flex-1 bg-white/10' />
							<span className='text-xs text-white/50'>
								or sign in with email
							</span>
							<div className='h-px flex-1 bg-white/10' />
						</div>
					</motion.div>

					{/* Form */}
					<motion.form
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className='mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8'
						onSubmit={handleSubmit(onSubmit)}
					>
						{error && (
							<div className='flex items-center space-x-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/90'>
								<AlertCircle className='w-5 h-5 flex-shrink-0 text-white/80' />
								<span className='text-sm'>{error}</span>
							</div>
						)}
						{success && (
							<div className='rounded-2xl border border-[#00ef68]/20 bg-[#00ef68]/10 p-4 text-[#00ef68]'>
								<span className='text-sm'>{success}</span>
							</div>
						)}

						<div className='space-y-4'>
							{/* Email Field */}
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-white/80 mb-2'
								>
									Email address
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Mail className='h-5 w-5 text-white/60' />
									</div>
									<input
										{...register("email", {
											required: "Email is required",
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: "Invalid email address",
											},
										})}
										type='email'
										autoComplete='email'
										className='block w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-3 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30'
										placeholder='Enter your email'
									/>
								</div>
								{errors.email && (
									<p className='mt-1 text-sm text-white/80'>
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Password Field */}
							<div>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-white/80 mb-2'
								>
									Password
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Lock className='h-5 w-5 text-white/60' />
									</div>
									<input
										{...register("password", {
											required: "Password is required",
											minLength: {
												value: 6,
												message:
													"Password must be at least 6 characters",
											},
										})}
										type={showPassword ? "text" : "password"}
										autoComplete='current-password'
										className='block w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30'
										placeholder='Enter your password'
									/>
									<button
										type='button'
										className='absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80'
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
								{errors.password && (
									<p className='mt-1 text-sm text-white/80'>
										{errors.password.message}
									</p>
								)}
							</div>
						</div>

						{/* Remember me and Forgot password */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<input
									id='remember-me'
									name='remember-me'
									type='checkbox'
									className='h-4 w-4 rounded accent-[#00ef68] border-white/10 bg-white/10'
								/>
								<label
									htmlFor='remember-me'
									className='ml-2 block text-sm text-white/70'
								>
									Remember me
								</label>
							</div>

							<div className='text-sm'>
								<Link
									to='/forgot-password'
									className='font-medium text-[#00ef68] hover:text-white transition-colors'
								>
									Forgot your password?
								</Link>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isLoading}
							className='group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00ef68] px-4 py-3 text-sm font-semibold text-[#0b0c0d] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] focus:outline-none focus:ring-2 focus:ring-[#00ef68]/40 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? (
								<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
							) : (
								<span className='flex items-center'>
									Sign in
									<ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
								</span>
							)}
						</button>

						{/* Sign up link */}
						<div className='text-center'>
							<p className='text-white/60'>
								Don't have an account?{" "}
								<Link
									to='/register'
									className='font-medium text-[#00ef68] hover:text-white transition-colors'
								>
									Create a profile
								</Link>
							</p>
						</div>
					</motion.form>
				</div>
			</div>

			{/* Right side removed for simplified, focused login form */}
		</div>
	);
};

export default Login;
