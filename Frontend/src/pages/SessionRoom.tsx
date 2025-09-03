import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import Seo from "../components/common/Seo";
import {
	Mic,
	MicOff,
	Video,
	VideoOff,
	MonitorUp,
	PhoneOff,
	Users,
	Send,
	Maximize2,
	Minimize2,
	Settings,
} from "lucide-react";
import { sessionsAPI, aiAPI } from "../lib/api";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
const LS_AUDIO = "devswap.device.audioId";
const LS_VIDEO = "devswap.device.videoId";
const LS_SETUP_SEEN = "devswap.device.setupSeen";

const SessionRoom: React.FC = () => {
	const { id: sessionId } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [connected, setConnected] = useState(false);
	const [micOn, setMicOn] = useState(true);
	const [camOn, setCamOn] = useState(true);
	const [sharing, setSharing] = useState(false);
	const [status, setStatus] = useState<string>("Connecting…");
	const [participants, setParticipants] = useState<
		{ id: string; name: string }[]
	>([]);
	const [chat, setChat] = useState<
		{ from: string; text: string; t: number; clientId?: string }[]
	>([]);
	// Request-to-speak state
	const [incomingRequests, setIncomingRequests] = useState<
		{ from: string; name?: string }[]
	>([]);
	const [speakStatus, setSpeakStatus] = useState<
		"idle" | "requesting" | "granted"
	>("idle");
	const [chatInput, setChatInput] = useState("");
	const [devices, setDevices] = useState<{
		audioIn: MediaDeviceInfo[];
		videoIn: MediaDeviceInfo[];
	}>({ audioIn: [], videoIn: [] });
	const [selectedAudio, setSelectedAudio] = useState<string | undefined>(
		undefined
	);
	const [selectedVideo, setSelectedVideo] = useState<string | undefined>(
		undefined
	);
	const [stats, setStats] = useState<{ bitrateKbps?: number; rttMs?: number }>(
		{}
	);
	// Layout and style controls
	const immersive = false; // immersive mode disabled; kept for layout conditionals
	const [frameStyle] = useState<"rounded" | "square" | "glow">("rounded");
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
	// AI assistant state
	const [aiQuestion, setAiQuestion] = useState<string>("");
	const [aiAnswer, setAiAnswer] = useState<string>("");
	const [aiLoading, setAiLoading] = useState<boolean>(false);
	const [aiMeta, setAiMeta] = useState<
		{ fallback?: boolean; reason?: string; model?: string } | undefined
	>(undefined);
	const [aiOpen, setAiOpen] = useState<boolean>(false);
	const [aiCooldownMs, setAiCooldownMs] = useState<number>(0);
	const [chatOpen, setChatOpen] = useState<boolean>(false);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [devicesPanelOpen, setDevicesPanelOpen] = useState<boolean>(false);
	const [applyingDevices, setApplyingDevices] = useState<boolean>(false);
	// When true, users must request to speak; by default off so unmute toggles directly
	const [moderatedSpeaking] = useState<boolean>(false);
	// tick cooldown each second
	useEffect(() => {
		if (aiCooldownMs <= 0) return;
		const id = setInterval(() => {
			setAiCooldownMs((v) => Math.max(0, v - 1000));
		}, 1000);
		return () => clearInterval(id);
	}, [aiCooldownMs]);

	const localVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteContainerRef = useRef<HTMLDivElement | null>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);
	const screenStreamRef = useRef<MediaStream | null>(null);
	const statsTimerRef = useRef<any>(null);
	const chatListRef = useRef<HTMLDivElement | null>(null);
	const prevChatLenRef = useRef<number>(0);
	// Modal and trigger refs for Devices & Audio
	const devicesModalRef = useRef<HTMLDivElement | null>(null);
	const settingsBtnRef = useRef<HTMLButtonElement | null>(null);

	const socketUrl = useMemo(() => {
		// Prefer explicit socket URL if provided
		const envUrl = (import.meta as any).env?.VITE_SOCKET_URL;
		if (envUrl) return envUrl;
		// Dev fallback: if running on Vite (5173), assume backend at 5000
		if (window.location.port === "5173")
			return `${window.location.protocol}//${window.location.hostname}:5000`;
		return window.location.origin;
	}, []);

	// Track optimistic messages to avoid duplicate display when server echoes them back
	const pendingClientIdsRef = useRef<Set<string>>(new Set());
	const lastLocalMsgRef = useRef<{ text: string; t: number } | null>(null);
	// const myIdRef = useRef<string | null>(null); // best-effort self id if server provides it later
	const nameMapRef = useRef<Map<string, string>>(new Map());

	// Auto-scroll chat to bottom when new messages arrive
	useEffect(() => {
		const el = chatListRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
	}, [chat]);

	// Track unread messages when chat is closed
	useEffect(() => {
		const prev = prevChatLenRef.current;
		const curr = chat.length;
		if (curr > prev) {
			const last = chat[curr - 1];
			if (!chatOpen && last && last.from !== "me") {
				setUnreadCount((n) => n + 1);
			}
		}
		prevChatLenRef.current = curr;
	}, [chat, chatOpen]);

	// When chat opens, reset unread and ensure scrolled to bottom
	useEffect(() => {
		if (chatOpen) {
			setUnreadCount(0);
			const el = chatListRef.current;
			if (el) {
				// timeout ensures the element is rendered before scroll
				setTimeout(
					() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }),
					0
				);
			}
		}
	}, [chatOpen]);

	// Devices modal: Esc to close, focus trap, initial focus, and scroll lock
	useEffect(() => {
		if (!devicesPanelOpen) return;

		const modal = devicesModalRef.current;

		// Disable background scroll
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		// Move focus to first focusable element in modal
		const focusableSelectors = [
			"a[href]",
			"button:not([disabled])",
			"select:not([disabled])",
			"textarea:not([disabled])",
			"input:not([disabled])",
			'[tabindex]:not([tabindex="-1"])',
		].join(",");
		const focusables = modal
			? Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors))
			: [];
		const first = focusables[0];
		if (first) setTimeout(() => first.focus(), 0);

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				setDevicesPanelOpen(false);
				// restore focus to Settings button
				setTimeout(() => settingsBtnRef.current?.focus(), 0);
				return;
			}
			if (e.key === "Tab" && modal && focusables.length > 0) {
				const active = document.activeElement as HTMLElement | null;
				const idx = active ? focusables.indexOf(active) : -1;
				if (e.shiftKey) {
					// Shift+Tab: move backward
					if (idx <= 0) {
						e.preventDefault();
						focusables[focusables.length - 1].focus();
					}
				} else {
					// Tab: move forward
					if (idx === -1 || idx >= focusables.length - 1) {
						e.preventDefault();
						focusables[0].focus();
					}
				}
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [devicesPanelOpen]);

	// Auto-open Devices panel on first join or when no prefs
	useEffect(() => {
		try {
			const seen = localStorage.getItem(LS_SETUP_SEEN) === "1";
			const hasPrefs = Boolean(
				localStorage.getItem(LS_AUDIO) || localStorage.getItem(LS_VIDEO)
			);
			if (!seen || !hasPrefs) setDevicesPanelOpen(true);
		} catch {}
	}, []);

	// Fullscreen toggle for remote container
	const toggleFullscreen = async () => {
		const el = remoteContainerRef.current;
		if (!el) return;
		try {
			if (!document.fullscreenElement) {
				await el.requestFullscreen?.();
			} else {
				await document.exitFullscreen?.();
			}
		} catch {}
	};
	// const toggleImmersive = () => setImmersive((v) => !v); // Removed immersive toggle button; keep function commented to avoid unused var

	// Track fullscreen changes to update UI state and icon
	useEffect(() => {
		const onFsChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", onFsChange);
		return () => document.removeEventListener("fullscreenchange", onFsChange);
	}, []);

	useEffect(() => {
		if (!sessionId) return;

		const start = async () => {
			setStatus("Preparing media…");
			// Load saved device preferences (if any)
			let initialAudioId: string | undefined = undefined;
			let initialVideoId: string | undefined = undefined;
			try {
				const savedAudio = localStorage.getItem(LS_AUDIO) || undefined;
				const savedVideo = localStorage.getItem(LS_VIDEO) || undefined;
				if (savedAudio) setSelectedAudio(savedAudio);
				if (savedVideo) setSelectedVideo(savedVideo);
				// Use saved values immediately for initial gUM
				initialAudioId = savedAudio;
				initialVideoId = savedVideo;
			} catch {}
			// Get mic+camera
			let local: MediaStream | null = null;
			try {
				local = await navigator.mediaDevices.getUserMedia({
					audio: initialAudioId
						? { deviceId: { exact: initialAudioId } }
						: true,
					video: initialVideoId
						? { deviceId: { exact: initialVideoId } }
						: true,
				});
			} catch (e: any) {
				console.error("getUserMedia failed", e);
				// Try audio-only fallback if video device is busy or unreadable
				try {
					const audioOnly = await navigator.mediaDevices.getUserMedia({
						audio: initialAudioId
							? { deviceId: { exact: initialAudioId } }
							: true,
						video: false,
					});
					local = audioOnly;
					setCamOn(false);
					setStatus("Camera unavailable. Joined with audio only.");
				} catch (e2: any) {
					console.error("audio-only getUserMedia also failed", e2);
					// Proceed without local media so user can still join
					setStatus("No mic/camera access. Joining without media…");
					setMicOn(false);
					setCamOn(false);
				}
			}
			if (local) {
				localStreamRef.current = local;
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = local;
				}
			}
			// enumerate devices for selectors
			try {
				const devs = await navigator.mediaDevices.enumerateDevices();
				setDevices({
					audioIn: devs.filter((d) => d.kind === "audioinput"),
					videoIn: devs.filter((d) => d.kind === "videoinput"),
				});
			} catch {}

			setStatus("Connecting to room…");
			const token = localStorage.getItem("authToken");
			const socket = io(socketUrl, {
				withCredentials: true,
				// Allow polling fallback to avoid proxy/WebSocket issues
				transports: ["websocket", "polling"],
				timeout: 15000,
				reconnection: true,
				reconnectionAttempts: Infinity,
				reconnectionDelay: 500,
				reconnectionDelayMax: 5000,
				auth: token ? { token: `Bearer ${token}` } : undefined,
			});
			socketRef.current = socket;

			const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
			pcRef.current = pc;

			// Push local tracks if available
			if (local) {
				local.getTracks().forEach((track) => pc.addTrack(track, local!));
			}

			pc.ontrack = (event) => {
				const [stream] = event.streams;
				if (remoteVideoRef.current)
					remoteVideoRef.current.srcObject = stream;
			};

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					socket.emit("ice-candidate", {
						sessionId,
						candidate: event.candidate,
					});
				}
			};

			pc.onconnectionstatechange = () => {
				const state = pc.connectionState;
				if (state === "connected") {
					setStatus("Connected");
				} else if (state === "disconnected") {
					setStatus("Peer disconnected — attempting to reconnect…");
					try {
						pc.restartIce();
					} catch {}
				} else if (state === "failed") {
					setStatus("Connection failed — retrying…");
					try {
						pc.restartIce();
					} catch {}
					// Also re-emit join to trigger renegotiation
					try {
						socket.emit("join", { sessionId });
					} catch {}
				}
			};

			// Socket signaling
			socket.on("connect", () => {
				setConnected(true);
				socket.emit("join", { sessionId });
				setStatus("Joined room");
				// Announce our initial audio state
				try {
					socket.emit("audio:state", { sessionId, muted: !micOn });
				} catch {}
			});

			socket.on(
				"joined",
				async ({ shouldCreateOffer }: { shouldCreateOffer: boolean }) => {
					if (shouldCreateOffer) {
						const offer = await pc.createOffer();
						await pc.setLocalDescription(offer);
						socket.emit("offer", { sessionId, sdp: offer });
					}
				}
			);

			socket.on(
				"offer",
				async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
					await pc.setRemoteDescription(new RTCSessionDescription(sdp));
					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);
					socket.emit("answer", { sessionId, sdp: answer });
				}
			);

			socket.on(
				"answer",
				async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
					await pc.setRemoteDescription(new RTCSessionDescription(sdp));
				}
			);

			socket.on(
				"ice-candidate",
				async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
					try {
						await pc.addIceCandidate(new RTCIceCandidate(candidate));
					} catch (e) {
						console.warn("Failed to add ICE candidate", e);
					}
				}
			);

			// participants and chat
			socket.on("participants", (list: any[]) => {
				// Expect [{id, name}], fallback to array of ids
				let enriched: { id: string; name: string }[] = [];
				if (
					Array.isArray(list) &&
					list.length &&
					typeof list[0] === "object"
				) {
					const dedup = new Map<string, string>();
					for (const it of list as { id: string; name?: string }[]) {
						if (it?.id) dedup.set(it.id, it.name || it.id);
					}
					enriched = Array.from(dedup.entries()).map(([id, name]) => ({
						id,
						name,
					}));
				} else if (Array.isArray(list)) {
					const ids = Array.from(new Set(list as string[]));
					enriched = ids.map((id) => ({ id, name: id }));
				}
				setParticipants(enriched);
				// update name map
				const map = nameMapRef.current;
				for (const p of enriched) map.set(p.id, p.name);
			});
			// Remote audio state updates
			socket.on("audio:state", (data: { from: string; muted: boolean }) => {
				if (!data || !data.from) return;
				setPeerAudio((prev) => ({ ...prev, [data.from]: data.muted }));
			});
			socket.on(
				"chat:message",
				(msg: {
					from: string;
					fromName?: string;
					text: string;
					t?: number;
					clientId?: string;
				}) => {
					const t = msg.t || Date.now();
					// Suppress duplicate if it's our optimistic message identified by clientId
					if (
						msg.clientId &&
						pendingClientIdsRef.current.has(msg.clientId)
					) {
						pendingClientIdsRef.current.delete(msg.clientId);
						return; // already shown as 'You'
					}
					// Heuristic fallback: if server didn't echo clientId, suppress if same text as last local within 2s
					const last = lastLocalMsgRef.current;
					if (
						!msg.clientId &&
						last &&
						last.text === msg.text &&
						Math.abs(t - last.t) < 2000
					) {
						return;
					}
					// store name if provided
					if (msg.from && msg.fromName)
						nameMapRef.current.set(msg.from, msg.fromName);
					// append message to chat
					setChat((prev) => [
						...prev,
						{ from: msg.from, text: msg.text, t, clientId: msg.clientId },
					]);
				}
			);
			socket.on("peer-left", () => {
				setStatus("Peer left");
				// Keep local preview; remote will go black
				if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
					(remoteVideoRef.current.srcObject as MediaStream)
						.getTracks()
						.forEach((t) => t.stop());
					remoteVideoRef.current.srcObject = null;
				}
			});

			socket.on("disconnect", () => {
				setConnected(false);
				setStatus("Disconnected");
			});
			socket.on("connect_error", (err) => {
				console.error("Socket connect_error", err);
				setStatus(
					err?.message
						? `Socket error: ${err.message}`
						: "Socket connection error"
				);
			});

			// Request-to-speak events
			socket.on("speak:request", ({ from }: { from: string }) => {
				// Deduplicate by sender
				setIncomingRequests((prev) => {
					if (prev.some((r) => r.from === from)) return prev;
					const name = nameMapRef.current.get(from);
					return [...prev, { from, name }];
				});
			});
			socket.on("speak:grant", (_data: { from?: string; to?: string }) => {
				// If we were requesting, enable mic and mark granted
				if (speakStatusRef.current === "requesting") {
					const s = localStreamRef.current;
					if (s) {
						s.getAudioTracks().forEach((t) => (t.enabled = true));
						setMicOn(true);
						try {
							socket.emit("audio:state", { sessionId, muted: false });
						} catch {}
					}
					setSpeakStatus("granted");
					setStatus("You may speak now");
				}
			});
			socket.on("speak:deny", (_data: { from?: string; to?: string }) => {
				if (speakStatusRef.current === "requesting") {
					setSpeakStatus("idle");
					setStatus("Speak request denied");
				}
			});
			socket.on("speak:revoke", (_data: { from?: string; to?: string }) => {
				if (speakStatusRef.current === "granted") {
					const s = localStreamRef.current;
					if (s) {
						s.getAudioTracks().forEach((t) => (t.enabled = false));
						setMicOn(false);
						try {
							socket.emit("audio:state", { sessionId, muted: true });
						} catch {}
					}
					setSpeakStatus("idle");
					setStatus("Speaking permission revoked");
				}
			});

			socket.io.on("reconnect_attempt", () => setStatus("Reconnecting…"));
			socket.io.on("reconnect", () => setStatus("Reconnected"));
			socket.io.on("error", () => setStatus("Connection error"));
			socket.io.on("reconnect", () => {
				try {
					socket.emit("join", { sessionId });
				} catch {}
			});

			// stats polling
			statsTimerRef.current = setInterval(async () => {
				const pcNow = pcRef.current;
				if (!pcNow) return;
				try {
					const stats = await pcNow.getStats();
					let kbps = undefined as number | undefined;
					let rtt = undefined as number | undefined;
					stats.forEach((report) => {
						if (
							report.type === "outbound-rtp" &&
							report.kind === "video"
						) {
							// bitrate estimation via bytesSent delta would need previous sample; keep simple by using report.bitrate if present
						}
						if (
							report.type === "remote-inbound-rtp" &&
							(report as any).roundTripTime
						) {
							rtt = Math.round(
								((report as any).roundTripTime as number) * 1000
							);
						}
						if (
							(report as any).bitrateMean &&
							typeof (report as any).bitrateMean === "number"
						) {
							kbps = Math.round(
								((report as any).bitrateMean as number) / 1000
							);
						}
					});
					setStats({ bitrateKbps: kbps, rttMs: rtt });
				} catch {}
			}, 2000);
		};

		start();

		return () => {
			// cleanup
			try {
				socketRef.current?.emit("leave", { sessionId });
			} catch {}
			socketRef.current?.disconnect();
			if (pcRef.current) {
				pcRef.current.getSenders().forEach((s) => {
					try {
						s.track?.stop();
					} catch {}
				});
				pcRef.current.close();
				pcRef.current = null;
			}
			[localStreamRef.current, screenStreamRef.current].forEach((s) => {
				if (s) s.getTracks().forEach((t) => t.stop());
			});
			if (statsTimerRef.current) clearInterval(statsTimerRef.current);
		};
	}, [sessionId, socketUrl, navigate]);

	const formatTime = (t: number) =>
		new Date(t).toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	const displayName = (from?: string) => {
		if (!from) return "Unknown";
		if (from === "me") return "You";
		const name = nameMapRef.current.get(from);
		return name || from;
	};

	// Per-participant audio mute state (true = muted)
	const [peerAudio, setPeerAudio] = useState<Record<string, boolean>>({});

	// Track speakStatus in a ref for socket handlers
	// Ask AI helper
	const askAI = async () => {
		if (!aiQuestion.trim()) return;
		try {
			setAiLoading(true);
			setAiAnswer("");
			setAiMeta(undefined);
			const { data } = await aiAPI.assist({
				question: aiQuestion,
				mode: "qa",
				depth: "medium",
				sessionId: sessionId,
				includeContext: true,
			});
			setAiAnswer(data?.answer || "");
			if (data?.meta) setAiMeta(data.meta);
			const ms = Number(data?.meta?.cooldownMs || 0);
			if (!Number.isNaN(ms) && ms > 0) setAiCooldownMs(ms);
		} catch (e: any) {
			setAiAnswer(e?.response?.data?.message || "Failed to get answer");
			setAiMeta({ fallback: true, reason: "error" });
		} finally {
			setAiLoading(false);
		}
	};

	const speakStatusRef = useRef<"idle" | "requesting" | "granted">("idle");
	useEffect(() => {
		speakStatusRef.current = speakStatus;
	}, [speakStatus]);

	const toggleMic = () => {
		const stream = localStreamRef.current;
		if (!stream) return;
		stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
		const on = stream.getAudioTracks().every((t) => t.enabled);
		setMicOn(on);
		try {
			socketRef.current?.emit("audio:state", { sessionId, muted: !on });
		} catch {}
	};

	const toggleCam = () => {
		const stream = localStreamRef.current;
		if (!stream) return;
		stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
		setCamOn(stream.getVideoTracks().every((t) => t.enabled));
	};

	const startScreenShare = async () => {
		if (sharing) return stopScreenShare();
		try {
			const display = await (navigator.mediaDevices as any).getDisplayMedia({
				video: true,
				audio: false,
			});
			screenStreamRef.current = display;
			const pc = pcRef.current;
			const screenTrack = display.getVideoTracks()[0];
			if (pc) {
				const sender = pc
					.getSenders()
					.find((s) => s.track && s.track.kind === "video");
				if (sender) await sender.replaceTrack(screenTrack);
			}
			screenTrack.onended = () => {
				stopScreenShare();
			};
			setSharing(true);
		} catch (e) {
			console.warn("Screen share failed", e);
		}
	};

	const stopScreenShare = async () => {
		const display = screenStreamRef.current;
		if (display) {
			display.getTracks().forEach((t) => t.stop());
			screenStreamRef.current = null;
		}
		// Switch back to camera video track
		const pc = pcRef.current;
		const local = localStreamRef.current;
		if (pc && local) {
			const camTrack = local.getVideoTracks()[0];
			const sender = pc
				.getSenders()
				.find((s) => s.track && s.track.kind === "video");
			if (sender && camTrack) await sender.replaceTrack(camTrack);
		}
		setSharing(false);
	};

	// Leave room and return to Sessions
	const leaveRoom = async () => {
		// Avoid race conditions and inform user
		setStatus("Ending session…");
		const id = sessionId;
		try {
			// Best-effort notify backend to mark session as ended BEFORE leaving
			if (id) {
				try {
					await sessionsAPI.endSession(id);
				} catch (e) {
					// Non-fatal: we still proceed to cleanup/navigation
					console.warn("Failed to end session via API", e);
				}
			}

			// Exit fullscreen if active
			if (document.fullscreenElement) {
				try {
					document.exitFullscreen?.();
				} catch {}
			}
			// Stop any active screen share
			const display = screenStreamRef.current;
			if (display) {
				try {
					display.getTracks().forEach((t) => t.stop());
				} catch {}
				screenStreamRef.current = null;
			}
			// Stop local media tracks
			const local = localStreamRef.current;
			if (local) {
				try {
					local.getTracks().forEach((t) => t.stop());
				} catch {}
				localStreamRef.current = null;
			}
			// Close peer connection
			const pc = pcRef.current;
			if (pc) {
				try {
					pc.getSenders().forEach((s) => s.track && s.track.stop());
				} catch {}
				try {
					pc.close();
				} catch {}
				pcRef.current = null;
			}
			// Tell the room we are leaving, then disconnect socket
			const sock = socketRef.current;
			if (sock) {
				try {
					sock.emit("leave", { sessionId: id });
				} catch {}
				try {
					sock.removeAllListeners();
				} catch {}
				try {
					sock.disconnect();
				} catch {}
				socketRef.current = null;
			}
		} finally {
			navigate("/sessions");
		}
	};

	// Manual reconnect control
	const manualReconnect = () => {
		const sock = socketRef.current;
		const pc = pcRef.current;
		setStatus("Reconnecting…");
		if (sock && sock.connected) {
			try {
				sock.emit("join", { sessionId });
			} catch {}
		} else {
			try {
				sock?.connect();
			} catch {}
		}
		try {
			pc?.restartIce();
		} catch {}
	};

	// Request-to-speak actions
	const requestToSpeak = () => {
		if (!socketRef.current) return;
		socketRef.current.emit("speak:request", { sessionId });
		setSpeakStatus("requesting");
		setStatus("Requested to speak…");
	};
	const grantRequest = (to: string) => {
		if (!socketRef.current) return;
		socketRef.current.emit("speak:grant", { to, sessionId });
		setIncomingRequests((prev) => prev.filter((r) => r.from !== to));
	};
	const denyRequest = (to: string) => {
		if (!socketRef.current) return;
		socketRef.current.emit("speak:deny", { to, sessionId });
		setIncomingRequests((prev) => prev.filter((r) => r.from !== to));
	};
	// const revokeSpeaking = () => {
	//   if (!socketRef.current) return;
	//   socketRef.current.emit('speak:revoke', { sessionId });
	//   // Locally also mute
	//   const s = localStreamRef.current;
	//   if (s) {
	//     s.getAudioTracks().forEach((t) => (t.enabled = false));
	//     setMicOn(false);
	//   }
	//   setSpeakStatus('idle');
	// };

	// Push-to-talk: enable audio while holding
	const pttDown = () => {
		const s = localStreamRef.current;
		if (!s) return;
		s.getAudioTracks().forEach((t) => (t.enabled = true));
		setMicOn(true);
		try {
			socketRef.current?.emit("audio:state", { sessionId, muted: false });
		} catch {}
	};
	const pttUp = () => {
		const s = localStreamRef.current;
		if (!s) return;
		s.getAudioTracks().forEach((t) => (t.enabled = false));
		setMicOn(false);
		try {
			socketRef.current?.emit("audio:state", { sessionId, muted: true });
		} catch {}
	};

	// Send chat message
	const sendChat = () => {
		const text = chatInput.trim();
		if (!text || !socketRef.current) return;
		const clientId = `${Date.now()}-${Math.random()
			.toString(36)
			.slice(2, 8)}`;
		pendingClientIdsRef.current.add(clientId);
		const now = Date.now();
		lastLocalMsgRef.current = { text, t: now };
		socketRef.current.emit("chat:send", { sessionId, text, clientId });
		setChat((prev) => [...prev, { from: "me", text, t: now, clientId }]);
		setChatInput("");
	};

	// Change devices
	const applyDevices = async () => {
		if (applyingDevices) return;
		setApplyingDevices(true);
		try {
			const constraints: MediaStreamConstraints = {
				audio: selectedAudio
					? { deviceId: { exact: selectedAudio } }
					: true,
				video: selectedVideo
					? { deviceId: { exact: selectedVideo } }
					: true,
			};
			try {
				const newStream = await navigator.mediaDevices.getUserMedia(
					constraints
				);
				// replace tracks in PC
				const pc = pcRef.current;
				if (!pc) return;
				const old = localStreamRef.current;
				if (old) old.getTracks().forEach((t) => t.stop());
				localStreamRef.current = newStream;
				if (localVideoRef.current)
					localVideoRef.current.srcObject = newStream;
				for (const track of newStream.getTracks()) {
					const sender = pc
						.getSenders()
						.find((s) => s.track && s.track.kind === track.kind);
					if (sender) await sender.replaceTrack(track);
				}
				const micNow = newStream.getAudioTracks().every((t) => t.enabled);
				setMicOn(micNow);
				try {
					socketRef.current?.emit("audio:state", {
						sessionId,
						muted: !micNow,
					});
				} catch {}
				setCamOn(newStream.getVideoTracks().every((t) => t.enabled));
				// persist selection
				if (selectedAudio) localStorage.setItem(LS_AUDIO, selectedAudio);
				if (selectedVideo) localStorage.setItem(LS_VIDEO, selectedVideo);
				try {
					localStorage.setItem(LS_SETUP_SEEN, "1");
				} catch {}
				setDevicesPanelOpen(false);
			} catch {}
		} catch (e) {
			console.warn("applyDevices failed", e);
		} finally {
			setApplyingDevices(false);
		}
	};

	return (
		<div className='min-h-screen bg-black pt-16 pb-6'>
			<Seo
				title="Live Session | DevSwap"
				description="Real-time peer-to-peer session room for collaborative learning on DevSwap."
				canonical={`/sessions/${sessionId}`}
				noindex
			/>
			<div className='max-w-none w-full mx-auto px-4 sm:px-6 lg:px-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-4'
				>
					<h1 className='text-white text-2xl font-semibold'>
						Session Room
					</h1>
					<p className='text-gray-400 text-sm'>
						Session ID: {sessionId} • {status}{" "}
						{stats.bitrateKbps ? `• ${stats.bitrateKbps} kbps` : ""}{" "}
						{typeof stats.rttMs === "number"
							? `• RTT ${stats.rttMs} ms`
							: ""}
					</p>
					{(!connected ||
						/Disconnected|Reconnecting|failed/i.test(status)) && (
						<div className='mt-2 flex items-center gap-2'>
							<span className='text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1'>
								Connection issue
							</span>
							<button
								onClick={manualReconnect}
								className='text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
							>
								Reconnect
							</button>
						</div>
					)}
				</motion.div>

				{/* AI Assistant Top Bar */}
				<div className='sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-4'>
					<div className='rounded-xl border border-gray-800 bg-[#0b0c0d]'>
						<div className='flex items-center justify-between px-3 py-2'>
							<button
								onClick={() => setAiOpen((v) => !v)}
								className='inline-flex items-center gap-2 text-sm font-semibold text-white'
							>
								<span className='inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]' />
								AI Assistant
							</button>
							<div className='flex items-center gap-2'>
								{!aiOpen && (
									<input
										value={aiQuestion}
										onChange={(e) => setAiQuestion(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												setAiOpen(true);
												askAI();
											}
										}}
										placeholder='Ask about JS, React, etc.'
										className='hidden md:block w-72 bg-black/40 border border-gray-800 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-600'
									/>
								)}
								<button
									onClick={() => {
										if (!aiOpen) setAiOpen(true);
										askAI();
									}}
									disabled={aiLoading || aiCooldownMs > 0}
									className='px-3 py-1.5 h-9 min-w-[84px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded text-sm inline-flex items-center justify-center gap-2'
								>
									{aiLoading && (
										<svg
											className='animate-spin h-4 w-4 text-white'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
											></circle>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
											></path>
										</svg>
									)}
									{aiCooldownMs > 0
										? `Cooldown ${Math.ceil(aiCooldownMs / 1000)}s`
										: "Ask"}
								</button>
							</div>
						</div>
						{aiOpen && (
							<div className='px-3 pb-3 border-t border-gray-800'>
								<div className='flex items-center gap-2 mt-3'>
									<input
										value={aiQuestion}
										onChange={(e) => setAiQuestion(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") askAI();
										}}
										className='flex-1 bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-600'
										placeholder='Describe your question clearly…'
									/>
									<button
										onClick={askAI}
										disabled={aiLoading || aiCooldownMs > 0}
										className='px-3 py-2 h-10 min-w-[96px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded text-sm inline-flex items-center justify-center gap-2'
									>
										{aiLoading && (
											<svg
												className='animate-spin h-4 w-4 text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
												></path>
											</svg>
										)}
										{aiCooldownMs > 0
											? `Cooldown ${Math.ceil(aiCooldownMs / 1000)}s`
											: "Ask"}
									</button>
								</div>
								{aiAnswer && (
									<div className='mt-3 text-sm text-gray-200 whitespace-pre-wrap max-h-60 overflow-auto border border-gray-800 rounded p-3 bg-black/30'>
										{aiAnswer}
										{aiMeta?.fallback && (
											<div className='mt-2 text-xs text-amber-400'>
												AI is in limited mode (reason:{" "}
												{aiMeta.reason || "unknown"}). Try again
												later.
											</div>
										)}
										{aiMeta?.model && (
											<div className='mt-1 text-xs text-gray-500'>
												Model: {aiMeta.model}
											</div>
										)}
										{aiCooldownMs > 0 && (
											<div className='mt-1 text-xs text-gray-500'>
												Cooldown active — please wait{" "}
												{Math.ceil(aiCooldownMs / 1000)}s
											</div>
										)}
									</div>
								)}
								{!aiAnswer && !aiLoading && (
									<div className='mt-2 text-xs text-gray-500'>
										Tip: Ask specific, concise questions for best
										results.
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<div className='grid grid-cols-1 xl:grid-cols-6 gap-4 min-h-0 items-start'>
					<div
						className={`${
							immersive ? "xl:col-span-6" : "xl:col-span-4"
						} self-start bg-[#0b0c0d] rounded-xl border border-[#25282c] p-3 min-h-0`}
					>
						<div
							ref={remoteContainerRef}
							className={`relative ${
								frameStyle === "square" ? "rounded-none" : "rounded-xl"
							} ${
								frameStyle === "glow"
									? "ring-2 ring-[#00ef68]/30 shadow-[0_0_30px_rgba(0,239,104,0.25)] border border-[#00ef68]/30"
									: "border border-[#25282c]"
							} overflow-hidden`}
						>
							<video
								ref={remoteVideoRef}
								className={`w-full ${
									frameStyle === "square"
										? "rounded-none"
										: "rounded-lg"
								} bg-black aspect-video`}
								autoPlay
								playsInline
							/>
							{/* moved controls outside frame */}
							{/* Remote mic status indicator */}
							{(() => {
								const primaryPeerId = participants[0]?.id;
								const remoteMuted = primaryPeerId
									? peerAudio[primaryPeerId]
									: undefined;
								if (remoteMuted === undefined) return null;
								return (
									<div className='absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 border border-black/40 backdrop-blur text-xs text-white flex items-center gap-1'>
										{remoteMuted ? (
											<MicOff className='w-3.5 h-3.5 text-red-400' />
										) : (
											<Mic className='w-3.5 h-3.5 text-emerald-400' />
										)}
										<span className='hidden sm:inline'>
											{remoteMuted ? "Muted" : "Unmuted"}
										</span>
									</div>
								);
							})()}
						</div>
						{/* External Controls Bar - now directly below video */}
						<div className='mt-3'>
							<div className='w-full flex items-center gap-2 rounded-lg bg-[#0b0c0d] border border-[#25282c] px-3 py-2 shadow-sm overflow-x-auto'>
								<button
									onClick={toggleMic}
									className={`px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 whitespace-nowrap ${
										micOn
											? "bg-[#00ef68] text-[#0b0c0d] hover:brightness-95"
											: "bg-[#25282c] text-white hover:bg-[#2e3237]"
									} sm:min-w-[96px]`}
								>
									{micOn ? (
										<Mic className='w-4 h-4' />
									) : (
										<MicOff className='w-4 h-4' />
									)}
									<span className='hidden sm:inline'>
										{micOn ? "Mute" : "Unmute"}
									</span>
								</button>
								<button
									onClick={toggleCam}
									className={`px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 whitespace-nowrap ${
										camOn
											? "bg-[#00ef68] text-[#0b0c0d] hover:brightness-95"
											: "bg-[#25282c] text-white hover:bg-[#2e3237]"
									} sm:min-w-[112px]`}
								>
									{camOn ? (
										<Video className='w-4 h-4' />
									) : (
										<VideoOff className='w-4 h-4' />
									)}
									<span className='hidden sm:inline'>
										{camOn ? "Camera Off" : "Camera On"}
									</span>
								</button>
								<button
									onClick={startScreenShare}
									className={`px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 whitespace-nowrap ${
										sharing
											? "bg-[#00ef68] text-[#0b0c0d] hover:brightness-95"
											: "bg-[#25282c] text-white hover:bg-[#2e3237]"
									} sm:min-w-[120px]`}
								>
									<MonitorUp className='w-4 h-4' />
									<span className='hidden sm:inline'>
										{sharing ? "Stop Share" : "Share Screen"}
									</span>
								</button>
								{!micOn &&
									moderatedSpeaking &&
									speakStatus !== "requesting" && (
										<button
											onClick={requestToSpeak}
											className='px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 bg-[#25282c] hover:bg-[#2e3237] text-white sm:min-w-[136px]'
										>
											Request to Speak
										</button>
									)}
								{moderatedSpeaking && speakStatus === "requesting" && (
									<span className='px-2 py-1.5 h-9 inline-flex items-center rounded-md bg-[#25282c] text-gray-300 text-sm'>
										Requested…
									</span>
								)}
								<button
									onMouseDown={pttDown}
									onMouseUp={pttUp}
									onMouseLeave={pttUp}
									onTouchStart={pttDown}
									onTouchEnd={pttUp}
									onKeyDown={(e) => {
										if (e.code === "Space") {
											e.preventDefault();
											pttDown();
										}
									}}
									onKeyUp={(e) => {
										if (e.code === "Space") {
											e.preventDefault();
											pttUp();
										}
									}}
									aria-label='Push to talk'
									className='px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 bg-[#25282c] hover:bg-[#2e3237] text-white sm:min-w-[80px]'
									title='Hold to talk'
								>
									PTT
								</button>
								<button
									onClick={leaveRoom}
									className='px-2 py-1.5 h-9 rounded-md inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white sm:min-w-[96px]'
								>
									<PhoneOff className='w-4 h-4' />{" "}
									<span className='hidden sm:inline'>Leave</span>
								</button>
								<div className='hidden md:flex items-center gap-2 pl-2 ml-2 border-l border-[#25282c]'>
									<button
										onClick={toggleFullscreen}
										className='px-2 py-2 rounded-md bg-[#25282c] hover:bg-[#2e3237] text-white'
										title={
											isFullscreen ? "Exit Fullscreen" : "Fullscreen"
										}
									>
										{isFullscreen ? (
											<Minimize2 className='w-4 h-4' />
										) : (
											<Maximize2 className='w-4 h-4' />
										)}
									</button>
									<button
										ref={settingsBtnRef}
										onClick={() => setDevicesPanelOpen((v) => !v)}
										className='px-2 py-2 rounded-md bg-[#25282c] hover:bg-[#2e3237] text-white'
										title='Devices & Audio'
									>
										<Settings className='w-4 h-4' />
									</button>
								</div>
							</div>
						</div>
						{devicesPanelOpen && (
							<div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
								{/* Backdrop with blur */}
								<div
									className='absolute inset-0 bg-black/60 backdrop-blur-sm'
									onClick={() => {
										setDevicesPanelOpen(false);
										setTimeout(
											() => settingsBtnRef.current?.focus(),
											0
										);
									}}
								/>
								{/* Modal */}
								<div
									role='dialog'
									aria-modal='true'
									aria-labelledby='devices-audio-title'
									className='relative w-full max-w-lg md:max-w-xl bg-[#0b0c0d] border border-[#25282c] rounded-2xl shadow-2xl p-4 md:p-5 max-h-[80vh] overflow-y-auto'
									onClick={(e) => e.stopPropagation()}
									ref={devicesModalRef}
								>
									<div className='flex items-start justify-between gap-4'>
										<div
											id='devices-audio-title'
											className='text-white text-base font-semibold'
										>
											Devices & Audio
										</div>
										<button
											onClick={() => {
												setDevicesPanelOpen(false);
												setTimeout(
													() => settingsBtnRef.current?.focus(),
													0
												);
											}}
											className='px-2 py-1 rounded-md bg-[#25282c] hover:bg-[#2e3237] text-white text-sm'
											aria-label='Close'
										>
											Close
										</button>
									</div>
									<div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
										<select
											value={selectedAudio}
											onChange={(e) =>
												setSelectedAudio(e.target.value)
											}
											className='bg-black/40 border border-gray-800 rounded px-2 py-2 text-sm text-gray-200'
										>
											<option value=''>Default Microphone</option>
											{devices.audioIn.map((d) => (
												<option key={d.deviceId} value={d.deviceId}>
													{d.label || d.deviceId}
												</option>
											))}
										</select>
										<select
											value={selectedVideo}
											onChange={(e) =>
												setSelectedVideo(e.target.value)
											}
											className='bg-black/40 border border-gray-800 rounded px-2 py-2 text-sm text-gray-200'
										>
											<option value=''>Default Camera</option>
											{devices.videoIn.map((d) => (
												<option key={d.deviceId} value={d.deviceId}>
													{d.label || d.deviceId}
												</option>
											))}
										</select>
										<div className='md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-2'>
											<button
												onClick={applyDevices}
												disabled={applyingDevices}
												aria-busy={applyingDevices}
												className='px-3 py-2 h-10 min-w-[96px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded text-sm inline-flex items-center justify-center gap-2'
											>
												{applyingDevices && (
													<svg
														className='animate-spin h-4 w-4 text-white'
														xmlns='http://www.w3.org/2000/svg'
														fill='none'
														viewBox='0 0 24 24'
													>
														<circle
															className='opacity-25'
															cx='12'
															cy='12'
															r='10'
															stroke='currentColor'
															strokeWidth='4'
														></circle>
														<path
															className='opacity-75'
															fill='currentColor'
															d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
														></path>
													</svg>
												)}
												Apply
											</button>
											<button
												onClick={() => {
													try {
														localStorage.setItem(
															LS_SETUP_SEEN,
															"1"
														);
													} catch {}
													setDevicesPanelOpen(false);
												}}
												className='px-3 py-2 h-10 min-w-[96px] bg-gray-800 hover:bg-gray-700 text-white/80 rounded text-sm'
											>
												Close
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					{!immersive && (
						<div className='xl:col-span-2 self-start grid grid-rows-[auto_auto_1fr_auto] gap-3 min-h-0'>
							<div className='bg-gray-900 rounded-xl border border-gray-800 p-3'>
								<video
									ref={localVideoRef}
									className='w-full rounded-lg bg-black aspect-video opacity-90'
									autoPlay
									playsInline
									muted
								/>
								<div className='text-gray-400 text-xs mt-2 flex items-center gap-1'>
									You{" "}
									{micOn ? (
										<Mic className='w-3.5 h-3.5 text-emerald-400' />
									) : (
										<MicOff className='w-3.5 h-3.5 text-red-400' />
									)}
								</div>
							</div>
							<div className='bg-gray-900 rounded-xl border border-gray-800 p-3'>
								<div className='flex items-center gap-2 text-white text-sm font-semibold mb-2'>
									<Users className='w-4 h-4' /> Participants
								</div>
								<ul className='text-sm text-gray-300 space-y-1 max-h-24 overflow-auto'>
									{participants.length === 0 && (
										<li className='text-gray-500'>
											No one else connected yet
										</li>
									)}
									{participants.map((p) => (
										<li
											key={p.id}
											className='truncate flex items-center gap-1'
										>
											<span className='truncate'>{p.name}</span>
											{peerAudio[p.id] !== undefined &&
												(peerAudio[p.id] ? (
													<MicOff className='w-3.5 h-3.5 text-red-400 shrink-0' />
												) : (
													<Mic className='w-3.5 h-3.5 text-emerald-400 shrink-0' />
												))}
										</li>
									))}
								</ul>
								{/* Incoming speak requests */}
								{incomingRequests.length > 0 && (
									<div className='mt-3 border-t border-gray-800 pt-2'>
										<div className='text-white text-sm font-semibold mb-2'>
											Speak Requests
										</div>
										<ul className='space-y-2'>
											{incomingRequests.map((r) => (
												<li
													key={r.from}
													className='flex items-center justify-between text-sm text-gray-200'
												>
													<span className='truncate mr-2'>
														{r.name || r.from}
													</span>
													<div className='flex items-center gap-2'>
														<button
															onClick={() =>
																grantRequest(r.from)
															}
															className='px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
														>
															Allow
														</button>
														<button
															onClick={() => denyRequest(r.from)}
															className='px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs'
														>
															Deny
														</button>
													</div>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
							<div className='bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col min-h-0'>
								<div className='flex items-center justify-between mb-2'>
									<div className='text-white text-sm font-semibold'>
										Chat
									</div>
									<button
										onClick={() => setChatOpen((v) => !v)}
										className={`relative px-2 py-1 rounded text-xs border ${
											chatOpen
												? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
												: "bg-[#00ef68] text-[#0b0c0d] border-transparent hover:brightness-95"
										}`}
									>
										{chatOpen ? "Hide" : "Chat"}
										{!chatOpen && unreadCount > 0 && (
											<span className='absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center shadow'>
												{unreadCount > 99 ? "99+" : unreadCount}
											</span>
										)}
									</button>
								</div>
								{chatOpen && (
									<div
										ref={chatListRef}
										className='h-64 md:h-80 overflow-y-auto space-y-3 pr-1'
									>
										{chat.map((m, i) => {
											const mine = m.from === "me";
											return (
												<div
													key={i}
													className={`flex ${
														mine ? "justify-end" : "justify-start"
													} min-w-0`}
												>
													<div
														className={`max-w-[80%] rounded-2xl px-3 py-2 border text-sm shadow-sm min-w-0 ${
															mine
																? "bg-[#0f1a13] border-[#00ef68]/30 text-emerald-200"
																: "bg-[#111214] border-[#25282c] text-gray-200"
														}`}
													>
														<div className='flex items-center gap-2 mb-1'>
															<span
																className={`text-xs font-medium ${
																	mine
																		? "text-emerald-300"
																		: "text-gray-300"
																}`}
															>
																{displayName(m.from)}
															</span>
															<span className='text-[10px] text-gray-500'>
																{formatTime(m.t)}
															</span>
														</div>
														<div className='whitespace-pre-wrap break-words break-all overflow-x-hidden'>
															{m.text}
														</div>
													</div>
												</div>
											);
										})}
										{chat.length === 0 && (
											<div className='text-gray-500 text-sm text-center'>
												No messages yet
											</div>
										)}
									</div>
								)}
								<div
									className={`mt-2 flex items-center gap-2 min-w-0 ${
										!chatOpen ? "hidden" : ""
									}`}
								>
									<div className='flex-1 flex items-center gap-2 bg-black/40 border border-gray-800 rounded-md px-3 h-10 max-h-10 min-h-10 min-w-0'>
										<input
											value={chatInput}
											onChange={(e) => setChatInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													sendChat();
												}
											}}
											className='flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-500 min-w-0'
											placeholder='Message'
										/>
									</div>
									<button
										onClick={sendChat}
										className='h-10 px-3 rounded-md bg-[#00ef68] text-[#0b0c0d] hover:brightness-95 flex items-center justify-center shadow'
										title='Send'
									>
										<Send className='w-4 h-4' />
									</button>
								</div>
							</div>
							{/* Devices card moved into overlay below the control buttons */}
						</div>
					)}
				</div>

				{/* Controls moved inside the video frame overlay above */}

				{!connected && (
					<div className='mt-4 text-center text-gray-400 text-sm'>
						Connecting to signaling server…
					</div>
				)}
			</div>
		</div>
	);
};

export default SessionRoom;
