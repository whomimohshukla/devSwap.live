import { Schema, model, Document, Types } from "mongoose";

export interface IAIRequestLog extends Document {
	userId: Types.ObjectId;
	type: string;
	payload: Record<string, any>;
	tokensUsed: number;
}

// Schema definition
const aiRequestLogSchema = new Schema<IAIRequestLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: { type: String, required: true },
		payload: { type: Schema.Types.Mixed },
		tokensUsed: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

// TTL: Keep logs for 30 days only
aiRequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const AIRequestLog = model<IAIRequestLog>(
	"AIRequestLog",
	aiRequestLogSchema
);
