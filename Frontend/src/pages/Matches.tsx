import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
	Users,
	MessageCircle,
	Video,
	Star,
	Clock,
	MapPin,
	X,
	Heart,
	Loader2,
} from "lucide-react";
import { usersAPI, matchAPI, sessionsAPI } from "../lib/api";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../lib/socket";
import { useMatchStore } from "../lib/matchStore";
import { useRequestsStore } from "../lib/requestsStore";
import { useRequests } from "../lib/useRequests";

const Matches: React.FC = () => {
	const [activeTab, setActiveTab] = useState<
		"matches" | "requests" | "sent" | "upcoming"
	>("matches");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [matches, setMatches] = useState<any[]>([]);
	const {
		incomingPending,
		incomingHistory,
		sentPending,
		sentHistory,
		counts,
		accept: acceptRequest,
		decline: declineRequest,
		send: sendRequest,
	} = useRequests();
	const [incomingView, setIncomingView] = useState<"pending" | "history">(
		"pending"
	);
	const [sentView, setSentView] = useState<"pending" | "history">("pending");
	const [sessions, setSessions] = useState<any[]>([]);
	const [latestSessionId, setLatestSessionId] = useState<string | null>(null);
	// simple local favorites (like) store
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const searching = useMatchStore((s) => s.searching);
	const setSearching = useMatchStore((s) => s.setSearching);
	const matchedPartner = useMatchStore((s) => s.matchedPartner);
	const setMatchedPartner = useMatchStore((s) => s.setMatchedPartner);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		msg: string;
	} | null>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
	// no auth store usage needed here currently
	const markAllRead = useRequestsStore((s) => s.markAllRead);

	const fetchMatches = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await usersAPI.getMatches();
			const data = res.data?.data ?? res.data ?? [];
			setMatches(Array.isArray(data) ? data : data.matches ?? []);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load matches");
		} finally {
			setLoading(false);
		}
	};

	// requests are managed by useRequests

	const fetchSessions = async () => {
		try {
			const res = await sessionsAPI.getSessions();
			const list = res.data?.data ?? res.data ?? [];
			setSessions(Array.isArray(list) ? list : list.sessions ?? []);
		} catch (_e) {
			// ignore; Sessions page handles deeper errors
		}
	};

	// Cleanup socket ref on unmount
	useEffect(() => {
		return () => {
			socketRef.current = null;
		};
	}, []);

	// Initialize favorites from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem("devswap:favorites");
			if (raw) {
				const arr = JSON.parse(raw);
				if (Array.isArray(arr)) setFavorites(new Set(arr.map(String)));
			}
		} catch {}
	}, []);

	// Persist favorites to localStorage
	useEffect(() => {
		try {
			localStorage.setItem(
				"devswap:favorites",
				JSON.stringify(Array.from(favorites))
			);
		} catch {}
	}, [favorites]);

	// Requests actions backed by API
	const handleAcceptRequest = async (id: string | number) => {
		try {
			const result = await acceptRequest(String(id));
			setToast({ type: "success", msg: "Request accepted" });
			// If backend returned a session, jump straight to the room
			const sessionId = result?.session?._id || result?.session?.id;
			if (sessionId) {
				navigate(`/sessions/${sessionId}/room`);
			} else {
				// Fallback: Sessions page
				navigate("/sessions");
			}
		} catch (e: any) {
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to accept request",
			});
		} finally {
			setTimeout(() => setToast(null), 2000);
		}
	};
	const handleDeclineRequest = async (id: string | number) => {
		try {
			await declineRequest(String(id));
			setToast({ type: "success", msg: "Request declined" });
		} catch (e: any) {
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to decline request",
			});
		} finally {
			setTimeout(() => setToast(null), 2000);
		}
	};

	useEffect(() => {
		fetchMatches();
		fetchSessions();
	}, []);

	// Keep a quick reference to the most recent/active session id
	useEffect(() => {
		const active = (sessions || []).find((s: any) => s.isActive !== false);
		const sid = active?._id || active?.id || null;
		if (sid) setLatestSessionId(sid);
	}, [sessions]);

	// Auto-start matching when coming from dashboard with ?search=1
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const shouldSearch = params.get("search") === "1";
		if (shouldSearch) {
			handleJoinQueue(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search]);

	const handleConnect = async (_matchId: string) => {
		try {
			// Send a partner request to this user
			const toUserId = String(_matchId);
			await sendRequest(toUserId);
			setToast({ type: "success", msg: "Request sent!" });
		} catch (e: any) {
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to send request",
			});
		} finally {
			setTimeout(() => setToast(null), 2000);
		}
	};

	// Find active session with a given user id
	const getActiveSessionIdWithUser = (userId: string) => {
		const s = (sessions || []).find((sess: any) => {
			const a = sess.userA?._id || sess.userA;
			const b = sess.userB?._id || sess.userB;
			return (a === userId || b === userId) && sess.isActive !== false;
		});
		return s?._id || s?.id || null;
	};

	const handleVideoAction = async (userId: string) => {
		const sid = getActiveSessionIdWithUser(userId);
		if (sid) {
			navigate(`/sessions/${sid}/room`);
			return;
		}
		// no active session: send a request as a prompt to start
		await handleConnect(userId);
		setToast({
			type: "success",
			msg: "Request sent. They need to accept to start video.",
		});
		setTimeout(() => setToast(null), 2000);
	};

	const toggleFavorite = (id: string) => {
		setFavorites((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
				setToast({ type: "success", msg: "Removed from favorites" });
			} else {
				next.add(id);
				setToast({ type: "success", msg: "Added to favorites" });
			}
			setTimeout(() => setToast(null), 1500);
			return next;
		});
	};

	// Setup socket listeners (once)
	useEffect(() => {
		const socket = getSocket();
		socketRef.current = socket;
		const onMatchFound = (payload: any) => {
			// eslint-disable-next-line no-console
			console.log("[matches] event match:found", payload);
			setSearching(false);
			const partner = payload?.partner ?? payload ?? null;
			setMatchedPartner({
				id: partner?._id || partner?.id || payload?.partnerId,
				name: partner?.name || payload?.name,
				avatarUrl: partner?.avatar,
				skills: [...(partner?.teachSkills ?? []), ...(partner?.learnSkills ?? [])].slice(0, 8),
				timezone: partner?.timezone,
			});
			setToast({ type: "success", msg: "We found a match for you!" });
			setTimeout(() => setToast(null), 2500);
			fetchMatches();
		};
		const onQueueJoined = () => {
			// server acknowledged we are in queue
			// eslint-disable-next-line no-console
			console.log("[matches] event match:queue:joined");
		};
		const onQueueLeft = () => {
			// eslint-disable-next-line no-console
			console.log("[matches] event match:queue:left");
			setSearching(false);
		};

		socket.on("match:found", onMatchFound);
		socket.on("match:queue:joined", onQueueJoined);
		socket.on("match:queue:left", onQueueLeft);
		// If a session is created by server (on accept), navigate directly to room
		const onSessionCreated = (payload: any) => {
			const sid = payload?.session?._id || payload?.session?.id;
			if (sid) {
				setLatestSessionId(sid);
				navigate(`/sessions/${sid}/room`);
			}
		};
		socket.on("session:created", onSessionCreated);

		return () => {
			socket.off("match:found", onMatchFound);
			socket.off("match:queue:joined", onQueueJoined);
			socket.off("match:queue:left", onQueueLeft);
			socket.off("session:created", onSessionCreated);
		};
	}, [setMatchedPartner, setSearching, navigate]);

	// Mark requests as read when Requests tab is active
	useEffect(() => {
		if (activeTab === "requests") {
			markAllRead();
		}
	}, [activeTab, markAllRead]);

	const handleJoinQueue = async (fromAuto?: boolean) => {
		try {
			setError(null);
			setSearching(true);
			// eslint-disable-next-line no-console
			console.log("[matches] POST /match/join start");
			await matchAPI.findMatch();
			// eslint-disable-next-line no-console
			console.log("[matches] POST /match/join success");
			if (!fromAuto) {
				setToast({
					type: "success",
					msg: "Searching for a matching partner…",
				});
				setTimeout(() => setToast(null), 2500);
			}
		} catch (e: any) {
			setSearching(false);
			// eslint-disable-next-line no-console
			console.error("[matches] POST /match/join error", {
				status: e?.response?.status,
				data: e?.response?.data,
				message: e?.message,
			});
			setToast({
				type: "error",
				msg:
					e?.response?.data?.message ||
					e?.message ||
					"Failed to join matching queue",
			});
			setTimeout(() => setToast(null), 3500);
		}
	};

	const handleLeaveQueue = async () => {
		try {
			// eslint-disable-next-line no-console
			console.log("[matches] POST /match/leave start");
			await matchAPI.rejectMatch("");
			// eslint-disable-next-line no-console
			console.log("[matches] POST /match/leave success");
		} finally {
			setSearching(false);
			setToast({ type: "success", msg: "Stopped searching." });
			setTimeout(() => setToast(null), 2000);
		}
	};

	const normalizedMatches = useMemo(() => {
		return matches.map((m: any) => ({
			id: m._id ?? m.id,
			name: m.name ?? m.partnerName ?? m.user?.name ?? "Developer",
			avatar: (m.name ?? m.partnerName ?? m.user?.name ?? "D")
				.split(" ")
				.map((s: string) => s[0])
				.join("")
				.slice(0, 2)
				.toUpperCase(),
			location: m.location ?? "—",
			rating: m.rating ?? 5,
			sessionsCompleted:
				m.sessionsCompleted ?? m.stats?.sessionsCompleted ?? 0,
			teachSkills: m.teachSkills ?? m.skills?.teach ?? [],
			learnSkills: m.learnSkills ?? m.skills?.learn ?? [],
			bio: m.bio ?? "",
			matchScore: m.matchScore ?? m.score ?? 0,
			isOnline: m.isOnline ?? m.status?.online ?? false,
			lastSeen: m.lastSeen ?? m.status?.lastSeen ?? "—",
		}));
	}, [matches]);

	// Normalize requests to backend shape
	const incomingRequests = useMemo(() => {
		const src =
			incomingView === "pending" ? incomingPending : incomingHistory;
		return (src || []).map((r: any) => ({
			id: r._id ?? r.id,
			name: r.fromUser?.name || r.from?.name || "Developer",
			fromUserId: r.fromUser?._id || r.from?.id,
			createdAt: r.createdAt,
			message: r.message,
			status: r.status,
		}));
	}, [incomingPending, incomingHistory, incomingView]);

	const outgoingRequests = useMemo(() => {
		const src = sentView === "pending" ? sentPending : sentHistory;
		return (src || []).map((r: any) => ({
			id: r._id ?? r.id,
			name: r.toUser?.name || r.to?.name || "Developer",
			toUserId: r.toUser?._id || r.to?.id,
			createdAt: r.createdAt,
			message: r.message,
			status: r.status,
		}));
	}, [sentPending, sentHistory, sentView]);

	return (
		<div className='relative min-h-screen bg-[#0b0c0d] pt-24 pb-16'>
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
			</div>
			{/* Match Found Modal */}
			{matchedPartner && (
				<div className='fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
					<div className='w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0c0d] p-6 shadow-2xl'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-white text-lg font-semibold'>
								Match Found
							</h3>
							<button
								onClick={() => setMatchedPartner(null)}
								className='text-white/50 hover:text-white'
							>
								<X className='w-5 h-5' />
							</button>
						</div>
						<div className='flex items-center gap-4 mb-4'>
							<div className='w-14 h-14 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center text-[#00ef68] text-lg font-semibold'>
								{matchedPartner.name?.[0]?.toUpperCase() || "U"}
							</div>
							<div>
								<p className='text-white font-medium'>
									{matchedPartner.name || "Partner"}
								</p>
								{matchedPartner.skills &&
									matchedPartner.skills.length > 0 && (
										<div className='mt-1 flex flex-wrap gap-2'>
											{matchedPartner.skills
												.slice(0, 4)
												.map((s, i) => (
													<span
														key={i}
														className='px-2 py-0.5 rounded-full border border-[#00ef68]/20 bg-[#0b0c0d] text-xs text-[#00ef68]'
													>
														{s}
													</span>
												))}
										</div>
									)}
							</div>
						</div>
						<p className='text-[#00ef68] mb-6'>
							You’ve been paired with a complementary developer. Start a session now, or come back later from Sessions.
						</p>
						<div className='flex justify-end gap-3'>
							<button
								onClick={() => setMatchedPartner(null)}
								className='px-4 py-2 rounded-2xl border border-[#00ef68]/20 bg-[#0b0c0d] text-[#00ef68] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/20 transition-all'
							>
								Later
							</button>
							<button
								onClick={() => {
									window.location.href = "/sessions";
								}}
								className='px-4 py-2 rounded-2xl bg-[#00ef68] text-[#0b0c0d] font-semibold hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] transition-all'
							>
								Start Session
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Sticky Searching Banner */}
			{searching && (
				<div className='fixed top-16 left-0 right-0 z-30'>
					<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
						<div className='rounded-2xl bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68] px-4 py-3 flex items-center justify-between backdrop-blur'>
							<div className='flex items-center gap-3'>
								<Loader2 className='w-4 h-4 animate-spin' />
								<p className='text-sm'>
									Searching for a matching partner… We’ll notify you
									here.
								</p>
							</div>
							<button
								onClick={handleLeaveQueue}
								className='px-3 py-1.5 rounded-xl bg-[#00ef68] text-[#0b0c0d] font-semibold text-sm hover:-translate-y-0.5 transition-all'
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast / Snackbar */}
			{toast && (
				<div className='fixed bottom-6 right-6 z-30'>
					<div
						className={`px-4 py-3 rounded-lg border shadow-lg ${
							toast.type === "success"
								? "bg-[#00ef68]/15 border-[#00ef68]/30 text-white"
								: "bg-red-600/90 border-red-400 text-white"
						}`}
					>
						{toast.msg}
					</div>
				</div>
			)}
			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='mb-8'
				>
					<h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white'>
						Find Learning Partners
					</h1>
					<p className='text-white/60 max-w-2xl'>
						Join the queue to get paired based on teach/learn overlap. Then send or accept a request to start a session.
					</p>
					{error && <p className='text-red-400 mt-2 text-sm'>{error}</p>}
					<div className='mt-5 flex gap-3'>
						<button
							onClick={() => handleJoinQueue()}
							className='inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00ef68] text-[#0b0c0d] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] focus:outline-none focus:ring-2 focus:ring-[#00ef68]/40'
						>
							<Users className='w-4 h-4' />
							Join Matching Queue
						</button>
						<button
							onClick={handleLeaveQueue}
							className='inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/20'
						>
							<X className='w-4 h-4' />
							Leave Queue
						</button>
					</div>
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
							{
								key: "matches",
								label: "Matches",
								count: normalizedMatches.length,
							},
							{
								key: "requests",
								label: "Requests",
								count: counts.incomingPending,
							},
							{ key: "sent", label: "Sent", count: counts.sentPending },
							{
								key: "upcoming",
								label: "Upcoming",
								count: sessions.length,
							},
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key as any)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									activeTab === tab.key
										? "bg-[#00ef68] text-[#0b0c0d] shadow"
										: "text-white/60 hover:text-white hover:bg-white/[0.06]"
								}`}
							>
								{tab.label}
								{tab.count > 0 && (
									<span className='ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80'>
										{tab.count}
									</span>
								)}
							</button>
						))}
					</div>
				</motion.div>

				{/* How it works & Tips */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='mb-8'
				>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
							<h3 className='text-white font-semibold mb-2'>
								How matching works
							</h3>
							<ol className='list-decimal list-inside text-sm text-white/70 space-y-1'>
								<li>Join the queue with your teach/learn skills</li>
								<li>We compute a two-way match and surface candidates</li>
								<li>Send or accept a request to confirm the session</li>
								<li>Join the live room and pair-program</li>
							</ol>
						</div>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
							<h3 className='text-white font-semibold mb-2'>
								Tips for better matches
							</h3>
							<ul className='list-disc list-inside text-sm text-white/70 space-y-1'>
								<li>Keep your skills and levels up to date</li>
								<li>
									Add a short bio with what you want to build or debug
								</li>
								<li>Respond quickly to requests to reduce queue churn</li>
								<li>Use Sessions to keep context and follow-ups</li>
							</ul>
						</div>
						<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
							<h3 className='text-white font-semibold mb-2'>
								Safety & respect
							</h3>
							<p className='text-sm text-white/70'>
								Be kind and professional. Share only what you're
								comfortable with. Recording or sharing content outside a
								session requires explicit consent.
							</p>
						</div>
					</div>
				</motion.div>

				{/* Content */}
				<div className='space-y-6'>
					{activeTab === "matches" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
							className='grid grid-cols-1 lg:grid-cols-2 gap-6'
						>
							{(loading || searching) && (
								<>
									{Array.from({ length: 4 }).map((_, i) => (
										<div
											key={i}
											className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 animate-pulse'
										>
											<div className='flex items-start justify-between mb-4'>
												<div className='flex items-center space-x-4'>
													<div className='w-16 h-16 bg-white/10 rounded-full' />
													<div>
														<div className='h-4 w-40 bg-white/10 rounded mb-2' />
														<div className='h-3 w-24 bg-white/10 rounded' />
													</div>
												</div>
												<div className='h-4 w-14 bg-white/10 rounded' />
											</div>
											<div className='h-3 w-full bg-white/10 rounded mb-2' />
											<div className='h-3 w-3/4 bg-white/10 rounded mb-6' />
											<div className='flex gap-2'>
												{Array.from({ length: 4 }).map((__, j) => (
													<div
														key={j}
														className='h-6 w-20 bg-white/10 rounded'
													/>
												))}
											</div>
										</div>
									))}
								</>
							)}
							{!loading && normalizedMatches.length === 0 && (
								<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center'>
									<div className='mx-auto w-16 h-16 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center mb-4'>
										<Users className='w-8 h-8 text-[#00ef68]' />
									</div>
									<h3 className='text-xl font-semibold text-white mb-2'>
										No matches yet
									</h3>
									<p className='text-white/60 mb-6'>
										Join the queue and we’ll find the best partners
										for you.
									</p>
									<button
										onClick={() => handleJoinQueue()}
										className='inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00ef68] text-[#0b0c0d] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)]'
									>
										<Users className='w-4 h-4' />
										Join Matching Queue
									</button>
								</div>
							)}
							{!loading &&
								normalizedMatches.map((match, index) => (
									<motion.div
										key={match.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
										className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30'
									>
										{/* Header */}
										<div className='flex items-start justify-between mb-4'>
											<div className='flex items-center space-x-4'>
												<div className='relative'>
													<div className='w-16 h-16 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-full flex items-center justify-center text-[#00ef68] font-bold text-lg'>
														{match.avatar}
													</div>
													{match.isOnline && (
														<div className='absolute -bottom-1 -right-1 w-5 h-5 bg-[#00ef68] border-2 border-[#0b0c0d] rounded-full shadow-[0_0_10px_rgba(0,239,104,0.35)]'></div>
													)}
												</div>
												<div>
													<h3 className='text-xl font-semibold text-white'>
														{match.name}
													</h3>
													<div className='flex items-center space-x-2 text-white/50 text-sm'>
														<MapPin className='w-4 h-4' />
														<span>{match.location}</span>
													</div>
													<div className='flex items-center space-x-4 mt-1'>
														<div className='flex items-center space-x-1'>
															<Star className='w-4 h-4 text-[#00ef68] fill-current' />
															<span className='text-white text-sm'>
																{match.rating}
															</span>
														</div>
														<span className='text-white/50 text-sm'>
															{match.sessionsCompleted} sessions
														</span>
													</div>
												</div>
											</div>
											<div className='text-right'>
												<div className='flex items-center space-x-2 mb-1'>
													<span className='inline-block w-2 h-2 rounded-full bg-[#00ef68] shadow-[0_0_10px_rgba(0,239,104,0.35)]'></span>
													<span className='text-[#00ef68] font-medium'>
														{match.matchScore}%
													</span>
												</div>
												<span className='text-white/50 text-sm'>
													{match.isOnline
														? "Online now"
														: `Last seen ${match.lastSeen}`}
												</span>
											</div>
										</div>

										{/* Bio */}
										<p className='text-white/70 text-sm mb-4 leading-relaxed'>
											{match.bio}
										</p>

										{/* Skills */}
										<div className='space-y-3 mb-6'>
											<div>
												<p className='text-white/50 text-sm mb-2'>
													Can teach:
												</p>
												<div className='flex flex-wrap gap-2'>
													{match.teachSkills.map(
														(skill: string) => (
															<span
																key={skill}
																className='px-3 py-1 bg-[#00ef68]/10 text-[#00ef68] rounded-full text-sm border border-[#00ef68]/20'
															>
																{skill}
															</span>
														)
													)}
												</div>
											</div>
											<div>
												<p className='text-white/50 text-sm mb-2'>
													Wants to learn:
												</p>
												<div className='flex flex-wrap gap-2'>
													{match.learnSkills.map(
														(skill: string) => (
															<span
																key={skill}
																className='px-3 py-1 bg-white/[0.04] text-white/80 rounded-full text-sm border border-white/10'
															>
																{skill}
															</span>
														)
													)}
												</div>
											</div>
										</div>

										{/* Actions */}
										{(() => {
											const hasPending = outgoingRequests.some(
												(r) =>
													r.toUserId === match.id &&
													(r.status === "pending" || !r.status)
											);
											return (
												<div className='flex space-x-3'>
													<button
														onClick={() =>
															handleConnect(String(match.id))
														}
														disabled={hasPending}
														className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${
															hasPending
																? "bg-white/10 text-white/50 cursor-not-allowed"
																: "bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)]"
														}`}
													>
														<MessageCircle className='w-4 h-4' />
														<span>
															{hasPending
																? "Requested"
																: "Connect"}
														</span>
													</button>
													<button
														title={
															getActiveSessionIdWithUser(
																String(match.id)
															)
																? "Join active session"
																: "Send request to start video"
														}
														onClick={() =>
															handleVideoAction(String(match.id))
														}
														className='px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/20'
													>
														<Video className='w-4 h-4' />
													</button>
													<button
														aria-label={
															favorites.has(String(match.id))
																? "Unlike"
																: "Like"
														}
														onClick={() =>
															toggleFavorite(String(match.id))
														}
														className={`px-4 py-2 rounded-2xl transition-all duration-300 border ${
															favorites.has(String(match.id))
																? "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20"
																: "border-white/10 bg-white/[0.04] text-white/80 hover:border-red-500 hover:text-red-400"
														}`}
													>
														<Heart
															className={`w-4 h-4 ${
																favorites.has(String(match.id))
																	? "fill-current"
																	: ""
															}`}
														/>
													</button>
												</div>
											);
										})()}
									</motion.div>
								))}
						</motion.div>
					)}

					{activeTab === "requests" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							<div className='mb-4 flex gap-2'>
								<button
									className={`px-3 py-1.5 rounded-md text-sm ${
										incomingView === "pending"
											? "bg-[#00ef68] text-[#0b0c0d]"
											: "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#00ef68]/30"
									}`}
									onClick={() => setIncomingView("pending")}
								>
									Pending
								</button>
								<button
									className={`px-3 py-1.5 rounded-md text-sm ${
										incomingView === "history"
											? "bg-[#00ef68] text-[#0b0c0d]"
											: "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#00ef68]/30"
									}`}
									onClick={() => setIncomingView("history")}
								>
									History
								</button>
							</div>
							{incomingRequests.length === 0 ? (
								<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center'>
									<div className='mx-auto w-16 h-16 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center mb-4'>
										<Users className='w-8 h-8 text-[#00ef68]' />
									</div>
									<h3 className='text-xl font-semibold text-white mb-2'>
										No{" "}
										{incomingView === "pending"
											? "incoming requests"
											: "history"}
									</h3>
									<p className='text-white/60'>
										You’ll see partner requests here.
									</p>
								</div>
							) : (
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									{incomingRequests.map((r) => (
										<div
											key={r.id}
											className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
										>
											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-center gap-3'>
													<div className='w-10 h-10 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center text-[#00ef68] font-medium'>
														{r.name?.[0]?.toUpperCase() || "U"}
													</div>
													<div>
														<div className='text-white font-medium'>
															{r.name || "Developer"}
														</div>
														<div className='text-white/50 text-sm'>
															sent a request
														</div>
													</div>
												</div>
												<div className='text-white/50 text-xs'>
													{r.createdAt
														? new Date(
																r.createdAt
														  ).toLocaleString()
														: ""}
												</div>
											</div>
											{r.message && (
												<p className='text-white/70 text-sm mb-3'>
													{r.message}
												</p>
											)}
											{incomingView === "pending" && (
												<div className='flex gap-3 justify-end'>
													<button
														onClick={() =>
															handleDeclineRequest(r.id)
														}
														className='px-3 py-1.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 hover:border-red-500/40 hover:text-red-300 transition-all'
													>
														Decline
													</button>
													<button
														onClick={() =>
															handleAcceptRequest(r.id)
														}
														className='px-3 py-1.5 rounded-2xl bg-[#00ef68] text-[#0b0c0d] font-semibold hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] transition-all'
													>
														Accept
													</button>
												</div>
											)}
											{incomingView === "history" &&
												r.status === "accepted" && (
													<div className='flex gap-3 justify-end mt-2'>
														{(() => {
															// Try to find a matching active session with this requester
															const sid =
																(sessions || []).find(
																	(s: any) => {
																		const a =
																			s.userA?._id ||
																			s.userA;
																		const b =
																			s.userB?._id ||
																			s.userB;
																		return (
																			(a === r.fromUserId ||
																				b ===
																					r.fromUserId) &&
																			s.isActive !== false
																		);
																	}
																)?._id || latestSessionId;
															return (
																<button
																	onClick={() =>
																		sid &&
																		navigate(
																			`/sessions/${sid}/room`
																		)
																	}
																	disabled={!sid}
																	className={`px-3 py-1.5 rounded-2xl font-semibold transition-all duration-300 ${
																		sid
																			? "bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)]"
																			: "bg-white/10 text-white/50 cursor-not-allowed"
																	}`}
																>
																	Join Session
																</button>
															);
														})()}
													</div>
												)}
										</div>
									))}
								</div>
							)}
						</motion.div>
					)}

					{activeTab === "sent" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							<div className='mb-4 flex gap-2'>
								<button
									className={`px-3 py-1.5 rounded-md text-sm ${
										sentView === "pending"
											? "bg-[#00ef68] text-[#0b0c0d]"
											: "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#00ef68]/30"
									}`}
									onClick={() => setSentView("pending")}
								>
									Pending
								</button>
								<button
									className={`px-3 py-1.5 rounded-md text-sm ${
										sentView === "history"
											? "bg-[#00ef68] text-[#0b0c0d]"
											: "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#00ef68]/30"
									}`}
									onClick={() => setSentView("history")}
								>
									History
								</button>
							</div>
							{outgoingRequests.length === 0 ? (
								<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center'>
									<div className='mx-auto w-16 h-16 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center mb-4'>
										<Users className='w-8 h-8 text-[#00ef68]' />
									</div>
									<h3 className='text-xl font-semibold text-white mb-2'>
										No{" "}
										{sentView === "pending"
											? "sent requests"
											: "history"}
									</h3>
									<p className='text-white/60'>
										Your outgoing requests will appear here.
									</p>
								</div>
							) : (
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									{outgoingRequests.map((r) => (
										<div
											key={r.id}
											className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
										>
											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-center gap-3'>
													<div className='w-10 h-10 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center text-[#00ef68] font-medium'>
														{r.name?.[0]?.toUpperCase() || "U"}
													</div>
													<div>
														<div className='text-white font-medium'>
															{r.name || "Developer"}
														</div>
														<div className='text-white/50 text-sm'>
															{r.status || "request pending"}
														</div>
													</div>
												</div>
												<div className='text-white/50 text-xs'>
													{r.createdAt
														? new Date(
																r.createdAt
														  ).toLocaleString()
														: ""}
												</div>
											</div>
											{r.message && (
												<p className='text-white/70 text-sm mb-1'>
													{r.message}
												</p>
											)}
											{r.status && (
												<span className='inline-block mt-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-white/70 text-xs'>
													{r.status}
												</span>
											)}
										</div>
									))}
								</div>
							)}
						</motion.div>
					)}
					{activeTab === "upcoming" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
							className='grid grid-cols-1 lg:grid-cols-2 gap-6'
						>
							{loading && sessions.length === 0 && (
								<>
									{Array.from({ length: 2 }).map((_, i) => (
										<div
											key={i}
											className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 animate-pulse'
										>
											<div className='h-4 w-40 bg-white/10 rounded mb-2' />
											<div className='h-3 w-28 bg-white/10 rounded mb-4' />
											<div className='h-3 w-full bg-white/10 rounded mb-2' />
											<div className='h-3 w-3/4 bg-white/10 rounded' />
										</div>
									))}
								</>
							)}
							{!loading && sessions.length === 0 && (
								<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center lg:col-span-2'>
									<div className='mx-auto w-16 h-16 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 flex items-center justify-center mb-4'>
										<Clock className='w-8 h-8 text-[#00ef68]' />
									</div>
									<h3 className='text-xl font-semibold text-white mb-2'>
										No upcoming sessions
									</h3>
									<p className='text-white/60'>
										Join the matching queue to schedule a new session.
									</p>
								</div>
							)}
							{sessions.map((s) => (
								<div
									key={s.id || s._id}
									className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
								>
									<div className='flex items-start justify-between mb-2'>
										<div>
											<div className='text-white font-semibold'>
												{s.topic || "Skill Swap Session"}
											</div>
											<div className='text-white/50 text-sm'>
												with{" "}
												{s.partner?.name ||
													s.user?.name ||
													"Partner"}
											</div>
										</div>
										<span className='text-white/70 text-sm'>
											{new Date(
												s.scheduledAt || s.createdAt || Date.now()
											).toLocaleString()}
										</span>
									</div>
									{s.notes && (
										<p className='text-white/70 text-sm'>{s.notes}</p>
									)}
								</div>
							))}
						</motion.div>
					)}
				</div>

				{/* Empty State */}
				{((activeTab === "matches" && normalizedMatches.length === 0) ||
					(activeTab === "requests" && incomingRequests.length === 0) ||
					(activeTab === "sent" && outgoingRequests.length === 0)) && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className='text-center py-12'
					>
						<Users className='w-16 h-16 text-white/20 mx-auto mb-4' />
						<h3 className='text-xl font-medium text-white/60 mb-2'>
							{activeTab === "matches" && "No matches found"}
							{activeTab === "requests" && "No requests received"}
							{activeTab === "sent" && "No requests sent"}
						</h3>
						<p className='text-white/40'>
							{activeTab === "matches" &&
								"Try updating your skills or preferences to find better matches"}
							{activeTab === "requests" &&
								"When developers want to connect with you, they'll appear here"}
							{activeTab === "sent" &&
								"Your connection requests will appear here"}
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default Matches;
