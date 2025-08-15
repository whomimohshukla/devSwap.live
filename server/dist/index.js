"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Apply general rate limit to all requests
app.use(rateLimiter_1.generalLimiter);
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
//data base connection
(0, database_1.dataBaseConnect)();
const PORT = process.env.PORT;
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// API routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/match", match_routes_1.default);
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
