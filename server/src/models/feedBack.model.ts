import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
	sessionId: Types.ObjectId;
	fromUser: Types.ObjectId;
	toUser: Types.ObjectId;
	rating: number;
	comment?: string;
}

// Schema definition

const feedbackSchema = new Schema<IFeedback>(
	{
		sessionId: {
			type: Schema.Types.ObjectId,
			ref: "Session",
			required: true,
			index: true,
		},
		fromUser: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		toUser: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		rating: { type: Number, min: 1, max: 5, required: true, index: true },
		comment: String,
	},
	{ timestamps: true }
);

export const Feedback = model<IFeedback>("Feedback", feedbackSchema);
