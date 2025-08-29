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
		transports: ["websocket"],
		withCredentials: true,
		auth: token ? { token: `Bearer ${token}` } : undefined,
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
	return socket;
}
