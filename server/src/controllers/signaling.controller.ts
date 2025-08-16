// src/controllers/signaling.controller.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import Session from "../models/session.model";
import User from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedSocket extends Socket {
	userId?: string;
	sessionId?: string;
}

export class SignalingController {
	private io: Server;
	private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
	private sessionRooms: Map<string, Set<string>> = new Map(); // sessionId -> Set<socketId>

	constructor(io: Server) {
		this.io = io;
		this.setupSocketHandlers();
	}

	private setupSocketHandlers() {
		this.io.use(this.authenticateSocket.bind(this));
		this.io.on("connection", this.handleConnection.bind(this));
	}

	private async authenticateSocket(socket: AuthenticatedSocket, next: any) {
		try {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error("Authentication required"));
			}

			const decoded = jwt.verify(token, JWT_SECRET) as any;
			const user = await User.findById(decoded.id);
			
			if (!user) {
				return next(new Error("User not found"));
			}

			socket.userId = (user._id as any).toString();
			next();
		} catch (error) {
			next(new Error("Authentication failed"));
		}
	}

	private handleConnection(socket: AuthenticatedSocket) {
		console.log(`User ${socket.userId} connected`);
		
		if (socket.userId) {
			this.connectedUsers.set(socket.userId, socket.id);
			
			// Update user online status
			User.findByIdAndUpdate(socket.userId, {
				isOnline: true,
				lastSeen: new Date()
			}).exec();
		}

		// WebRTC Signaling Events
		socket.on("join-session", this.handleJoinSession.bind(this, socket));
		socket.on("leave-session", this.handleLeaveSession.bind(this, socket));
		socket.on("webrtc-offer", this.handleWebRTCOffer.bind(this, socket));
		socket.on("webrtc-answer", this.handleWebRTCAnswer.bind(this, socket));
		socket.on("webrtc-ice-candidate", this.handleICECandidate.bind(this, socket));
		
		// Code Editor Events
		socket.on("code-change", this.handleCodeChange.bind(this, socket));
		socket.on("cursor-position", this.handleCursorPosition.bind(this, socket));
		
		// Chat Events
		socket.on("chat-message", this.handleChatMessage.bind(this, socket));
		
		// Session Events
		socket.on("session-status", this.handleSessionStatus.bind(this, socket));

		socket.on("disconnect", this.handleDisconnect.bind(this, socket));
	}

	private async handleJoinSession(socket: AuthenticatedSocket, data: { sessionId: string }) {
		try {
			const { sessionId } = data;
			const userId = socket.userId!;

			// Verify user is part of this session
			const session = await Session.findById(sessionId);
			if (!session) {
				socket.emit("error", { message: "Session not found" });
				return;
			}

			const isParticipant = session.userA.toString() === userId || 
								 session.userB.toString() === userId;

			if (!isParticipant) {
				socket.emit("error", { message: "Access denied" });
				return;
			}

			// Join session room
			socket.join(sessionId);
			socket.sessionId = sessionId;

			// Track session participants
			if (!this.sessionRooms.has(sessionId)) {
				this.sessionRooms.set(sessionId, new Set());
			}
			this.sessionRooms.get(sessionId)!.add(socket.id);

			// Notify other participants
			socket.to(sessionId).emit("user-joined", {
				userId,
				timestamp: new Date()
			});

			socket.emit("session-joined", {
				sessionId,
				participants: Array.from(this.sessionRooms.get(sessionId)!).length
			});

		} catch (error) {
			console.error("Join session error:", error);
			socket.emit("error", { message: "Failed to join session" });
		}
	}

	private handleLeaveSession(socket: AuthenticatedSocket, data: { sessionId: string }) {
		const { sessionId } = data;
		const userId = socket.userId!;

		socket.leave(sessionId);
		
		if (this.sessionRooms.has(sessionId)) {
			this.sessionRooms.get(sessionId)!.delete(socket.id);
			if (this.sessionRooms.get(sessionId)!.size === 0) {
				this.sessionRooms.delete(sessionId);
			}
		}

		socket.to(sessionId).emit("user-left", {
			userId,
			timestamp: new Date()
		});
	}

	private handleWebRTCOffer(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("webrtc-offer", {
			offer: data.offer,
			from: socket.userId
		});
	}

	private handleWebRTCAnswer(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("webrtc-answer", {
			answer: data.answer,
			from: socket.userId
		});
	}

	private handleICECandidate(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("webrtc-ice-candidate", {
			candidate: data.candidate,
			from: socket.userId
		});
	}

	private handleCodeChange(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("code-change", {
			code: data.code,
			language: data.language,
			from: socket.userId,
			timestamp: new Date()
		});
	}

	private handleCursorPosition(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("cursor-position", {
			position: data.position,
			from: socket.userId
		});
	}

	private handleChatMessage(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		const message = {
			text: data.text,
			from: socket.userId,
			timestamp: new Date()
		};

		this.io.to(socket.sessionId).emit("chat-message", message);
	}

	private handleSessionStatus(socket: AuthenticatedSocket, data: any) {
		if (!socket.sessionId) return;
		
		socket.to(socket.sessionId).emit("session-status", {
			status: data.status,
			from: socket.userId,
			timestamp: new Date()
		});
	}

	private async handleDisconnect(socket: AuthenticatedSocket) {
		console.log(`User ${socket.userId} disconnected`);
		
		if (socket.userId) {
			this.connectedUsers.delete(socket.userId);
			
			// Update user offline status
			await User.findByIdAndUpdate(socket.userId, {
				isOnline: false,
				lastSeen: new Date()
			});

			// Clean up session rooms
			if (socket.sessionId && this.sessionRooms.has(socket.sessionId)) {
				this.sessionRooms.get(socket.sessionId)!.delete(socket.id);
				
				// Notify other participants
				socket.to(socket.sessionId).emit("user-left", {
					userId: socket.userId,
					timestamp: new Date()
				});
			}
		}
	}

	// Public methods for external use
	public notifyUser(userId: string, event: string, data: any) {
		const socketId = this.connectedUsers.get(userId);
		if (socketId) {
			this.io.to(socketId).emit(event, data);
		}
	}

	public notifySession(sessionId: string, event: string, data: any) {
		this.io.to(sessionId).emit(event, data);
	}
}
