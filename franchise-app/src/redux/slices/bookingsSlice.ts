import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/booking.service';

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (params: any, { rejectWithValue }) => {
  try {
    const response = await bookingService.getBookings(params);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch bookings');
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
  try {
    const response = await bookingService.updateStatus(id, status);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to update booking');
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { items: [], loading: false, error: null, stats: { total: 0, pending: 0, completed: 0 } },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchBookings.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.items || action.payload; })
      .addCase(fetchBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b: any) => b._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default bookingsSlice.reducer;
