"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
class SignalingController {
    constructor(io) {
        this.connectedUsers = new Map(); // userId -> socketId
        this.sessionRooms = new Map(); // sessionId -> Set<socketId>
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use(this.authenticateSocket.bind(this));
        this.io.on("connection", this.handleConnection.bind(this));
    }
    async authenticateSocket(socket, next) {
        try {
            const rawToken = socket.handshake.auth.token;
            const token = rawToken ? rawToken.replace(/^Bearer\s+/i, "") : "";
            if (!token) {
                return next(new Error("Authentication required"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await user_model_1.default.findById(decoded.id);
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.userId = user._id.toString();
            next();
        }
        catch (error) {
            next(new Error("Authentication failed"));
        }
    }
    handleConnection(socket) {
        console.log(`User ${socket.userId} connected`);
        if (socket.userId) {
            this.connectedUsers.set(socket.userId, socket.id);
            // Join personal room for targeted user events
            socket.join(socket.userId);
            // Update user online status
            user_model_1.default.findByIdAndUpdate(socket.userId, {
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
    async handleJoinSession(socket, data) {
        try {
            const { sessionId } = data;
            const userId = socket.userId;
            // Verify user is part of this session
            const session = await session_model_1.default.findById(sessionId);
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
            this.sessionRooms.get(sessionId).add(socket.id);
            // Notify other participants
            socket.to(sessionId).emit("user-joined", {
                userId,
                timestamp: new Date()
            });
            socket.emit("session-joined", {
                sessionId,
                participants: Array.from(this.sessionRooms.get(sessionId)).length
            });
        }
        catch (error) {
            console.error("Join session error:", error);
            socket.emit("error", { message: "Failed to join session" });
        }
    }
    handleLeaveSession(socket, data) {
        const { sessionId } = data;
        const userId = socket.userId;
        socket.leave(sessionId);
        if (this.sessionRooms.has(sessionId)) {
            this.sessionRooms.get(sessionId).delete(socket.id);
            if (this.sessionRooms.get(sessionId).size === 0) {
                this.sessionRooms.delete(sessionId);
            }
        }
        socket.to(sessionId).emit("user-left", {
            userId,
            timestamp: new Date()
        });
    }
    handleWebRTCOffer(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-offer", {
            offer: data.offer,
            from: socket.userId
        });
    }
    handleWebRTCAnswer(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-answer", {
            answer: data.answer,
            from: socket.userId
        });
    }
    handleICECandidate(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-ice-candidate", {
            candidate: data.candidate,
            from: socket.userId
        });
    }
    handleCodeChange(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("code-change", {
            code: data.code,
            language: data.language,
            from: socket.userId,
            timestamp: new Date()
        });
    }
    handleCursorPosition(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("cursor-position", {
            position: data.position,
            from: socket.userId
        });
    }
    handleChatMessage(socket, data) {
        if (!socket.sessionId)
            return;
        const message = {
            text: data.text,
            from: socket.userId,
            timestamp: new Date()
        };
        this.io.to(socket.sessionId).emit("chat-message", message);
    }
    handleSessionStatus(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("session-status", {
            status: data.status,
            from: socket.userId,
            timestamp: new Date()
        });
    }
    async handleDisconnect(socket) {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
            this.connectedUsers.delete(socket.userId);
            // Update user offline status
            await user_model_1.default.findByIdAndUpdate(socket.userId, {
                isOnline: false,
                lastSeen: new Date()
            });
            // Clean up session rooms
            if (socket.sessionId && this.sessionRooms.has(socket.sessionId)) {
                this.sessionRooms.get(socket.sessionId).delete(socket.id);
                // Notify other participants
                socket.to(socket.sessionId).emit("user-left", {
                    userId: socket.userId,
                    timestamp: new Date()
                });
            }
        }
    }
    // Public methods for external use
    notifyUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }
    notifySession(sessionId, event, data) {
        this.io.to(sessionId).emit(event, data);
    }
}
exports.SignalingController = SignalingController;
