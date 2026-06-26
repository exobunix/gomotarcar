import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/attendance.service';
import { AttendanceRecord } from '../../types/navigation';

interface AttendanceState {
  today: AttendanceRecord | null;
  history: AttendanceRecord[];
  summary: {
    present: number;
    absent: number;
    halfDay: number;
    late: number;
    leave: number;
    totalWorkingMinutes: number;
    totalOvertimeMinutes: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  today: null,
  history: [],
  summary: null,
  loading: false,
  error: null,
};

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (data: { latitude: number; longitude: number; photo?: string }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.checkIn(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const res = await attendanceService.checkOut();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Check-out failed');
    }
  }
);

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (cleanerId: string, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getToday(cleanerId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchAttendanceMonthly = createAsyncThunk(
  'attendance/fetchMonthly',
  async ({ cleanerId, month, year }: { cleanerId: string; month: number; year: number }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.getMonthly(cleanerId, month, year);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkIn.fulfilled, (state, action) => { state.loading = false; state.today = action.payload; })
      .addCase(checkIn.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(checkOut.pending, (state) => { state.loading = true; })
      .addCase(checkOut.fulfilled, (state, action) => { state.loading = false; state.today = action.payload; })
      .addCase(checkOut.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => { state.today = action.payload; })
      .addCase(fetchAttendanceMonthly.pending, (state) => { state.loading = true; })
      .addCase(fetchAttendanceMonthly.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload?.records || [];
        state.summary = action.payload?.summary || null;
      })
      .addCase(fetchAttendanceMonthly.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
