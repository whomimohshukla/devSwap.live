import { Schema, model, Document } from "mongoose";

export interface ISkill extends Document {
	name: string;
	category: string;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const skillSchema = new Schema<ISkill>(
	{
		name: { type: String, required: true, unique: true, index: true },
		category: { type: String, required: true, index: true },
		difficulty: {
			type: String,
			enum: ["Beginner", "Intermediate", "Advanced"],
			required: true,
		},
	},
	{ timestamps: true }
);

export const Skill = model<ISkill>("Skill", skillSchema);
