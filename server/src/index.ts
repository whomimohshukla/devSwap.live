import express from "express";
import dotenv from "dotenv";

const PORT = process.env.PORT || 8000;

dotenv.config();

const app = express();

app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});
