import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notification.service';
import { NotificationItem } from '../../types/navigation';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ userId, params }: { userId: string; params?: { page?: number; limit?: number } }, { rejectWithValue }) => {
    try {
      const res = await notificationService.listForUser(userId, params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await notificationService.markAsRead(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await notificationService.getUnreadCount(userId);
      return res.data.count;
    } catch { return 0; }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.notifications = action.payload; })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) { state.notifications[idx].isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
