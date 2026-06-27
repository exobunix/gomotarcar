import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SOCKET_URL = __DEV__
  ? Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'
  : 'https://gomotarcar-api.onrender.com';

let socket: Socket | null = null;

type EventHandler = (data: any) => void;

class CleanerSocketService {
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
      reconnectionDelayMax: 10000,
    });

    return new Promise((resolve, reject) => {
      socket!.on('connect', () => {
        console.log('Socket connected');
        this.connected = true;
        resolve(socket!);
      });

      socket!.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
        reject(err);
      });

      socket!.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
      });
    });
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
    if (socket) socket.on(event, handler);
  }

  off(event: string, handler?: EventHandler): void {
    if (handler) {
      const existing = this.handlers.get(event) || [];
      this.handlers.set(event, existing.filter((h) => h !== handler));
    } else {
      this.handlers.delete(event);
    }
    if (socket) {
      handler ? socket.off(event, handler) : socket.off(event);
    }
  }

  emit(event: string, data?: any): void {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }

  // Cleaner-specific events
  sendLocation(data: { latitude: number; longitude: number; timestamp: number }): void {
    this.emit('location:update', data);
  }

  sendAttendanceCheckIn(data: { latitude: number; longitude: number; selfie?: string }): void {
    this.emit('attendance:check-in', data);
  }

  sendAttendanceCheckOut(data: { latitude: number; longitude: number }): void {
    this.emit('attendance:check-out', data);
  }

  markTaskStarted(taskId: string): void {
    this.emit('task:start', { taskId });
  }

  markTaskCompleted(taskId: string, data?: any): void {
    this.emit('task:complete', { taskId, ...data });
  }

  getSocket(): Socket | null {
    return socket;
  }
}

export const socketService = new CleanerSocketService();
export default socketService;
