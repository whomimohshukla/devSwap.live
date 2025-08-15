import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
	userId: Types.ObjectId;
	type: string;
	message: string;
	read: boolean;
}

const notificationSchema = new Schema<INotification>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: { type: String, required: true },
		message: { type: String, required: true },
		read: { type: Boolean, default: false, index: true },
	},
	{ timestamps: true }
);

export const Notification = model<INotification>(
	"Notification",
	notificationSchema
);
