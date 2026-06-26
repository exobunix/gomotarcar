import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';

const SOCKET_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.gomotarcar.com';

class SocketService {
  private socket: Socket | null = null;
  private handlers: Map<string, (...args: any[]) => void> = new Map();
  private connected = false;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
    });

    this.socket.on('notification', (data) => {
      const handler = this.handlers.get('notification');
      if (handler) handler(data);
    });

    this.socket.on('lead:update', (data) => {
      const handler = this.handlers.get('lead:update');
      if (handler) handler(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.handlers.clear();
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.handlers.set(event, handler);
    if (this.socket) {
      this.socket.off(event);
      this.socket.on(event, handler);
    }
  }

  off(event: string) {
    this.handlers.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
