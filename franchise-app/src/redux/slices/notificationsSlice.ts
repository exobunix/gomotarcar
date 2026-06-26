import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { notificationService } from '../../services/notification.service';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.getNotifications();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead: (state) => { state.unreadCount = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || action.payload || [];
        state.unreadCount = state.items.filter((n: any) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; });
  },
});

export const { addNotification, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
