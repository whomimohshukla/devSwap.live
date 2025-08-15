import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURL: string =
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devswap";

export async function dataBaseConnect(): Promise<void> {
	try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(mongoURL);
		console.log("MongoDB connected:", mongoURL);
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
}
