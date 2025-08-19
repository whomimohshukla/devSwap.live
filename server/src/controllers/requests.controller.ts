import { Request, Response } from "express";
import RequestModel from "../models/request.model";
import User from "../models/user.model";
import { getIO } from "../lib/socket";

// Helper to get userId from auth middleware
function getUserId(req: Request): string | null {
  const user = (req as any).user as { id: string } | undefined;
  return user?.id || null;
}

export const RequestsController = {
  // List incoming requests for the authenticated user
  async getIncoming(req: Request, res: Response) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    try {
      const items = await RequestModel.find({ toUser: userId })
        .sort({ createdAt: -1 })
        .populate("fromUser", "name avatar bio")
        .lean();
      return res.json({ data: items });
    } catch (err) {
      console.error("getIncoming error", err);
      return res.status(500).json({ message: "Failed to fetch incoming requests" });
    }
  },

  // List sent requests by the authenticated user
  async getSent(req: Request, res: Response) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    try {
      const items = await RequestModel.find({ fromUser: userId })
        .sort({ createdAt: -1 })
        .populate("toUser", "name avatar bio")
        .lean();
      return res.json({ data: items });
    } catch (err) {
      console.error("getSent error", err);
      return res.status(500).json({ message: "Failed to fetch sent requests" });
    }
  },

  // Create a new request to another user
  async create(req: Request, res: Response) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const { toUserId, message } = req.body as { toUserId?: string; message?: string };
    if (!toUserId) return res.status(400).json({ message: "toUserId is required" });
    if (toUserId === userId) return res.status(400).json({ message: "Cannot send a request to yourself" });

    try {
      const exists = await User.findById(toUserId).select("_id").lean();
      if (!exists) return res.status(404).json({ message: "Recipient user not found" });

      // Prevent duplicate pending requests between the same users (either direction)
      const duplicate = await RequestModel.findOne({
        $or: [
          { fromUser: userId, toUser: toUserId, status: "pending" },
          { fromUser: toUserId, toUser: userId, status: "pending" },
        ],
      }).lean();
      if (duplicate) return res.status(409).json({ message: "A pending request already exists between these users" });

      const created = await RequestModel.create({ fromUser: userId as any, toUser: toUserId as any, message, status: "pending" });
      const populated = await RequestModel.findById(created._id)
        .populate("fromUser", "name avatar bio")
        .populate("toUser", "name avatar bio");

      // Emit to recipient (incoming) and sender (sent)
      try {
        getIO().to(String(toUserId)).emit("request:created", { request: populated });
        getIO().to(String(userId)).emit("request:sent", { request: populated });
      } catch (e) {
        console.warn("[socket] emit request:created/sent failed", e);
      }

      return res.status(201).json({ data: populated });
    } catch (err) {
      console.error("create request error", err);
      return res.status(500).json({ message: "Failed to create request" });
    }
  },

  // Accept an incoming request (only the recipient can accept)
  async accept(req: Request, res: Response) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const { id } = req.params;
    try {
      const doc = await RequestModel.findById(id);
      if (!doc) return res.status(404).json({ message: "Request not found" });
      if (String(doc.toUser) !== String(userId)) return res.status(403).json({ message: "Not authorized to accept this request" });
      if (doc.status !== "pending") return res.status(400).json({ message: "Only pending requests can be accepted" });

      doc.status = "accepted";
      await doc.save();
      const populated = await RequestModel.findById(doc._id)
        .populate("fromUser", "name avatar bio")
        .populate("toUser", "name avatar bio");
      try {
        // Notify both parties
        getIO().to(String(doc.fromUser)).emit("request:accepted", { request: populated });
        getIO().to(String(doc.toUser)).emit("request:accepted", { request: populated });
      } catch (e) {
        console.warn("[socket] emit request:accepted failed", e);
      }
      return res.json({ data: populated });
    } catch (err) {
      console.error("accept request error", err);
      return res.status(500).json({ message: "Failed to accept request" });
    }
  },

  // Decline an incoming request (only the recipient can decline)
  async decline(req: Request, res: Response) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const { id } = req.params;
    try {
      const doc = await RequestModel.findById(id);
      if (!doc) return res.status(404).json({ message: "Request not found" });
      if (String(doc.toUser) !== String(userId)) return res.status(403).json({ message: "Not authorized to decline this request" });
      if (doc.status !== "pending") return res.status(400).json({ message: "Only pending requests can be declined" });

      doc.status = "declined";
      await doc.save();
      const populated = await RequestModel.findById(doc._id)
        .populate("fromUser", "name avatar bio")
        .populate("toUser", "name avatar bio");
      try {
        // Notify both parties
        getIO().to(String(doc.fromUser)).emit("request:declined", { request: populated });
        getIO().to(String(doc.toUser)).emit("request:declined", { request: populated });
      } catch (e) {
        console.warn("[socket] emit request:declined failed", e);
      }
      return res.json({ data: populated });
    } catch (err) {
      console.error("decline request error", err);
      return res.status(500).json({ message: "Failed to decline request" });
    }
  },
};
