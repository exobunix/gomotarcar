import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintService } from '../../services/complaint.service';
import { ComplaintItem } from '../../types/navigation';

interface ComplaintState {
  complaints: ComplaintItem[];
  selectedComplaint: ComplaintItem | null;
  loading: boolean;
  stats: any;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  selectedComplaint: null,
  loading: false,
  stats: null,
  error: null,
};

export const fetchComplaints = createAsyncThunk('complaints/fetch', async (params?: any) => {
  const res = await complaintService.list(params);
  return res.data.data;
});

export const fetchComplaintById = createAsyncThunk('complaints/fetchById', async (id: string) => {
  const res = await complaintService.getById(id);
  return res.data.data;
});

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; })
      .addCase(fetchComplaints.fulfilled, (state, action) => { state.loading = false; state.complaints = action.payload; })
      .addCase(fetchComplaints.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchComplaintById.fulfilled, (state, action) => { state.selectedComplaint = action.payload; });
  },
});

export default complaintSlice.reducer;
