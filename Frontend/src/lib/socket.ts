import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket: Socket | null = null;

function getBaseUrl() {
  // API_BASE_URL ends with /api; remove it for socket base
  return API_BASE_URL.replace(/\/?api$/, '');
}

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem('authToken');
  socket = io(getBaseUrl(), {
    transports: ['websocket'],
    withCredentials: true,
    auth: token ? { token: `Bearer ${token}` } : undefined,
  });
  return socket;
}
