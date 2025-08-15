"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
const mongoose_1 = require("mongoose");
const feedbackSchema = new mongoose_1.Schema({
    sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
        index: true,
    },
    fromUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    toUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true, index: true },
    comment: String,
}, { timestamps: true });
exports.Feedback = (0, mongoose_1.model)("Feedback", feedbackSchema);
