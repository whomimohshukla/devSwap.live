import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { dataBaseConnect } from "./config/database";
import { generalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

// Apply general rate limit to all requests
app.use(generalLimiter);
app.use(morgan("dev"));
app.use(express.json());

//data base connection
dataBaseConnect();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});
