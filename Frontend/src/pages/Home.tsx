import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Star,
	Play,
	Shield,
	Brain,
	Code2,
	MessageSquare,
	Network,
	Video,
} from "lucide-react";

const Home: React.FC = () => {
	const features = [
		{
			icon: Brain,
			title: "AI Lesson Plans",
			description:
				"Personalized lesson plans powered by OpenAI to accelerate your learning path.",
		},
		{
			icon: Video,
			title: "Real-time Sessions",
			description:
				"WebRTC + Socket.io for low-latency audio/video and live collaboration.",
		},
		{
			icon: Code2,
			title: "Code Sync",
			description:
				"Collaborative code editing and sharing with instant synchronization.",
		},
		{
			icon: Network,
			title: "Smart Matching",
			description:
				"Redis-backed matching pairs you with complementary skills and availability.",
		},
		{
			icon: MessageSquare,
			title: "Chat & Signals",
			description:
				"In-session chat and WebRTC signaling for seamless connection setup.",
		},
		{
			icon: Shield,
			title: "Secure Sessions",
			description:
				"Auth, verified profiles, and session controls for safe learning.",
		},
	];

	const testimonials = [
		{
			name: "Sarah Chen",
			role: "Full Stack Developer",
			company: "Google",
			content:
				"DevSwap helped me learn React Native by teaching Python. The skill exchange model is brilliant!",
			avatar: "SC",
		},
		{
			name: "Marcus Johnson",
			role: "DevOps Engineer",
			company: "Microsoft",
			content:
				"Found amazing mentors and mentees. The real-time collaboration features are top-notch.",
			avatar: "MJ",
		},
		{
			name: "Elena Rodriguez",
			role: "Frontend Developer",
			company: "Spotify",
			content:
				"The AI matching is incredibly accurate. I've learned more in 3 months than in years of solo study.",
			avatar: "ER",
		},
	];

	// Removed vanity stats in favor of feature-driven messaging

	return (
		<div>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-[#0b0c0d]'>
				{/* Background Effects */}
				<div className='absolute inset-0'>
					<div className='absolute top-1/4 left-1/4 w-72 h-72 bg-[#00ef68]/10 rounded-full blur-3xl'></div>
					<div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ef68]/5 rounded-full blur-3xl'></div>
					{/* Animated particles */}
					<motion.div
						className='absolute top-10 left-10 w-2 h-2 rounded-full bg-[#00ef68]/80'
						animate={{ y: [0, -12, 0] }}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className='absolute bottom-12 left-1/3 w-2 h-2 rounded-full bg-[#00ef68]/60'
						animate={{ y: [0, 10, 0] }}
						transition={{
							duration: 2.6,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.3,
						}}
					/>
					<motion.div
						className='absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#00ef68]/60'
						animate={{ y: [0, -8, 0] }}
						transition={{
							duration: 2.2,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.6,
						}}
					/>
				</div>

				<div className='relative w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28'>
					<div className='text-center'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className='mb-8'
						>
							<div className='inline-flex items-center px-4 py-2 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-full text-[#00ef68] text-sm font-medium mb-6'>
								<Brain className='w-4 h-4 mr-2' />
								AI-powered skill exchange for developers
							</div>

							<motion.h1
								initial='hidden'
								animate='visible'
								variants={{
									hidden: { opacity: 0 },
									visible: {
										opacity: 1,
										transition: { staggerChildren: 0.12 },
									},
								}}
								className='text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight'
							>
								<span>Learn by </span>
								<motion.span
									variants={{
										hidden: { opacity: 0, y: 12 },
										visible: { opacity: 1, y: 0 },
									}}
									className='text-transparent bg-clip-text bg-gradient-to-r from-[#00ef68] to-[#00ef68]'
								>
									Teaching
								</motion.span>
								<br />
								<span>Teach by </span>
								<motion.span
									variants={{
										hidden: { opacity: 0, y: 12 },
										visible: { opacity: 1, y: 0 },
									}}
									className='text-transparent bg-clip-text bg-gradient-to-r from-[#00ef68] to-[#00ef68]'
								>
									Learning
								</motion.span>
							</motion.h1>

							<p className='text-xl md:text-2xl text-white/80 mb-8'>
								The revolutionary platform where developers exchange
								skills in real-time. Master new technologies while
								sharing your expertise with others.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'
						>
							<Link
								to='/register'
								className='group relative px-8 py-4 bg-[#00ef68] hover:bg-[#00ef68] text-[#0b0c0d] font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#00ef68]/25'
							>
								<span className='flex items-center'>
									Start Learning Today
									<ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
								</span>
								<div className='absolute inset-0 bg-[#00ef68] rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity -z-10'></div>
							</Link>

							<button className='group flex items-center px-8 py-4 text-white font-semibold border border-[#25282c] hover:bg-[#25282c] rounded-lg transition-all duration-300'>
								<Play className='mr-2 w-5 h-5' />
								Watch Demo
							</button>
						</motion.div>

						{/* No vanity stats — focus on capabilities */}
					</div>
				</div>
			</section>

			{/* Platform Engine (Backend-Driven) */}
			<section className='py-20 bg-[#0b0c0d]'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							The DevSwap Platform Engine
						</h2>
						<p className='text-lg text-white/80'>
							Powered by microservices: Auth, Sessions, AI, Realtime,
							Matching, and Users
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{[
							{
								title: "Authentication",
								desc: "Secure auth, profiles, and session controls.",
								api: "/api/auth/*",
							},
							{
								title: "Sessions",
								desc: "Create, join, and manage skill-swap sessions.",
								api: "/api/sessions/*",
							},
							{
								title: "AI Services",
								desc: "Lesson plans and summaries with caching.",
								api: "/api/ai/*",
							},
							{
								title: "Realtime Signaling",
								desc: "WebRTC signaling, chat, and presence.",
								api: "/api/signaling/*",
							},
							{
								title: "Matching",
								desc: "Redis-based skill matching and availability.",
								api: "/api/match/*",
							},
							{
								title: "Users",
								desc: "User management and skill profiles.",
								api: "/api/users/*",
							},
						].map((item, idx) => (
							<motion.div
								key={idx}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ y: -4 }}
								transition={{ duration: 0.6, delay: idx * 0.06 }}
								viewport={{ once: true }}
								className='p-6 rounded-xl bg-[#25282c] border border-[#25282c] ring-1 ring-transparent hover:ring-[#00ef68]/40 hover:border-[#00ef68]/50'
							>
								<h3 className='text-white font-semibold mb-2'>
									{item.title}
								</h3>
								<p className='text-white/80 text-sm mb-3'>
									{item.desc}
								</p>
								<span className='inline-block text-xs px-2 py-1 rounded bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68]'>
									{item.api}
								</span>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* AI & Realtime Section */}
			<section className='py-20 bg-[#0b0c0d]'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch'>
						{/* Capability Cards */}
						<div className='space-y-6'>
							<motion.div
								whileHover={{ y: -4 }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className='p-6 bg-[#25282c] rounded-xl border border-[#25282c] ring-1 ring-transparent hover:ring-[#00ef68]/40 hover:border-[#00ef68]/50 transition-all'
							>
								<div className='flex items-center mb-3'>
									<Brain className='w-5 h-5 text-[#00ef68] mr-2' />
									<h3 className='text-white font-semibold'>
										AI Lesson Plans
									</h3>
								</div>
								<p className='text-white/80 text-sm leading-relaxed'>
									Generate personalized lesson plans with{" "}
									<span className='text-[#00ef68]'>
										/api/ai/lesson-plan
									</span>
									. Plans are cached for speed and updated as you
									progress.
								</p>
							</motion.div>
							<motion.div
								whileHover={{ y: -4 }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className='p-6 bg-[#25282c] rounded-xl border border-[#25282c] ring-1 ring-transparent hover:ring-[#00ef68]/40 hover:border-[#00ef68]/50 transition-all'
							>
								<div className='flex items-center mb-3'>
									<Video className='w-5 h-5 text-[#00ef68] mr-2' />
									<h3 className='text-white font-semibold'>
										Realtime Sessions
									</h3>
								</div>
								<p className='text-white/80 text-sm leading-relaxed'>
									WebRTC media, Socket.io signaling, and collaborative
									editing — all optimized for low latency.
								</p>
							</motion.div>
							<motion.div
								whileHover={{ y: -4 }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className='p-6 bg-[#25282c] rounded-xl border border-[#25282c] ring-1 ring-transparent hover:ring-[#00ef68]/40 hover:border-[#00ef68]/50 transition-all'
							>
								<div className='flex items-center mb-3'>
									<MessageSquare className='w-5 h-5 text-[#00ef68] mr-2' />
									<h3 className='text-white font-semibold'>
										Auto Session Summaries
									</h3>
								</div>
								<p className='text-white/80 text-sm leading-relaxed'>
									After each session, receive an AI-generated recap via{" "}
									<span className='text-[#00ef68]'>
										/api/ai/summary
									</span>{" "}
									with resources and next steps.
								</p>
							</motion.div>
						</div>

						{/* Sample Learning Summary */}
						<div className='p-6 bg-[#25282c] rounded-xl border border-[#25282c]'>
							<h3 className='text-white font-semibold mb-4'>
								Sample Learning Summary
							</h3>
							<div className='bg-[#0b0c0d] border border-[#25282c] rounded-lg p-4 text-sm'>
								<pre className='whitespace-pre-wrap text-white/80'>
									{`Topic: Intro to WebRTC Data Channels
Session Outcome:
- Implemented a peer connection and data channel
- Exchanged SDP via Socket.io signaling
- Sent/received JSON messages in the editor

What to Practice Next:
1) Add media tracks and screen share
2) Handle reconnection events
3) Persist chat history in your session store

Resources:
- MDN: WebRTC Data Channels
- WebRTC samples on GitHub`}
								</pre>
							</div>
							<div className='mt-4 flex flex-wrap gap-2'>
								<span className='px-2 py-1 text-xs rounded bg-[#00ef68]/10 text-[#00ef68] border border-[#00ef68]/20'>
									/api/ai/summary
								</span>
								<span className='px-2 py-1 text-xs rounded bg-[#00ef68]/10 text-[#00ef68] border border-[#00ef68]/20'>
									WebRTC
								</span>
								<span className='px-2 py-1 text-xs rounded bg-[#00ef68]/10 text-[#00ef68] border border-[#00ef68]/20'>
									Socket.io
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-[#25282c]'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							Built for Real Developer Workflows
						</h2>
						<p className='text-xl text-white/80'>
							From AI lesson plans to real-time sessions — everything you
							need to learn and mentor effectively
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ y: -4 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								className='group p-6 bg-[#25282c] hover:bg-[#25282c] rounded-xl border border-[#25282c] hover:border-[#00ef68]/50 ring-1 ring-transparent hover:ring-[#00ef68]/40 transition-all'
							>
								<div className='w-12 h-12 rounded-lg bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center mb-4'>
									<feature.icon className='w-6 h-6 text-[#00ef68]' />
								</div>
								<h3 className='text-lg font-semibold text-white mb-2'>
									{feature.title}
								</h3>
								<p className='text-white/80'>{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='py-20 bg-[#0b0c0d]'>
				<div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							How DevSwap Works
						</h2>
						<p className='text-xl text-white/80'>
							Get started in minutes and begin your skill exchange
							journey
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{[
							{
								step: "01",
								title: "Create Your Profile",
								description:
									"List the skills you can teach and what you want to learn. Our AI analyzes your expertise level.",
							},
							{
								step: "02",
								title: "Get Matched",
								description:
									"Our smart algorithm finds the perfect learning partners based on complementary skills and schedules.",
							},
							{
								step: "03",
								title: "Start Learning",
								description:
									"Join live sessions with screen sharing, code collaboration, and real-time communication.",
							},
						].map((step, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								viewport={{ once: true }}
								className='relative text-center'
							>
								<div className='w-16 h-16 bg-[#00ef68] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6'>
									{step.step}
								</div>
								<h3 className='text-xl font-semibold text-white mb-4'>
									{step.title}
								</h3>
								<p className='text-white/80 leading-relaxed'>
									{step.description}
								</p>

								{index < 2 && (
									<div className='hidden md:block absolute top-8 left-full w-full'>
										<ArrowRight className='w-6 h-6 text-[#00ef68] mx-auto' />
									</div>
								)}
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className='py-20 bg-[#25282c]'>
				<div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							Loved by Developers Worldwide
						</h2>
						<p className='text-xl text-white/80'>
							See what our community has to say about their DevSwap
							experience
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ y: -4 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								className='p-6 bg-[#0b0c0d] rounded-xl border border-[#25282c]'
							>
								<div className='flex items-center mb-4'>
									<div className='w-12 h-12 bg-[#00ef68] rounded-full flex items-center justify-center text-white font-semibold mr-4'>
										{testimonial.avatar}
									</div>
									<div>
										<h4 className='text-white font-semibold'>
											{testimonial.name}
										</h4>
										<p className='text-white/80 text-sm'>
											{testimonial.role} at {testimonial.company}
										</p>
									</div>
								</div>
								<p className='text-white/80 leading-relaxed'>
									"{testimonial.content}"
								</p>
								<div className='flex mt-4'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className='w-4 h-4 text-[#00ef68] fill-current'
										/>
									))}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 bg-[#0b0c0d]'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className='relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#25282c] bg-[#25282c] p-10 text-center ring-1 ring-transparent hover:ring-[#00ef68]/40 transition-all'
					>
						{/* Subtle green glow */}
						<div className='pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00ef68]/10 blur-3xl' />
						<h2 className='relative text-3xl md:text-4xl font-bold text-white mb-4'>
							Ready to Transform Your Learning?
						</h2>
						<p className='relative text-lg md:text-xl text-white/80 mb-8'>
							Pair up with developers to teach what you know and learn
							what you need through guided sessions.
						</p>
						<div className='relative flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								to='/register'
								className='group inline-flex items-center px-7 py-3 rounded-lg font-semibold bg-[#00ef68] text-[#0b0c0d] hover:bg-[#00ef68] transition-transform duration-200 will-change-transform hover:-translate-y-0.5'
							>
								Get Started
								<ArrowRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
							</Link>
							<Link
								to='/learn-more'
								className='group inline-flex items-center px-7 py-3 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-[#0b0c0d] transition-colors'
							>
								<Play className='mr-2 w-4 h-4' />
								Watch Demo
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default Home;
