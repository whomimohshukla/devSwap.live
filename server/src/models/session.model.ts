// src/models/session.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISession {
	userA: mongoose.Types.ObjectId;
	userB: mongoose.Types.ObjectId;
	skillFromA: string;
	skillFromB: string;
	isActive: boolean;
	startedAt: Date;
	endedAt?: Date;
}

export interface ISessionDocument extends ISession, Document {}

const SessionSchema = new Schema<ISessionDocument>({
	userA: { type: Schema.Types.ObjectId, ref: "User", required: true },
	userB: { type: Schema.Types.ObjectId, ref: "User", required: true },
	skillFromA: { type: String, required: true },
	skillFromB: { type: String, required: true },
	isActive: { type: Boolean, default: true, index: true },
	startedAt: { type: Date, default: Date.now },
	endedAt: { type: Date },
});

// Index for recent active sessions
SessionSchema.index({ isActive: 1, startedAt: -1 });

export const Session: Model<ISessionDocument> =
	mongoose.model<ISessionDocument>("Session", SessionSchema);

export default Session;
