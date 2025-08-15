import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
	sessionId: Types.ObjectId;
	senderId: Types.ObjectId;
	content: string;
	timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
	{
		sessionId: {
			type: Schema.Types.ObjectId,
			ref: "Session",
			required: true,
			index: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		content: { type: String, required: true },
		timestamp: { type: Date, default: Date.now, index: true },
	},
	{ timestamps: true }
);

// Shard key suggestion: { sessionId: 1, timestamp: 1 }
// Archive old messages to "messages_archive" after 30 days

export const Message = model<IMessage>("Message", messageSchema);
