import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintService } from '../../services/complaint.service';
import { ComplaintData } from '../../types/navigation';

interface ComplaintState {
  complaints: ComplaintData[];
  selectedComplaint: ComplaintData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  selectedComplaint: null,
  loading: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk(
  'complaints/fetch',
  async (params: { status?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await complaintService.list(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await complaintService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch complaint');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (data: {
    bookingId?: string;
    subject: string;
    description: string;
    category: string;
    priority?: string;
  }, { rejectWithValue }) => {
    try {
      const res = await complaintService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit complaint');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearSelectedComplaint: (state) => { state.selectedComplaint = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplaints.fulfilled, (state, action) => { state.loading = false; state.complaints = action.payload; })
      .addCase(fetchComplaints.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchComplaintById.fulfilled, (state, action) => { state.selectedComplaint = action.payload; })
      .addCase(createComplaint.fulfilled, (state, action) => { state.complaints.unshift(action.payload); });
  },
});

export const { clearSelectedComplaint, clearError } = complaintSlice.actions;
export default complaintSlice.reducer;
