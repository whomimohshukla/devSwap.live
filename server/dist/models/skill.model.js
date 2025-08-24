"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = void 0;
const mongoose_1 = require("mongoose");
const skill_data_1 = require("./skill.data");
const skillSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    difficulty: {
        type: String,
        enum: skill_data_1.SKILL_LEVELS,
        required: true,
    },
}, { timestamps: true });
exports.Skill = (0, mongoose_1.model)("Skill", skillSchema);
