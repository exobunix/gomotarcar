import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { franchiseService } from '../../services/franchise.service';

interface User {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  gstVerified: boolean;
  role: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isGstVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isGstVerified: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials.phone, credentials.password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: {
    phone: string;
    password: string;
    name: string;
    email?: string;
    businessName: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  },
);

export const verifyGst = createAsyncThunk(
  'auth/verifyGst',
  async (gstNumber: string, { rejectWithValue }) => {
    try {
      const response = await franchiseService.verifyGst(gstNumber);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'GST verification failed');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await franchiseService.updateProfile(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setGstVerified(state, action: PayloadAction<boolean>) {
      state.isGstVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isGstVerified = action.payload.user?.gstVerified || false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyGst.fulfilled, (state) => {
        state.isGstVerified = true;
        if (state.user) {
          state.user.gstVerified = true;
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload } as User;
      });
  },
});

export const { logout, clearError, setGstVerified } = authSlice.actions;
export default authSlice.reducer;
