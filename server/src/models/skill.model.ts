import { Schema, model, Document } from "mongoose";
import { SKILL_LEVELS, SkillLevel } from "./skill.data";

export interface ISkill extends Document {
	name: string;
	category: string;
	difficulty: SkillLevel;
}

const skillSchema = new Schema<ISkill>(
	{
		name: { type: String, required: true, unique: true, index: true },
		category: { type: String, required: true, index: true },
		difficulty: {
			type: String,
			enum: SKILL_LEVELS,
			required: true,
		},
	},
	{ timestamps: true }
);

export const Skill = model<ISkill>("Skill", skillSchema);
