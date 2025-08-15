"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)("Notification", notificationSchema);
