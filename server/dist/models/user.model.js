"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// src/models/User.ts
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const SkillSchema = new mongoose_1.Schema({
    skillName: { type: String, required: true },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    avatar: String,
    bio: String,
    teachSkills: { type: [String], index: true }, // multikey index
    learnSkills: { type: [String], index: true }, // multikey index
    skillLevels: [SkillSchema],
    isOnline: { type: Boolean, default: false, index: true },
    location: String,
    lastSeen: Date,
    pastSessions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Session" }],
}, { timestamps: true });
// Plugins
UserSchema.plugin(mongoose_paginate_v2_1.default);
// Text index for searching by name/bio/skills
UserSchema.index({
    name: "text",
    bio: "text",
    teachSkills: "text",
    learnSkills: "text",
});
// Compound index for matching: find users who teach X and learn Y
UserSchema.index({ teachSkills: 1, learnSkills: 1 });
// Pre-save hook: hash password if modified
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
    next();
});
// Instance method: compare password
UserSchema.methods.comparePassword = function (candidate) {
    return bcrypt_1.default.compare(candidate, this.password);
};
// Instance method: safe profile
UserSchema.methods.safeProfile = function () {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        avatar: this.avatar,
        bio: this.bio,
        teachSkills: this.teachSkills,
        learnSkills: this.learnSkills,
        skillLevels: this.skillLevels,
        isOnline: this.isOnline,
        lastSeen: this.lastSeen,
    };
};
// Static helper: naive DB fallback matching (not Redis)
UserSchema.statics.findMatchFor = async function (userId) {
    const me = await this.findById(userId).lean();
    if (!me)
        return null;
    // Match: someone who teaches something I want to learn AND learns something I teach
    return this.findOne({
        _id: { $ne: me._id },
        teachSkills: { $in: me.learnSkills },
        learnSkills: { $in: me.teachSkills },
        isOnline: true, // prefer online
    })
        .sort({ lastSeen: -1 })
        .select("-password")
        .lean();
};
exports.User = mongoose_1.default.model("User", UserSchema);
exports.default = exports.User;
