"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRequestLog = void 0;
const mongoose_1 = require("mongoose");
const aiRequestLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: { type: String, required: true },
    payload: { type: mongoose_1.Schema.Types.Mixed },
    tokensUsed: { type: Number, default: 0 },
}, { timestamps: true });
// TTL: Keep logs for 30 days only
aiRequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
exports.AIRequestLog = (0, mongoose_1.model)("AIRequestLog", aiRequestLogSchema);
