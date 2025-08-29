import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
	id: string;
	email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const fromCookie = (req as any).cookies?.token as string | undefined;
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
		return res
			.status(500)
			.json({ message: "Server misconfiguration: JWT secret missing" });
	}
	try {
		const decoded = jwt.verify(token, secret) as JwtPayload;
		(req as any).user = { id: decoded.id, email: decoded.email };
		return next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}
