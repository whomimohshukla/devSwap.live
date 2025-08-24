"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = setIO;
exports.getIO = getIO;
let ioInstance = null;
function setIO(io) {
    ioInstance = io;
}
function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.io instance not initialized. Call setIO(io) in index.ts after creating the server.");
    }
    return ioInstance;
}
