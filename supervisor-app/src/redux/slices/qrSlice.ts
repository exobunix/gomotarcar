import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { qrService } from '../../services/qr.service';
import { QRItem } from '../../types/navigation';

interface QRState {
  qrs: QRItem[];
  selectedQR: QRItem | null;
  loading: boolean;
  stats: any;
  error: string | null;
}

const initialState: QRState = {
  qrs: [],
  selectedQR: null,
  loading: false,
  stats: null,
  error: null,
};

export const fetchQRs = createAsyncThunk('qr/fetch', async (params?: any) => {
  const res = await qrService.list(params);
  return res.data.data;
});

export const fetchQRById = createAsyncThunk('qr/fetchById', async (id: string) => {
  const res = await qrService.getById(id);
  return res.data.data;
});

export const generateQR = createAsyncThunk('qr/generate', async (data: any) => {
  const res = await qrService.generate(data);
  return res.data.data;
});

export const activateQR = createAsyncThunk('qr/activate', async (id: string) => {
  const res = await qrService.activate(id);
  return res.data.data;
});

export const reportQrDamaged = createAsyncThunk('qr/damaged', async ({ id, data }: { id: string; data?: any }) => {
  const res = await qrService.reportDamaged(id, data);
  return res.data.data;
});

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQRs.pending, (state) => { state.loading = true; })
      .addCase(fetchQRs.fulfilled, (state, action) => { state.loading = false; state.qrs = action.payload; })
      .addCase(fetchQRs.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchQRById.fulfilled, (state, action) => { state.selectedQR = action.payload; })
      .addCase(generateQR.fulfilled, (state, action) => { state.qrs.unshift(action.payload); })
      .addCase(activateQR.fulfilled, (state, action) => {
        state.qrs = state.qrs.map((q) => q._id === action.payload._id ? action.payload : q);
      })
      .addCase(reportQrDamaged.fulfilled, (state, action) => {
        state.qrs = state.qrs.map((q) => q._id === action.payload._id ? action.payload : q);
      });
  },
});

export default qrSlice.reducer;
