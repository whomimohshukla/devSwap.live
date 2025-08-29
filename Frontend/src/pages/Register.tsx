import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Code2,
	ArrowRight,
	AlertCircle,
	X,
} from "lucide-react";
import { Github } from "lucide-react";
import { useAuthStore, SKILLS } from "../lib/auth";
import { startOAuth } from "../lib/api";

interface RegisterForm {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	bio: string;
	teachSkills: string[];
	learnSkills: string[];
}

const Register: React.FC = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [selectedTeachSkills, setSelectedTeachSkills] = useState<string[]>([]);
	const [selectedLearnSkills, setSelectedLearnSkills] = useState<string[]>([]);
	const [skillSearchTerm, setSkillSearchTerm] = useState("");
	const [activeSkillType, setActiveSkillType] = useState<
		"teach" | "learn" | null
	>(null);

	const navigate = useNavigate();
	const { register: registerUser } = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterForm>();

	const password = watch("password");
	const nameVal = watch("name");
	const emailVal = watch("email");
	const confirmVal = watch("confirmPassword");
	const passwordsMatch = confirmVal === password && !!confirmVal;
	const canSubmit =
		!!nameVal &&
		!!emailVal &&
		!!password &&
		passwordsMatch &&
		selectedTeachSkills.length > 0 &&
		selectedLearnSkills.length > 0;

	const filteredSkills = SKILLS.filter((skill) =>
		skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
	);

	const addSkill = (skill: string, type: "teach" | "learn") => {
		if (type === "teach" && !selectedTeachSkills.includes(skill)) {
			setSelectedTeachSkills([...selectedTeachSkills, skill]);
		} else if (type === "learn" && !selectedLearnSkills.includes(skill)) {
			setSelectedLearnSkills([...selectedLearnSkills, skill]);
		}
		setSkillSearchTerm("");
		setActiveSkillType(null);
	};

	const removeSkill = (skill: string, type: "teach" | "learn") => {
		if (type === "teach") {
			setSelectedTeachSkills(selectedTeachSkills.filter((s) => s !== skill));
		} else {
			setSelectedLearnSkills(selectedLearnSkills.filter((s) => s !== skill));
		}
	};

	const onSubmit = async (data: RegisterForm) => {
		if (selectedTeachSkills.length === 0) {
			setError("Please select at least one skill you can teach");
			return;
		}
		if (selectedLearnSkills.length === 0) {
			setError("Please select at least one skill you want to learn");
			return;
		}

		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			// Sanitize inputs
			const name = (data.name || "").trim();
			const email = (data.email || "").trim();
			const bio = (data.bio || "").trim();

			// De-duplicate and prevent overlap between teach and learn
			const teachSet = new Set<string>(
				selectedTeachSkills.map((s) => s.trim()).filter(Boolean)
			);
			const learnSet = new Set<string>(
				selectedLearnSkills.map((s) => s.trim()).filter(Boolean)
			);
			// Remove overlaps from learn if present in teach
			for (const s of teachSet) {
				if (learnSet.has(s)) learnSet.delete(s);
			}

			const teachSkills = Array.from(teachSet);
			const learnSkills = Array.from(learnSet);

			await registerUser({
				name,
				email,
				password: data.password,
				teachSkills,
				learnSkills,
				bio,
			});
			setSuccess("Account created! Signing you in...");
			// Small delay to let the user see success feedback
			setTimeout(() => navigate("/dashboard"), 700);
		} catch (err: any) {
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Registration failed. Please try again.";
			// If it's an Axios network error (no response), show a more helpful message
			if (
				!err?.response &&
				typeof msg === "string" &&
				msg.toLowerCase().includes("network")
			) {
				setError(
					"Network error: Cannot reach API. Ensure the server is running, VITE_API_URL points to it, and CORS allows your frontend origin."
				);
			} else {
				setError(msg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-[var(--color-ink)]'>
			<div className='px-6 sm:px-8 lg:px-12 py-16'>
				<div className='max-w-4xl mx-auto'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center mb-8'
					>
						{/* Logo */}
						<Link
							to='/'
							className='inline-flex items-center space-x-2 group mb-8'
						>
							<div className='relative'>
								<Code2 className='h-10 w-10 text-[var(--color-brand)] transition-colors' />
								<div
									className='absolute -inset-1 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity'
									style={{ backgroundColor: "rgba(0,239,104,0.2)" }}
								/>
							</div>
							<span className='text-2xl font-bold text-white'>
								DevSwap
							</span>
						</Link>

						<h2 className='text-3xl font-bold text-white'>
							Create your account
						</h2>
						<p className='mt-2 text-muted'>
							Join thousands of developers learning and teaching together
						</p>
					</motion.div>

					{/* Social Auth */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.05 }}
						className='mt-6 mb-4 space-y-3'
					>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
							<button
								type='button'
								aria-label='Sign up with Google'
								onClick={() => startOAuth("google")}
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-[var(--color-surface)] bg-[var(--color-ink)] text-white hover:bg-white/10 transition-colors'
							>
								<span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0b0c0d] text-xs font-bold'>
									G
								</span>
								<span>Sign up with Google</span>
							</button>
							<button
								type='button'
								aria-label='Sign up with GitHub'
								onClick={() => startOAuth("github")}
								className='w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-[var(--color-surface)] bg-[var(--color-ink)] text-white hover:bg-white/10 transition-colors'
							>
								<Github className='w-5 h-5' />
								<span>Sign up with GitHub</span>
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

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='card rounded-2xl p-6 md:p-8 border border-[var(--color-surface)] hover:shadow-lg transition-shadow'
					>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							{error && (
								<div className='flex items-center space-x-2 p-4 card text-white/90'>
									<AlertCircle className='w-5 h-5 flex-shrink-0 text-white/80' />
									<span className='text-sm'>{error}</span>
								</div>
							)}
							{success && (
								<div className='flex items-center space-x-2 p-4 card text-emerald-400/90'>
									<span className='text-sm'>{success}</span>
								</div>
							)}

							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{/* Name Field */}
								<div>
									<label
										htmlFor='name'
										className='block text-sm font-medium label mb-2'
									>
										Full Name
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
											<User className='h-5 w-5 text-white/60' />
										</div>
										<input
											{...register("name", {
												required: "Name is required",
												minLength: {
													value: 2,
													message:
														"Name must be at least 2 characters",
												},
											})}
											type='text'
											className='block w-full pl-10 pr-3 py-3 input'
											placeholder='Enter your full name'
										/>
									</div>
									{errors.name && (
										<p className='mt-1 text-sm text-white/80'>
											{errors.name.message}
										</p>
									)}
								</div>

								{/* Email Field */}
								<div>
									<label
										htmlFor='email'
										className='block text-sm font-medium label mb-2'
									>
										Email Address
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
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
													value: 8,
													message:
														"Password must be at least 8 characters",
												},
												pattern: {
													value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
													message:
														"Password must contain uppercase, lowercase, and number",
												},
											})}
											type={showPassword ? "text" : "password"}
											className='block w-full pl-10 pr-12 py-3 input'
											placeholder='Create a password'
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

								{/* Confirm Password Field */}
								<div>
									<label
										htmlFor='confirmPassword'
										className='block text-sm font-medium label mb-2'
									>
										Confirm Password
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
											<Lock className='h-5 w-5 text-white/60' />
										</div>
										<input
											{...register("confirmPassword", {
												required: "Please confirm your password",
												validate: (value) =>
													value === password ||
													"Passwords do not match",
											})}
											type={
												showConfirmPassword ? "text" : "password"
											}
											className='block w-full pl-10 pr-12 py-3 input'
											placeholder='Confirm your password'
										/>
										<button
											type='button'
											className='absolute inset-y-0 right-0 pr-3 flex items-center'
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										>
											{showConfirmPassword ? (
												<EyeOff className='h-5 w-5 text-white/60 hover:text-white/80' />
											) : (
												<Eye className='h-5 w-5 text-white/60 hover:text-white/80' />
											)}
										</button>
									</div>
									{errors.confirmPassword && (
										<p className='mt-1 text-sm text-white/80'>
											{errors.confirmPassword.message}
										</p>
									)}
								</div>
							</div>

							{/* Bio Field */}
							<div>
								<label
									htmlFor='bio'
									className='block text-sm font-medium label mb-2'
								>
									Bio (Optional)
								</label>
								<textarea
									{...register("bio")}
									rows={3}
									className='block w-full px-3 py-3 input resize-none'
									placeholder="Tell us about yourself, your experience, and what you're passionate about..."
								/>
							</div>

							{/* Skills Section */}
							<div className='space-y-6'>
								{/* Skills I Can Teach */}
								<div>
									<label className='block text-sm font-medium label mb-3'>
										Skills I Can Teach{" "}
										<span className='text-red-400'>*</span>
									</label>
									<div className='relative'>
										<input
											type='text'
											value={skillSearchTerm}
											onChange={(e) =>
												setSkillSearchTerm(e.target.value)
											}
											onFocus={() => setActiveSkillType("teach")}
											className='block w-full px-3 py-3 input'
											placeholder='Search and select skills you can teach...'
										/>

										{activeSkillType === "teach" &&
											skillSearchTerm && (
												<div className='absolute z-10 mt-1 w-full card rounded-lg shadow-lg max-h-48 overflow-y-auto'>
													{filteredSkills.map((skill) => (
														<button
															key={skill}
															type='button'
															onClick={() =>
																addSkill(skill, "teach")
															}
															className='w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors'
														>
															{skill}
														</button>
													))}
												</div>
											)}
									</div>

									<div className='flex flex-wrap gap-2 mt-3'>
										{selectedTeachSkills.map((skill) => (
											<span
												key={skill}
												className='inline-flex items-center px-3 py-1 chip-brand text-sm'
											>
												{skill}
												<button
													type='button'
													onClick={() =>
														removeSkill(skill, "teach")
													}
													className='ml-2 hover:text-white'
												>
													<X className='w-3 h-3' />
												</button>
											</span>
										))}
									</div>
								</div>

								{/* Skills I Want to Learn */}
								<div>
									<label className='block text-sm font-medium label mb-3'>
										Skills I Want to Learn{" "}
										<span className='text-red-400'>*</span>
									</label>
									<div className='relative'>
										<input
											type='text'
											value={skillSearchTerm}
											onChange={(e) =>
												setSkillSearchTerm(e.target.value)
											}
											onFocus={() => setActiveSkillType("learn")}
											className='block w-full px-3 py-3 input'
											placeholder='Search and select skills you want to learn...'
										/>

										{activeSkillType === "learn" &&
											skillSearchTerm && (
												<div className='absolute z-10 mt-1 w-full card rounded-lg shadow-lg max-h-48 overflow-y-auto'>
													{filteredSkills.map((skill) => (
														<button
															key={skill}
															type='button'
															onClick={() =>
																addSkill(skill, "learn")
															}
															className='w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors'
														>
															{skill}
														</button>
													))}
												</div>
											)}
									</div>

									<div className='flex flex-wrap gap-2 mt-3'>
										{selectedLearnSkills.map((skill) => (
											<span
												key={skill}
												className='inline-flex items-center px-3 py-1 chip-brand text-sm'
											>
												{skill}
												<button
													type='button'
													onClick={() =>
														removeSkill(skill, "learn")
													}
													className='ml-2 hover:text-white'
												>
													<X className='w-3 h-3' />
												</button>
											</span>
										))}
									</div>
								</div>
							</div>

							{/* Terms and Conditions */}
							<div className='flex items-start space-x-3'>
								<input
									id='terms'
									name='terms'
									type='checkbox'
									required
									className='h-4 w-4 rounded accent-[var(--color-brand)] border-[var(--color-surface)] bg-[var(--color-surface)] mt-1'
								/>
								<label
									htmlFor='terms'
									className='text-sm label leading-relaxed'
								>
									I agree to the{" "}
									<Link
										to='/terms'
										className='text-[var(--color-brand)] hover:text-white'
									>
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link
										to='/privacy'
										className='text-[var(--color-brand)] hover:text-white'
									>
										Privacy Policy
									</Link>
								</label>
							</div>

							{/* Submit Button */}
							<button
								type='submit'
								disabled={isLoading || !canSubmit}
								className='group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{isLoading ? (
									<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
								) : (
									<span className='flex items-center'>
										Create Account
										<ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
									</span>
								)}
							</button>

							{/* Sign in link */}
							<div className='text-center'>
								<p className='text-muted'>
									Already have an account?{" "}
									<Link
										to='/login'
										className='font-medium text-[var(--color-brand)] hover:text-white transition-colors'
									>
										Sign in
									</Link>
								</p>
							</div>
						</form>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Register;
