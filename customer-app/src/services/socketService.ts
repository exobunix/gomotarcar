import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://gomotarcar-api.onrender.com';

let socket: Socket | null = null;

type EventHandler = (data: any) => void;

class SocketService {
  private handlers = new Map<string, EventHandler[]>();
  private connected = false;

  async connect(): Promise<Socket> {
    if (socket?.connected) return socket;

    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No auth token available');

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // Socket.IO clean instance on reconnect — no duplicate handler risk

    return socket;
  }

  disconnect(): void {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    this.connected = false;
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  on(event: string, handler: EventHandler): void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);

    if (socket) {
      socket.on(event, handler);
    }
  }

  off(event: string, handler?: EventHandler): void {
    if (handler) {
      const existing = this.handlers.get(event) || [];
      this.handlers.set(event, existing.filter((h) => h !== handler));
    } else {
      this.handlers.delete(event);
    }

    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        socket.off(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  getSocket(): Socket | null {
    return socket;
  }
}

export const socketService = new SocketService();
export default socketService;
