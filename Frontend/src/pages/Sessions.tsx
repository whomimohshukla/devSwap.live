import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Play, Square, CheckCircle } from "lucide-react";
import { sessionsAPI, usersAPI, aiAPI } from "../lib/api";

type UserRef = { _id?: string; name?: string; avatar?: string };
type SessionItem = {
	_id?: string;
	id?: string;
	userA: UserRef;
	userB: UserRef;
	isActive: boolean;
	startedAt?: string;
	endedAt?: string;
	skillFromA?: string;
	skillFromB?: string;
};

const Sessions: React.FC = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
	const [activeSessions, setActiveSessions] = useState<SessionItem[]>([]);
	const [completedSessions, setCompletedSessions] = useState<SessionItem[]>(
		[]
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		msg: string;
	} | null>(null);
	const [meId, setMeId] = useState<string | null>(null);
	// Expanded details toggles per session
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	// AI summaries per session
	const [summaries, setSummaries] = useState<Record<string, string | null>>(
		{}
	);
	const [summaryLoading, setSummaryLoading] = useState<
		Record<string, boolean>
	>({});
	const [summaryError, setSummaryError] = useState<
		Record<string, string | null>
	>({});
	// Cached lesson plans (fetched once) keyed by sessionId
	const [plansBySession, setPlansBySession] = useState<Record<string, any[]>>(
		{}
	);
	// Personal notes per session (local only)
	const [notes, setNotes] = useState<Record<string, string>>(() => {
		try {
			const raw = localStorage.getItem("sessionNotes");
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	});

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const [meRes, allRes] = await Promise.all([
				usersAPI.getMe(),
				sessionsAPI.getSessions({ status: "all", page: 1, limit: 50 }),
			]);
			const me = meRes.data?.data ?? meRes.data ?? {};
			setMeId(me?._id || me?.id || null);
			const list = (allRes.data?.sessions ??
				allRes.data?.data ??
				allRes.data ??
				[]) as any[];
			const safeList = Array.isArray(list) ? list : [];
			const act = safeList.filter(
				(s) =>
					s?.isActive === true || (!s?.endedAt && s?.isActive !== false)
			);
			const ended = safeList.filter(
				(s) => s?.isActive === false || !!s?.endedAt
			);
			setActiveSessions(act);
			setCompletedSessions(ended);
			// Precompute expanded state as collapsed
			const exp: Record<string, boolean> = {};
			safeList.forEach((s: any) => {
				const id = String(s._id ?? s.id);
				if (id) exp[id] = false;
			});
			setExpanded(exp);
		} catch (e: any) {
			setError(
				e?.response?.data?.message ||
					e?.message ||
					"Failed to load sessions"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	// Load cached lesson plans once and index by sessionId
	useEffect(() => {
		(async () => {
			try {
				const res = await aiAPI.getCachedPlans();
				const list = res.data?.plans ?? res.data?.data ?? res.data ?? [];
				const map: Record<string, any[]> = {};
				(Array.isArray(list) ? list : []).forEach((p: any) => {
					const sid = String(
						p.sessionId ?? p.sessionID ?? p.session_id ?? ""
					);
					if (!sid) return;
					if (!map[sid]) map[sid] = [];
					map[sid].push(p);
				});
				setPlansBySession(map);
			} catch {
				// ignore if unavailable
			}
		})();
	}, []);

	// Persist notes locally
	useEffect(() => {
		try {
			localStorage.setItem("sessionNotes", JSON.stringify(notes));
		} catch {}
	}, [notes]);

	const partnerOf = (s: SessionItem): UserRef | undefined => {
		const my = meId;
		if (!my) return undefined;
		const aId = s.userA?._id || (s as any).userA?.id;
		return String(aId) === String(my) ? s.userB : s.userA;
	};

	const handleJoinSession = async (sessionId: string) => {
		try {
			await sessionsAPI.joinSession(String(sessionId));
			setToast({ type: "success", msg: "Joined session" });
			// Navigate to real-time room
			navigate(`/sessions/${sessionId}/room`);
		} catch (e: any) {
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to join session",
			});
		} finally {
			setTimeout(() => setToast(null), 2000);
		}
	};

	const handleToggleExpand = (sessionId: string) => {
		setExpanded((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
	};

	const handleGenerateSummary = async (sessionId: string) => {
		setSummaryLoading((p) => ({ ...p, [sessionId]: true }));
		setSummaryError((p) => ({ ...p, [sessionId]: null }));
		try {
			// Find session to compute duration
			const s = [...activeSessions, ...completedSessions].find(
				(x) => String(x._id ?? x.id) === String(sessionId)
			);
			const started = s?.startedAt
				? new Date(String(s.startedAt)).getTime()
				: undefined;
			const ended = s?.endedAt
				? new Date(String(s.endedAt)).getTime()
				: Date.now();
			const durationSec = started
				? Math.max(0, Math.round((ended - started) / 1000))
				: undefined;
			const sessionNotes = notes[String(sessionId)] || "";

			const res = await aiAPI.getSessionSummary(String(sessionId), {
				sessionNotes,
				duration: durationSec,
			});
			const text =
				res.data?.summary ?? res.data?.data?.summary ?? res.data ?? "";
			setSummaries((p) => ({
				...p,
				[sessionId]:
					typeof text === "string" ? text : JSON.stringify(text, null, 2),
			}));
			setToast({ type: "success", msg: "AI summary generated" });
		} catch (e: any) {
			const msg =
				e?.response?.data?.message ||
				e?.message ||
				"Failed to generate summary";
			setSummaryError((p) => ({ ...p, [sessionId]: msg }));
			setToast({ type: "error", msg });
		} finally {
			setSummaryLoading((p) => ({ ...p, [sessionId]: false }));
			setTimeout(() => setToast(null), 2000);
		}
	};

	const handleEndSession = async (sessionId: string) => {
		// optimistic: move from active to completed
		const s = activeSessions.find(
			(x) => String(x._id ?? x.id) === String(sessionId)
		);
		setActiveSessions((prev) =>
			prev.filter((x) => String(x._id ?? x.id) !== String(sessionId))
		);
		if (s)
			setCompletedSessions((prev) => [
				{ ...s, isActive: false, endedAt: new Date().toISOString() },
				...prev,
			]);
		try {
			await sessionsAPI.endSession(String(sessionId));
			setToast({ type: "success", msg: "Session ended" });
		} catch (e: any) {
			// revert
			await load();
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to end session",
			});
		} finally {
			setTimeout(() => setToast(null), 2000);
		}
	};

	const counts = useMemo(
		() => ({
			active: activeSessions.length,
			completed: completedSessions.length,
		}),
		[activeSessions.length, completedSessions.length]
	);

	return (
		<div className='relative min-h-screen bg-[#0b0c0d] pt-24 pb-16'>
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
			</div>
			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='mb-10'
				>
					<div>
						<h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2'>
							Session Management
						</h1>
						<p className='text-white/60'>
							Review active connections, historical swaps, and AI-generated insights.
						</p>
					</div>
					{/* Scheduling UI not implemented in backend; hiding for now */}
				</motion.div>

				{/* Tabs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className='mb-8'
				>
					<div className='flex space-x-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 w-fit'>
						{[
							{ key: "active", label: "Active", count: counts.active },
							{
								key: "completed",
								label: "Completed",
								count: counts.completed,
							},
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key as any)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
									activeTab === (tab.key as any)
										? "bg-[#00ef68] text-[#0b0c0d] shadow"
										: "text-white/60 hover:text-white hover:bg-white/[0.06]"
								}`}
							>
								{tab.label}
								<span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.key ? "bg-black/20 text-[#0b0c0d]/70" : "bg-white/10 text-white/70"}`}>
									{tab.count}
								</span>
							</button>
						))}
					</div>
				</motion.div>

				{/* How sessions work & Tips */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='mb-8'
				>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'>
							<h3 className='text-white font-semibold mb-3'>
								Execution Flow
							</h3>
							<ol className='list-decimal list-inside text-sm text-white/70 space-y-2'>
								<li>Establish a connection via the Matching Queue</li>
								<li>Join the real-time room for audio/video sync</li>
								<li>Execute your skill-swap using shared code environments</li>
								<li>Finalize the session to persist historical summaries</li>
							</ol>
						</div>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'>
							<h3 className='text-white font-semibold mb-3'>
								Platform Capabilities
							</h3>
							<ul className='list-disc list-inside text-sm text-white/70 space-y-2'>
								<li>Peer-to-peer WebRTC voice and video streams</li>
								<li>Synchronized screen sharing for pair-programming</li>
								<li>Asynchronous persistent chat within active rooms</li>
								<li>Automated AI recaps based on session artifacts</li>
							</ul>
						</div>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'>
							<h3 className='text-white font-semibold mb-3'>
								Protocol & Compliance
							</h3>
							<p className='text-sm text-white/70 leading-relaxed'>
								Ensure mutual consent before archiving session data. 
								Control your hardware state using low-latency toggles. 
								All session interactions are governed by our technical code of conduct.
							</p>
						</div>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-3'>
							<h3 className='text-white font-semibold mb-4'>
								AI-Assisted Workflow
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
								<div className='bg-black/30 border border-white/10 rounded-2xl p-4'>
									<div className='text-white font-medium mb-2'>
										1. Telemetry Capture
									</div>
									<p className='text-white/60'>
										Document key technical takeaways in the "Notes" buffer. Data is persisted locally to your client.
									</p>
								</div>
								<div className='bg-black/30 border border-white/10 rounded-2xl p-4'>
									<div className='text-white font-medium mb-2'>
										2. Inference Generation
									</div>
									<p className='text-white/60'>
										Dispatch local artifacts to our inference engine to generate a high-fidelity session recap.
									</p>
								</div>
								<div className='bg-black/30 border border-white/10 rounded-2xl p-4'>
									<div className='text-white font-medium mb-2'>
										Protocol Optimizations
									</div>
									<ul className='list-disc list-inside text-white/60 space-y-1'>
										<li>Structure notes with clear objectives</li>
										<li>Verify environment configurations</li>
										<li>Export critical insights post-session</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Content */}
				<div className='space-y-6'>
					{activeTab === "active" && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='grid grid-cols-1 lg:grid-cols-2 gap-6'
						>
							{loading && activeSessions.length === 0 && (
								<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse'>
									<div className='h-4 w-40 bg-gray-800 rounded mb-2' />
									<div className='h-3 w-28 bg-gray-800 rounded mb-4' />
									<div className='h-3 w-full bg-gray-800 rounded mb-2' />
									<div className='h-3 w-3/4 bg-gray-800 rounded' />
								</div>
							)}
							{!loading && activeSessions.length === 0 && (
								<div className='lg:col-span-2 text-center text-gray-400'>
									No active sessions
								</div>
							)}
							{activeSessions.map((session, index) => (
								<motion.div
									key={session._id || session.id || index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className={`${
										expanded[String(session._id || session.id)]
											? "lg:col-span-2"
											: ""
									} rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30`}
								>
									<div className='flex items-start justify-between'>
										<div className='flex items-start space-x-4 flex-1'>
											<div className='w-12 h-12 rounded-full flex items-center justify-center text-[#00ef68] font-bold bg-[#00ef68]/10 border border-[#00ef68]/20'>
												{(
													partnerOf(session)?.name?.[0] || "U"
												).toUpperCase()}
											</div>
											<div className='flex-1'>
												<div className='flex items-center space-x-3 mb-2'>
													<h3 className='text-lg font-semibold text-white'>
														{partnerOf(session)?.name ||
															"Partner"}
													</h3>
													<span className='px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00ef68]/10 text-[#00ef68] border border-[#00ef68]/20'>
														Active
													</span>
												</div>
												<p className='text-white/50 text-sm mb-3'>
													Peer-to-peer session protocol
												</p>
												<div className='flex items-center space-x-4 text-xs text-white/40'>
													<div className='flex items-center gap-1.5'>
														<Clock className='w-3.5 h-3.5' />
														<span>
															Initialised:{" "}
															{new Date(
																session.startedAt || Date.now()
															).toLocaleString()}
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className='flex items-center space-x-2'>
											<button
												onClick={() =>
													handleJoinSession(
														String(session._id || session.id)
													)
												}
												className='px-4 py-2 rounded-2xl bg-[#00ef68] text-[#0b0c0d] text-sm font-bold hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] transition-all'
											>
												Join Room
											</button>
											<button
												onClick={() =>
													handleEndSession(
														String(session._id || session.id)
													)
												}
												className='px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 text-sm font-semibold hover:border-red-500/40 hover:text-red-400 transition-all'
											>
												Terminate
											</button>
											<button
												onClick={() =>
													handleToggleExpand(
														String(session._id || session.id)
													)
												}
												className='px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 text-sm font-semibold hover:text-white transition-all'
											>
												{expanded[String(session._id || session.id)]
													? "Collapse"
													: "Details"}
											</button>
										</div>
									</div>
									{expanded[String(session._id || session.id)] && (
										<div className='mt-6 space-y-6 pt-6 border-t border-white/5'>
											{/* AI Summary */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<div className='flex items-center justify-between mb-3'>
													<h4 className='text-sm font-semibold text-white'>
														AI Analysis
													</h4>
													<button
														onClick={() =>
															handleGenerateSummary(
																String(
																	session._id || session.id
																)
															)
														}
														className='px-3 py-1 rounded-xl bg-[#00ef68] text-[#0b0c0d] text-xs font-bold hover:-translate-y-0.5 transition-all'
													>
														{summaryLoading[
															String(session._id || session.id)
														]
															? "Processing..."
															: "Generate Recap"}
													</button>
												</div>
												<p className='text-xs text-white/50 mb-4'>
													Synthesize session artifacts and telemetry into a technical summary.
												</p>
												{summaryError[
													String(session._id || session.id)
												] && (
													<div className='text-xs text-red-400 mb-2'>
														{
															summaryError[
																String(
																	session._id || session.id
																)
															]
														}
													</div>
												)}
												<pre className='bg-black/50 text-white/70 text-xs p-4 rounded-xl border border-white/5 whitespace-pre-wrap font-mono leading-relaxed'>
													{summaries[
														String(session._id || session.id)
													] || "Inference data unavailable."}
												</pre>
											</div>
											{/* Lesson Plans */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<h4 className='text-sm font-semibold text-white mb-3'>
													Deployment Blueprints
												</h4>
												{Array.isArray(
													plansBySession[
														String(session._id || session.id)
													]
												) &&
												plansBySession[
													String(session._id || session.id)
												].length > 0 ? (
													<ul className='space-y-2'>
														{plansBySession[
															String(session._id || session.id)
														].map((p: any, i: number) => (
															<li key={i} className="flex items-center justify-between text-xs text-white/60">
																<span className='font-medium text-white/80'>
																	{p.skill ||
																		p.title ||
																		"Blueprint"}
																</span>
																<span className='text-white/30'>
																	{new Date(
																		p.createdAt ||
																			p.date ||
																			Date.now()
																	).toLocaleDateString()}
																</span>
															</li>
														))}
													</ul>
												) : (
													<div className='text-xs text-white/40'>
														No blueprints indexed for this session.
													</div>
												)}
											</div>
											{/* Personal Notes */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<div className='flex items-center justify-between mb-3'>
													<h4 className='text-sm font-semibold text-white'>
														Local Workspace Notes
													</h4>
													<span className='text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 font-bold tracking-wider uppercase'>
														Client-Side Only
													</span>
												</div>
												<textarea
													className='w-full bg-black/50 text-white/80 text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 min-h-[120px] transition-all'
													placeholder='Commit your observations and technical notes here...'
													value={
														notes[
															String(session._id || session.id)
														] || ""
													}
													onChange={(e) =>
														setNotes((prev) => ({
															...prev,
															[String(
																session._id || session.id
															)]: e.target.value,
														}))
													}
												/>
											</div>
										</div>
									)}
								</motion.div>
							))}
						</motion.div>
					)}
					{activeTab === "completed" && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='grid grid-cols-1 lg:grid-cols-3 gap-6'
						>
							{loading && completedSessions.length === 0 && (
								<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse'>
									<div className='h-4 w-40 bg-gray-800 rounded mb-2' />
									<div className='h-3 w-28 bg-gray-800 rounded mb-4' />
									<div className='h-3 w-full bg-gray-800 rounded mb-2' />
									<div className='h-3 w-3/4 bg-gray-800 rounded' />
								</div>
							)}
							{!loading && completedSessions.length === 0 && (
								<div className='lg:col-span-2 text-center text-gray-400'>
									No completed sessions
								</div>
							)}
							{completedSessions.map((session, index) => (
								<motion.div
									key={session._id || session.id || index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className={`${
										expanded[String(session._id || session.id)]
											? "lg:col-span-2"
											: ""
									} rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30`}
								>
									<div className='flex items-start justify-between'>
										<div className='flex items-start space-x-4 flex-1'>
											<div className='w-12 h-12 rounded-full flex items-center justify-center text-[#00ef68] font-bold bg-[#00ef68]/10 border border-[#00ef68]/20'>
												{(
													partnerOf(session)?.name?.[0] || "U"
												).toUpperCase()}
											</div>
											<div className='flex-1'>
												<div className='flex items-center space-x-3 mb-2'>
													<h3 className='text-lg font-semibold text-white'>
														{partnerOf(session)?.name ||
															"Partner"}
													</h3>
													<span className='px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10'>
														Archive
													</span>
													<CheckCircle className='w-4 h-4 text-[#00ef68]' />
												</div>
												<p className='text-white/50 text-sm mb-3'>
													Concluded session protocol
												</p>
												<div className='flex items-center space-x-4 text-xs text-white/40'>
													<div className='flex items-center gap-1.5'>
														<Clock className='w-3.5 h-3.5' />
														<span>
															Concluded:{" "}
															{new Date(
																session.endedAt ||
																	session.startedAt ||
																	Date.now()
															).toLocaleString()}
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className='flex items-center space-x-2'>
											<button
												onClick={() =>
													handleToggleExpand(
														String(session._id || session.id)
													)
												}
												className='px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 text-sm font-semibold hover:text-white transition-all'
											>
												{expanded[String(session._id || session.id)]
													? "Collapse"
													: "Details"}
											</button>
										</div>
									</div>
									{expanded[String(session._id || session.id)] && (
										<div className='mt-6 space-y-6 pt-6 border-t border-white/5'>
											{/* AI Summary */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<div className='flex items-center justify-between mb-3'>
													<h4 className='text-sm font-semibold text-white'>
														AI Analysis
													</h4>
													<button
														onClick={() =>
															handleGenerateSummary(
																String(
																	session._id || session.id
																)
															)
														}
														className='px-3 py-1 rounded-xl bg-[#00ef68] text-[#0b0c0d] text-xs font-bold hover:-translate-y-0.5 transition-all'
													>
														{summaryLoading[
															String(session._id || session.id)
														]
															? "Processing..."
															: "Generate Recap"}
													</button>
												</div>
												<p className='text-xs text-white/50 mb-4'>
													Synthesize session artifacts and telemetry into a technical summary.
												</p>
												{summaryError[
													String(session._id || session.id)
												] && (
													<div className='text-xs text-red-400 mb-2'>
														{
															summaryError[
																String(
																	session._id || session.id
																)
															]
														}
													</div>
												)}
												<pre className='bg-black/50 text-white/70 text-xs p-4 rounded-xl border border-white/5 whitespace-pre-wrap font-mono leading-relaxed'>
													{summaries[
														String(session._id || session.id)
													] || "Inference data unavailable."}
												</pre>
											</div>
											{/* Lesson Plans */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<h4 className='text-sm font-semibold text-white mb-3'>
													Deployment Blueprints
												</h4>
												{Array.isArray(
													plansBySession[
														String(session._id || session.id)
													]
												) &&
												plansBySession[
													String(session._id || session.id)
												].length > 0 ? (
													<ul className='space-y-2'>
														{plansBySession[
															String(session._id || session.id)
														].map((p: any, i: number) => (
															<li key={i} className="flex items-center justify-between text-xs text-white/60">
																<span className='font-medium text-white/80'>
																	{p.skill ||
																		p.title ||
																		"Blueprint"}
																</span>
																<span className='text-white/30'>
																	{new Date(
																		p.createdAt ||
																			p.date ||
																			Date.now()
																	).toLocaleDateString()}
																</span>
															</li>
														))}
													</ul>
												) : (
													<div className='text-xs text-white/40'>
														No blueprints indexed for this session.
													</div>
												)}
											</div>
											{/* Personal Notes */}
											<div className='rounded-2xl border border-white/10 bg-black/30 p-4'>
												<div className='flex items-center justify-between mb-3'>
													<h4 className='text-sm font-semibold text-white'>
														Local Workspace Notes
													</h4>
													<span className='text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 font-bold tracking-wider uppercase'>
														Client-Side Only
													</span>
												</div>
												<textarea
													className='w-full bg-black/50 text-white/80 text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 min-h-[120px] transition-all'
													placeholder='Commit your observations and technical notes here...'
													value={
														notes[
															String(session._id || session.id)
														] || ""
													}
													onChange={(e) =>
														setNotes((prev) => ({
															...prev,
															[String(
																session._id || session.id
															)]: e.target.value,
														}))
													}
												/>
											</div>
										</div>
									)}
								</motion.div>
							))}
						</motion.div>
					)}
				</div>

				{error && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className='text-center py-4 text-red-400 font-mono text-sm'
					>
						[Error] {error}
					</motion.div>
				)}
				{toast && (
					<div
						className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl transition-all duration-300 ${
							toast.type === "success" ? "bg-[#00ef68] text-[#0b0c0d]" : "bg-red-600 text-white"
						}`}
					>
						{toast.msg}
					</div>
				)}
			</div>
		</div>
	);
};

export default Sessions;
