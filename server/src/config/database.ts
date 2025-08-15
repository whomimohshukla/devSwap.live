import mongoose from "mongoose";

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devswap";

export async function dataBaseConnect(): Promise<void> {
	try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(MONGODB_URI);
		console.log("MongoDB connected:", MONGODB_URI);
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
}
