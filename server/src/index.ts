import express from "express";
import dotenv from "dotenv";
import { dataBaseConnect } from "./config/database";
import { generalLimiter } from "./middleware/rateLimiter";

const PORT = process.env.PORT || 8000;

dotenv.config();

const app = express();

// Apply general rate limit to all requests
app.use(generalLimiter);

//data base connection
dataBaseConnect();

app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});
