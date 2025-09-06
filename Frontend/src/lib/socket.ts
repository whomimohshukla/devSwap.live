import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket: Socket | null = null;

function getBaseUrl() {
	// API_BASE_URL ends with /api; remove it for socket base
	return API_BASE_URL.replace(/\/?api$/, "");
}

export function getSocket(): Socket {
	// Reuse existing instance even if not yet connected to avoid duplicates
	if (socket) return socket;
	const token = localStorage.getItem("authToken");
	socket = io(getBaseUrl(), {
		// Allow polling fallback to avoid intermittent upgrade failures in dev/proxy setups
		transports: ["websocket", "polling"],
		withCredentials: true,
		auth: token ? { token: `Bearer ${token}` } : undefined,
		// Reconnection strategy
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 500,
		reconnectionDelayMax: 5000,
		timeout: 10000,
	});
	// Debug listeners to surface CORS/auth issues
	socket.on("connect", () => {
		// eslint-disable-next-line no-console
		console.log("[socket] connected", { id: socket?.id, url: getBaseUrl() });
	});
	socket.on("connect_error", (err) => {
		// eslint-disable-next-line no-console
		console.error("[socket] connect_error", err?.message || err);
	});
	socket.io.on("reconnect_attempt", (attempt) => {
		// eslint-disable-next-line no-console
		console.warn("[socket] reconnect_attempt", { attempt });
	});
	socket.io.on("reconnect", (attempt) => {
		// eslint-disable-next-line no-console
		console.log("[socket] reconnected", { attempt });
	});
	socket.io.on("reconnect_error", (err) => {
		// eslint-disable-next-line no-console
		console.error("[socket] reconnect_error", err?.message || err);
	});
	socket.on("disconnect", (reason) => {
		// eslint-disable-next-line no-console
		console.warn("[socket] disconnected", { reason });
	});
	return socket;
}
