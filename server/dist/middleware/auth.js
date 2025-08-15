"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const fromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const fromHeader = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;
    const token = fromCookie || fromHeader;
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ message: "Server misconfiguration: JWT secret missing" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: decoded.id, email: decoded.email };
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
