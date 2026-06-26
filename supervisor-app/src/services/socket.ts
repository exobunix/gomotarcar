import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://api.gomotarcar.com';

let socket: Socket | null = null;

type EventHandler = (data: any) => void;

class SupervisorSocketService {
  private handlers = new Map<string, EventHandler[]>();
  private connected = false;

  async connect(): Promise<Socket> {
    if (socket?.connected) return socket;

    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No auth token');

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    return new Promise((resolve, reject) => {
      socket!.on('connect', () => {
        this.connected = true;
        resolve(socket!);
      });
      socket!.on('connect_error', (err) => reject(err));
      socket!.on('disconnect', () => { this.connected = false; });
    });
  }

  disconnect(): void {
    if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; }
    this.connected = false;
    this.handlers.clear();
  }

  isConnected(): boolean { return this.connected; }

  on(event: string, handler: EventHandler): void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);
    if (socket) socket.on(event, handler);
  }

  off(event: string, handler?: EventHandler): void {
    if (handler) {
      const existing = this.handlers.get(event) || [];
      this.handlers.set(event, existing.filter((h) => h !== handler));
    } else { this.handlers.delete(event); }
    if (socket) { handler ? socket.off(event, handler) : socket.off(event); }
  }

  emit(event: string, data?: any): void {
    if (socket?.connected) socket.emit(event, data);
  }

  getSocket(): Socket | null { return socket; }
}

export const socketService = new SupervisorSocketService();
export default socketService;
