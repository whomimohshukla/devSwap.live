import mongoose, { Schema, Document, Model } from "mongoose";

export type RequestStatus = "pending" | "accepted" | "declined";

export interface IRequest {
	fromUser: mongoose.Types.ObjectId;
	toUser: mongoose.Types.ObjectId;
	message?: string;
	status: RequestStatus;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IRequestDocument extends IRequest, Document {}

export interface IRequestModel extends Model<IRequestDocument> {}

const RequestSchema = new Schema<IRequestDocument>(
	{
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
		message: { type: String },
		status: {
			type: String,
			enum: ["pending", "accepted", "declined"],
			default: "pending",
			index: true,
		},
	},
	{ timestamps: true }
);

RequestSchema.index({ fromUser: 1, toUser: 1, status: 1 });

export const RequestModel = mongoose.model<IRequestDocument, IRequestModel>(
	"Request",
	RequestSchema
);

export default RequestModel;
