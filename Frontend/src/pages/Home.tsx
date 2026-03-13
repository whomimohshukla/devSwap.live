import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowRight,
	Star,
	Play,
	Shield,
	Brain,
	Code2,
	Zap,
	MessageSquare,
	Network,
	Video,
} from "lucide-react";
import Seo from "../components/common/Seo";

const Home: React.FC = () => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const demoEmbed =
        (import.meta as any).env?.VITE_DEMO_VIDEO_EMBED ||
        "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1";
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
			<Seo
				title="DevSwap.live | Peer-to-Peer Learning for Developers"
				description="Learn faster together on DevSwap. Match with peers, join real-time sessions, follow curated roadmaps, and get AI-assisted lesson plans."
				canonical="/"
			/>
			{/* Hero Section */}
			<section className='relative min-h-[90vh] flex items-center overflow-hidden bg-[#0b0c0d] pt-20'>
				{/* Advanced Background Layering */}
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]' />
				</div>

				<div className='relative w-full px-4 sm:px-6 lg:px-8 py-20'>
					<div className='mx-auto max-w-7xl'>
						<div className='text-center max-w-4xl mx-auto'>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68] text-xs sm:text-sm font-medium mb-8'
							>
								<Zap className='w-4 h-4 fill-current' />
								<span>Pair-program to learn faster—powered by skill swapping</span>
							</motion.div>

							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.1 }}
								className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-8'
							>
								Master any skill.
								<br />
								<span className='text-[#00ef68] relative'>
									Swap your knowledge.
									<svg className="absolute -bottom-2 left-0 w-full h-2 text-[#00ef68]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
										<path d="M0 5 L 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
									</svg>
								</span>
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className='text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12'
							>
								Match with developers who teach what you want to learn and learn what you can teach.
								Run a real-time session with chat, shared code, and optional AI guidance.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className='flex flex-col sm:flex-row items-center justify-center gap-4'
							>
								<Link
									to='/register'
									className='w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00ef68] text-[#0b0c0d] font-bold text-lg hover:shadow-[0_0_30px_rgba(0,239,104,0.4)] transition-all duration-300 transform hover:-translate-y-1'
								>
									Create your developer profile
								</Link>
								<button
									onClick={() => setIsVideoOpen(true)}
									className='w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 group'
								>
									<Play className='w-5 h-5 fill-current group-hover:scale-110 transition-transform' />
									Watch the workflow
								</button>
							</motion.div>
						</div>

						{/* Floating Feature Icons */}
						<div className='mt-24 relative max-w-5xl mx-auto'>
							<motion.div
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 1, delay: 0.4 }}
								className='relative aspect-[16/9] rounded-2xl border border-white/10 bg-[#0f1113] shadow-2xl overflow-hidden group'
							>
								<div className='absolute inset-0 bg-[#00ef68]/5' />
								<div className='absolute inset-0 bg-black/40' />
								
								{/* Mock UI Content */}
								<div className='relative h-full p-8 flex flex-col'>
									<div className='flex items-center justify-between mb-8'>
										<div className='flex items-center gap-3'>
											<div className='w-3 h-3 rounded-full bg-red-500/50' />
											<div className='w-3 h-3 rounded-full bg-yellow-500/50' />
											<div className='w-3 h-3 rounded-full bg-green-500/50' />
										</div>
										<div className='px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs'>
											devswap.live/session/pair-programming
										</div>
									</div>
									
									<div className='flex-1 grid grid-cols-12 gap-6'>
										<div className='col-span-8 rounded-xl bg-black/40 border border-white/5 p-6'>
											<div className='flex items-center gap-4 mb-6'>
												<div className='w-10 h-10 rounded-lg bg-[#00ef68]/20 flex items-center justify-center'>
													<Code2 className='w-6 h-6 text-[#00ef68]' />
												</div>
												<div className='h-4 w-48 bg-white/10 rounded' />
											</div>
											<div className='space-y-4'>
												<div className='h-3 w-full bg-white/5 rounded' />
												<div className='h-3 w-[90%] bg-white/5 rounded' />
												<div className='h-3 w-[95%] bg-white/5 rounded' />
												<div className='h-3 w-[85%] bg-white/5 rounded' />
											</div>
										</div>
										<div className='col-span-4 space-y-4'>
											<div className='h-1/2 rounded-xl bg-black/40 border border-white/5 p-4'>
												<div className='flex items-center gap-3 mb-4'>
													<div className='w-8 h-8 rounded-full bg-[#00ef68]/20' />
													<div className='h-3 w-24 bg-white/10 rounded' />
												</div>
												<div className='space-y-2'>
													<div className='h-2 w-full bg-white/5 rounded' />
													<div className='h-2 w-full bg-white/5 rounded' />
												</div>
											</div>
											<div className='h-1/2 rounded-xl bg-black/40 border border-white/5 p-4'>
												<div className='h-full w-full bg-[#00ef68]/10 rounded-lg flex items-center justify-center'>
													<Video className='w-8 h-8 text-[#00ef68]/50' />
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Animated floating badges */}
								<motion.div
									animate={{ y: [0, -10, 0] }}
									transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
									className='absolute top-20 -left-6 px-4 py-3 rounded-xl bg-[#0b0c0d] border border-white/10 shadow-xl hidden lg:flex items-center gap-3 z-20'
								>
									<div className='w-10 h-10 rounded-full bg-[#00ef68]/20 flex items-center justify-center text-[#00ef68]'>
										<Brain className='w-5 h-5' />
									</div>
									<div>
										<p className='text-xs text-white font-semibold'>AI Lesson Plan</p>
										<p className='text-[10px] text-white/50'>Generated in seconds</p>
									</div>
								</motion.div>

								<motion.div
									animate={{ y: [0, 10, 0] }}
									transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
									className='absolute bottom-20 -right-6 px-4 py-3 rounded-xl bg-[#0b0c0d] border border-white/10 shadow-xl hidden lg:flex items-center gap-3 z-20'
								>
									<div className='w-10 h-10 rounded-full bg-[#00ef68]/20 flex items-center justify-center text-[#00ef68]'>
										<Network className='w-5 h-5' />
									</div>
									<div>
										<p className='text-xs text-white font-semibold'>Live Matching</p>
										<p className='text-[10px] text-white/50'>Find experts now</p>
									</div>
								</motion.div>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			{/* Video Modal */}
			<AnimatePresence>
				{isVideoOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
						onClick={() => setIsVideoOpen(false)}
					>
						<motion.div
							initial={{ scale: 0.96, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.96, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 24 }}
							className='relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-[#25282c] bg-[#0b0c0d]'
							onClick={(e) => e.stopPropagation()}
						>
							<iframe
								className='w-full h-full'
								src={demoEmbed}
								title='DevSwap Demo'
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
								referrerPolicy='strict-origin-when-cross-origin'
								allowFullScreen
							/>
							<button
								className='absolute top-3 right-3 text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/15 border border-white/20 rounded px-2 py-1'
								onClick={() => setIsVideoOpen(false)}
							>
								Close
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Quick Links Section */}
			<section className='bg-[#0b0c0d] py-10 sm:py-14'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-6xl'>
						<div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6'>
							<div>
								<h2 className='text-2xl sm:text-3xl font-bold text-white'>Jump in</h2>
								<p className='mt-1 text-white/60'>Pick a starting point—then iterate.</p>
							</div>
							<p className='text-sm text-white/50'>Roadmaps, matching, sessions, and hands-on practice.</p>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
							{[
								{ to: "/roadmaps", title: "Roadmaps", desc: "Structured paths with resources", icon: Brain },
								{ to: "/matches", title: "Find a match", desc: "Join the queue and get paired", icon: Network },
								{ to: "/sessions", title: "Sessions", desc: "Run and review your swaps", icon: Video },
								{ to: "/learn", title: "Practice", desc: "Hands-on topics and exercises", icon: Code2 },
							].map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className='group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)]'
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<div className='h-10 w-10 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center'>
												<item.icon className='w-5 h-5 text-[#00ef68]' />
											</div>
											<h3 className='mt-4 text-white font-semibold'>{item.title}</h3>
											<p className='mt-1 text-sm text-white/60'>{item.desc}</p>
										</div>
										<ArrowRight className='w-4 h-4 text-white/30 group-hover:text-[#00ef68] transition-colors' />
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='bg-[#0b0c0d] py-16 sm:py-20'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-6xl'>
						<div className='max-w-2xl'>
							<h2 className='text-3xl sm:text-4xl font-bold text-white'>Designed for real sessions</h2>
							<p className='mt-3 text-white/60'>Everything you need to learn, teach, and stay consistent.</p>
						</div>
						<div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{features.map((feature, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.06 }}
									viewport={{ once: true }}
									className='group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)]'
								>
									<div className='flex items-center justify-between'>
										<div className='h-11 w-11 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center'>
											<feature.icon className='w-5 h-5 text-[#00ef68]' />
										</div>
										<div className='h-2 w-20 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors' />
									</div>
									<h3 className='mt-5 text-lg font-semibold text-white'>{feature.title}</h3>
									<p className='mt-2 text-sm text-white/60 leading-relaxed'>{feature.description}</p>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='bg-[#0b0c0d] py-16 sm:py-20'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-6xl'>
						<div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
							<div className='lg:col-span-5'>
								<h2 className='text-3xl sm:text-4xl font-bold text-white'>How it works</h2>
								<p className='mt-3 text-white/60'>A tight loop: queue → match → request → session.</p>
							</div>
							<div className='lg:col-span-7 space-y-4'>
								{[
									{ n: "01", title: "Define teach/learn skills", desc: "Add skills and levels to your profile so matching stays accurate." },
									{ n: "02", title: "Join the matching queue", desc: "We pair you with a complementary developer based on both directions of the swap." },
									{ n: "03", title: "Confirm and start a session", desc: "Send or accept a request, then join a live room with chat and shared code." },
									{ n: "04", title: "Track progress", desc: "Use roadmaps and session history to keep momentum week over week." },
								].map((s) => (
									<div key={s.n} className='rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)]'>
										<div className='flex items-start gap-4'>
											<div className='h-10 w-10 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center text-[#00ef68] font-bold'>
												{s.n}
											</div>
											<div>
												<p className='text-white font-semibold'>{s.title}</p>
												<p className='mt-1 text-sm text-white/60'>{s.desc}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className='bg-[#0b0c0d] py-16 sm:py-20'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-6xl'>
						<div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
							<div>
								<h2 className='text-3xl sm:text-4xl font-bold text-white'>What developers say</h2>
								<p className='mt-2 text-white/60'>Feedback from engineers using DevSwap in real sessions.</p>
							</div>
							<div className='hidden sm:flex items-center gap-1 text-[#00ef68]'>
								{[...Array(5)].map((_, i) => (
									<Star key={i} className='w-4 h-4 fill-current' />
								))}
							</div>
						</div>

						<div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-4'>
							{testimonials.map((testimonial, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.06 }}
									viewport={{ once: true }}
									className='rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.15)]'
								>
									<div className='flex items-center gap-3'>
										<div className='h-11 w-11 rounded-full bg-[#00ef68] text-[#0b0c0d] font-bold flex items-center justify-center'>
											{testimonial.avatar}
										</div>
										<div>
											<p className='text-white font-semibold leading-none'>{testimonial.name}</p>
											<p className='mt-1 text-xs text-white/60'>{testimonial.role} • {testimonial.company}</p>
										</div>
									</div>
									<p className='mt-4 text-sm text-white/70 leading-relaxed'>"{testimonial.content}"</p>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='bg-[#0b0c0d] py-16 sm:py-20'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#0f1113] p-7 sm:p-10 overflow-hidden relative'>
						<div className='absolute -top-24 -right-24 w-72 h-72 bg-[#00ef68]/10 rounded-full blur-3xl' />
						<div className='absolute -bottom-24 -left-24 w-72 h-72 bg-[#00ef68]/10 rounded-full blur-3xl' />
						<div className='relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
							<div className='lg:col-span-7'>
								<h2 className='text-3xl sm:text-4xl font-bold text-white'>Ready to run your first swap?</h2>
								<p className='mt-3 text-white/60'>Create a profile, add teach/learn skills, then join the matching queue.</p>
							</div>
							<div className='lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch'>
								<Link
									to='/register'
									className='inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:shadow-2xl hover:shadow-[#00ef68]/20 transition'
								>
									Create profile
									<ArrowRight className='ml-2 w-4 h-4' />
								</Link>
								<Link
									to='/roadmaps'
									className='inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition'
								>
									Browse roadmaps
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
