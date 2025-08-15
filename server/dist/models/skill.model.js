"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = void 0;
const mongoose_1 = require("mongoose");
const skillSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
}, { timestamps: true });
exports.Skill = (0, mongoose_1.model)("Skill", skillSchema);
