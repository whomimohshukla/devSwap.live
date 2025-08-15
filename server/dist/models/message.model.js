"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });
// Shard key suggestion: { sessionId: 1, timestamp: 1 }
// Archive old messages to "messages_archive" after 30 days
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
