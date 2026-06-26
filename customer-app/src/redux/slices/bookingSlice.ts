import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/booking.service';
import { ServiceBooking } from '../../types/navigation';

interface BookingState {
  bookings: ServiceBooking[];
  selectedBooking: ServiceBooking | null;
  history: ServiceBooking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  history: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: { status?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await bookingService.list(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await bookingService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data: {
    vehicleId: string;
    apartmentId: string;
    serviceType: string;
    packageName: string;
    amount: number;
    scheduledDate: string;
    scheduledTime: string;
    subscriptionId?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const res = await bookingService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Booking failed');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await bookingService.cancel(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const fetchBookingHistory = createAsyncThunk(
  'bookings/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingService.getHistory();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearSelectedBooking: (state) => { state.selectedBooking = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action) => { state.loading = false; state.bookings = action.payload; })
      .addCase(fetchBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchBookingById.fulfilled, (state, action) => { state.selectedBooking = action.payload; })
      .addCase(createBooking.fulfilled, (state, action) => { state.bookings.unshift(action.payload); })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.bookings[idx] = action.payload;
      })
      .addCase(fetchBookingHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => { state.loading = false; state.history = action.payload; })
      .addCase(fetchBookingHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearSelectedBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
