import { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setIO(io: Server) {
  ioInstance = io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.io instance not initialized. Call setIO(io) in index.ts after creating the server.");
  }
  return ioInstance;
}
