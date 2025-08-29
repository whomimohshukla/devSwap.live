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
            // Prefer explicit auth token from handshake
            const rawAuthToken = socket.handshake.auth?.token || undefined;
            let token = rawAuthToken ? rawAuthToken.replace(/^Bearer\s+/i, "") : "";
            // Fallback to cookie named 'token' when no auth token provided
            if (!token) {
                const cookieHeader = socket.handshake.headers?.cookie;
                if (cookieHeader) {
                    const cookies = {};
                    cookieHeader.split(/;\s*/).forEach((pair) => {
                        const idx = pair.indexOf("=");
                        if (idx > -1) {
                            const k = decodeURIComponent(pair.slice(0, idx).trim());
                            const v = decodeURIComponent(pair.slice(idx + 1).trim());
                            cookies[k] = v;
                        }
                    });
                    if (cookies.token)
                        token = cookies.token;
                }
            }
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
        // Aliases to support frontend event names
        socket.on("join", this.handleJoinSession.bind(this, socket));
        socket.on("leave", this.handleLeaveSession.bind(this, socket));
        socket.on("offer", (data) => {
            if (!socket.sessionId)
                return;
            this.io.to(socket.sessionId).emit("offer", { sdp: data.sdp, from: socket.userId });
            // also emit legacy
            this.io.to(socket.sessionId).emit("webrtc-offer", { offer: data.sdp, from: socket.userId });
        });
        socket.on("answer", (data) => {
            if (!socket.sessionId)
                return;
            this.io.to(socket.sessionId).emit("answer", { sdp: data.sdp, from: socket.userId });
            // legacy
            this.io.to(socket.sessionId).emit("webrtc-answer", { answer: data.sdp, from: socket.userId });
        });
        socket.on("ice-candidate", (data) => {
            if (!socket.sessionId)
                return;
            this.io.to(socket.sessionId).emit("ice-candidate", { candidate: data.candidate, from: socket.userId });
            // legacy
            this.io.to(socket.sessionId).emit("webrtc-ice-candidate", { candidate: data.candidate, from: socket.userId });
        });
        // Code Editor Events
        socket.on("code-change", this.handleCodeChange.bind(this, socket));
        socket.on("cursor-position", this.handleCursorPosition.bind(this, socket));
        // Chat Events
        socket.on("chat-message", this.handleChatMessage.bind(this, socket));
        socket.on("chat:send", (data) => this.handleChatMessage(socket, { text: data.text, clientId: data?.clientId }));
        // Request-to-speak workflow (lightweight moderation for who has the mic)
        // speak:request -> broadcast to session so peer(s) can approve/deny
        socket.on("speak:request", (data = {}) => {
            if (!socket.sessionId)
                return;
            const payload = { from: socket.userId, to: data?.to };
            // notify peers in session
            socket.to(socket.sessionId).emit("speak:request", payload);
        });
        // speak:grant -> grant speaking to requester; clients can choose to auto-unmute requester locally
        socket.on("speak:grant", (data) => {
            if (!socket.sessionId)
                return;
            const payload = { from: socket.userId, to: data?.to };
            this.io.to(socket.sessionId).emit("speak:grant", payload);
        });
        // speak:deny -> inform requester their request was denied
        socket.on("speak:deny", (data) => {
            if (!socket.sessionId)
                return;
            const payload = { from: socket.userId, to: data?.to };
            this.io.to(socket.sessionId).emit("speak:deny", payload);
        });
        // speak:revoke -> revoke previously granted speaking permission
        socket.on("speak:revoke", (data = {}) => {
            if (!socket.sessionId)
                return;
            const payload = { from: socket.userId, to: data?.to };
            this.io.to(socket.sessionId).emit("speak:revoke", payload);
        });
        // Session Events
        socket.on("session-status", this.handleSessionStatus.bind(this, socket));
        socket.on("disconnect", this.handleDisconnect.bind(this, socket));
    }
    async broadcastParticipants(sessionId) {
        // derive userId list from sockets in room
        const room = this.io.sockets.adapter.rooms.get(sessionId);
        const ids = [];
        if (room) {
            for (const sid of room) {
                const s = this.io.sockets.sockets.get(sid);
                if (s?.userId)
                    ids.push(s.userId);
            }
        }
        // fetch names
        const uniqueIds = Array.from(new Set(ids));
        let enriched = [];
        if (uniqueIds.length) {
            try {
                const users = await user_model_1.default.find({ _id: { $in: uniqueIds } }).select('displayName username email');
                const nameOf = (u) => u.displayName || u.username || (u.email ? String(u.email).split('@')[0] : String(u._id));
                const map = new Map();
                for (const u of users)
                    map.set(String(u._id), nameOf(u));
                enriched = uniqueIds.map((id) => ({ id, name: map.get(id) || id }));
            }
            catch {
                enriched = uniqueIds.map((id) => ({ id, name: id }));
            }
        }
        this.io.to(sessionId).emit("participants", enriched);
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
            // Determine if new joiner should create offer (simple rule: second+ peer creates offer)
            const roomSize = this.io.sockets.adapter.rooms.get(sessionId)?.size || 1;
            socket.emit("joined", { shouldCreateOffer: roomSize >= 2 });
            socket.emit("session-joined", {
                sessionId,
                participants: Array.from(this.sessionRooms.get(sessionId)).length
            });
            // Broadcast participants list
            await this.broadcastParticipants(sessionId);
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
        // Frontend expects 'peer-left'
        socket.to(sessionId).emit("peer-left");
        // Update participants
        this.broadcastParticipants(sessionId);
    }
    handleWebRTCOffer(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-offer", {
            offer: data.offer,
            from: socket.userId
        });
        // simplified alias for frontend expecting 'offer' with sdp
        if (data?.offer) {
            socket.to(socket.sessionId).emit("offer", { sdp: data.offer, from: socket.userId });
        }
    }
    handleWebRTCAnswer(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-answer", {
            answer: data.answer,
            from: socket.userId
        });
        // simplified alias for frontend expecting 'answer' with sdp
        if (data?.answer) {
            socket.to(socket.sessionId).emit("answer", { sdp: data.answer, from: socket.userId });
        }
    }
    handleICECandidate(socket, data) {
        if (!socket.sessionId)
            return;
        socket.to(socket.sessionId).emit("webrtc-ice-candidate", {
            candidate: data.candidate,
            from: socket.userId
        });
        // simplified alias for frontend expecting 'ice-candidate'
        if (data?.candidate) {
            socket.to(socket.sessionId).emit("ice-candidate", { candidate: data.candidate, from: socket.userId });
        }
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
    async handleChatMessage(socket, data) {
        if (!socket.sessionId)
            return;
        const t = Date.now();
        let fromName;
        try {
            if (socket.userId) {
                const user = await user_model_1.default.findById(socket.userId).select('displayName username email');
                const base = user || {};
                fromName = base.displayName || base.username || (base.email ? String(base.email).split('@')[0] : undefined);
            }
        }
        catch { }
        const message = {
            text: data.text,
            from: socket.userId,
            fromName,
            t,
            clientId: data?.clientId,
        };
        this.io.to(socket.sessionId).emit("chat-message", message);
        this.io.to(socket.sessionId).emit("chat:message", message);
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
                socket.to(socket.sessionId).emit("peer-left");
                this.broadcastParticipants(socket.sessionId);
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
