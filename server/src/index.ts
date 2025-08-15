import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { dataBaseConnect } from "./config/database";
import { generalLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import matchRoutes from "./routes/match.routes";

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

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
