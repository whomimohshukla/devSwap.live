import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	Code2,
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
		<div className='flex min-h-screen bg-[var(--color-ink)]'>
			{/* Left Side - Form */}
			<div className='flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16'>
				<div className='w-full max-w-md space-y-8'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						{/* Logo */}
						<div className='text-center'>
							<Link
								to='/'
								className='inline-flex items-center space-x-2 group'
							>
								<div className='relative'>
									<Code2 className='h-10 w-10 text-[var(--color-brand)] transition-colors' />
									<div
										className='absolute -inset-1 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity'
										style={{ backgroundColor: "rgba(0,239,104,0.2)" }}
									/>
								</div>
								<span className='text-2xl font-bold text-white'>
									DevSwap.live
								</span>
							</Link>
						</div>

						{/* Header */}
						<div className='text-center mt-8'>
							<h2 className='text-3xl font-bold text-white'>
								Welcome back
							</h2>
							<p className='mt-2 text-muted'>
								Sign in to continue your learning journey
							</p>
						</div>
					</motion.div>

					{/* Social Auth */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.05 }}
						className='mt-6 space-y-3'
					>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
							<button
								type='button'
								aria-label='Continue with Google'
								onClick={() => startOAuth("google")}
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-[var(--color-surface)] bg-[var(--color-ink)] text-white hover:bg-white/10 transition-colors'
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
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-[var(--color-surface)] bg-[var(--color-ink)] text-white hover:bg-white/10 transition-colors'
							>
								<Github className='w-5 h-5' />
								<span>Continue with GitHub</span>
							</button>
						</div>
						<div className='flex items-center gap-3'>
							<div className='h-px flex-1 bg-[var(--color-surface)]' />
							<span className='text-xs text-muted'>
								or continue with email
							</span>
							<div className='h-px flex-1 bg-[var(--color-surface)]' />
						</div>
					</motion.div>

					{/* Form */}
					<motion.form
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className='mt-8 space-y-6'
						onSubmit={handleSubmit(onSubmit)}
					>
						{error && (
							<div className='flex items-center space-x-2 p-4 card text-white/90'>
								<AlertCircle className='w-5 h-5 flex-shrink-0 text-white/80' />
								<span className='text-sm'>{error}</span>
							</div>
						)}
						{success && (
							<div className='p-4 card text-emerald-400/90'>
								<span className='text-sm'>{success}</span>
							</div>
						)}

						<div className='space-y-4'>
							{/* Email Field */}
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium label mb-2'
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
										className='block w-full pl-10 pr-3 py-3 input'
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
									className='block text-sm font-medium label mb-2'
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
										className='block w-full pl-10 pr-12 py-3 input'
										placeholder='Enter your password'
									/>
									<button
										type='button'
										className='absolute inset-y-0 right-0 pr-3 flex items-center'
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className='h-5 w-5 text-white/60 hover:text-white/80' />
										) : (
											<Eye className='h-5 w-5 text-white/60 hover:text-white/80' />
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
									className='h-4 w-4 rounded accent-[var(--color-brand)] border-[var(--color-surface)] bg-[var(--color-surface)]'
								/>
								<label
									htmlFor='remember-me'
									className='ml-2 block text-sm label'
								>
									Remember me
								</label>
							</div>

							<div className='text-sm'>
								<Link
									to='/forgot-password'
									className='font-medium text-[var(--color-brand)] hover:text-white transition-colors'
								>
									Forgot your password?
								</Link>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isLoading}
							className='group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
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
							<p className='text-muted'>
								Don't have an account?{" "}
								<Link
									to='/register'
									className='font-medium text-[var(--color-brand)] hover:text-white transition-colors'
								>
									Sign up for free
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
