import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { qrService } from '../../services/qr.service';
import { QRCodeData } from '../../types/navigation';

interface QRState {
  qrCodes: QRCodeData[];
  selectedQR: QRCodeData | null;
  loading: boolean;
  error: string | null;
}

const initialState: QRState = {
  qrCodes: [],
  selectedQR: null,
  loading: false,
  error: null,
};

export const fetchQRCodes = createAsyncThunk(
  'qr/fetchQRCodes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await qrService.list();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch QR codes');
    }
  }
);

export const activateQR = createAsyncThunk(
  'qr/activate',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await qrService.activate(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to activate QR');
    }
  }
);

export const reportDamagedQR = createAsyncThunk(
  'qr/reportDamaged',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await qrService.reportDamaged(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to report damage');
    }
  }
);

export const replaceQR = createAsyncThunk(
  'qr/replace',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await qrService.replace(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to replace QR');
    }
  }
);

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    clearSelectedQR: (state) => { state.selectedQR = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQRCodes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQRCodes.fulfilled, (state, action) => { state.loading = false; state.qrCodes = action.payload; })
      .addCase(fetchQRCodes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(activateQR.fulfilled, (state, action) => {
        const idx = state.qrCodes.findIndex((q) => q._id === action.payload._id);
        if (idx !== -1) state.qrCodes[idx] = action.payload;
      })
      .addCase(reportDamagedQR.fulfilled, (state, action) => {
        const idx = state.qrCodes.findIndex((q) => q._id === action.payload._id);
        if (idx !== -1) state.qrCodes[idx] = action.payload;
      })
      .addCase(replaceQR.fulfilled, (state, action) => {
        const idx = state.qrCodes.findIndex((q) => q._id === action.payload._id);
        if (idx !== -1) state.qrCodes[idx] = action.payload;
      });
  },
});

export const { clearSelectedQR, clearError } = qrSlice.actions;
export default qrSlice.reducer;
