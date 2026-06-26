import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { franchiseService } from '../../services/franchise.service';

interface FranchiseState {
  profile: any | null;
  dashboardStats: any | null;
  services: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FranchiseState = {
  profile: null,
  dashboardStats: null,
  services: [],
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'franchise/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await franchiseService.getDashboard();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  },
);

export const fetchProfile = createAsyncThunk(
  'franchise/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await franchiseService.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
);

export const updateBusinessProfile = createAsyncThunk(
  'franchise/updateBusinessProfile',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await franchiseService.updateProfile(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  },
);

const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
      });
  },
});

export const { clearError } = franchiseSlice.actions;
export default franchiseSlice.reducer;
