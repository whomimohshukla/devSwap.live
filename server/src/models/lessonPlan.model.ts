// src/models/lessonPlan.model.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILessonPlan {
	sessionId: mongoose.Types.ObjectId;
	teacherSkill: string;
	learnerSkill: string;
	teacherLevel: string;
	learnerLevel: string;
	content: {
		title: string;
		objectives: string[];
		activities: {
			type: 'explanation' | 'practice' | 'demo' | 'discussion';
			description: string;
			duration: number; // minutes
			resources?: string[];
		}[];
		assessments: string[];
		nextSteps: string[];
	};
	aiModel: string; // e.g., "gpt-4", "gpt-3.5-turbo"
	generatedAt: Date;
	cached: boolean;
}

export interface ILessonPlanDocument extends ILessonPlan, Document {}

const LessonPlanSchema = new Schema<ILessonPlanDocument>({
	sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true, index: true },
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

export const LessonPlan: Model<ILessonPlanDocument> = 
	mongoose.model<ILessonPlanDocument>("LessonPlan", LessonPlanSchema);

export default LessonPlan;
