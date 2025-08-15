"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBaseConnect = dataBaseConnect;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoURL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devswap";
async function dataBaseConnect() {
    try {
        mongoose_1.default.set("strictQuery", true);
        await mongoose_1.default.connect(mongoURL);
        console.log("MongoDB connected:", mongoURL);
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
