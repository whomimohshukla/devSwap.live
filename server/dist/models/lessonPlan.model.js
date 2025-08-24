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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonPlan = void 0;
// src/models/lessonPlan.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const LessonPlanSchema = new mongoose_1.Schema({
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    teacherSkill: { type: String, required: true, index: true },
    learnerSkill: { type: String, required: true, index: true },
    teacherLevel: { type: String, required: true },
    learnerLevel: { type: String, required: true },
    content: {
        title: { type: String, required: true },
        objectives: [{ type: String, required: true }],
        activities: [{
                type: {
                    type: String,
                    enum: ['explanation', 'practice', 'demo', 'discussion'],
                    required: true
                },
                description: { type: String, required: true },
                duration: { type: Number, required: true },
                resources: [String]
            }],
        assessments: [String],
        nextSteps: [String]
    },
    aiModel: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    cached: { type: Boolean, default: false, index: true }
});
// Compound index for caching similar lesson plans
LessonPlanSchema.index({
    teacherSkill: 1,
    learnerSkill: 1,
    teacherLevel: 1,
    learnerLevel: 1
});
exports.LessonPlan = mongoose_1.default.model("LessonPlan", LessonPlanSchema);
exports.default = exports.LessonPlan;
