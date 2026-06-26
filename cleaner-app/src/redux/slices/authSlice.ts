import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/auth.service';
import { CleanerProfile } from '../../types/navigation';

interface AuthState {
  cleaner: CleanerProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  cleaner: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

export const loginCleaner = createAsyncThunk(
  'auth/login',
  async ({ phone, password }: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(phone, password);
      await AsyncStorage.setItem('accessToken', res.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      // Map backend { user, profile } to CleanerProfile
      return { 
        ...res.data.profile, 
        phone: res.data.user?.phone, 
        email: res.data.user?.email, 
        role: res.data.user?.role 
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await authService.sendOtp(phone);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      await authService.verifyOtp(phone, otp);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return null;
      const res = await authService.getProfile();
      // res.data is { user, profile }
      return { 
        ...res.data.profile, 
        phone: res.data.user?.phone, 
        email: res.data.user?.email, 
        role: res.data.user?.role 
      };
    } catch {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch {}
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(sendOtp.fulfilled, (state) => { state.isLoading = false; })
      .addCase(sendOtp.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(verifyOtp.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state) => { state.isLoading = false; })
      .addCase(verifyOtp.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(loginCleaner.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginCleaner.fulfilled, (state, action) => { state.isLoading = false; state.cleaner = action.payload; state.isAuthenticated = true; })
      .addCase(loginCleaner.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(checkAuth.pending, (state) => { state.isLoading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.isLoading = false; state.isInitialized = true; if (action.payload) { state.cleaner = action.payload; state.isAuthenticated = true; } })
      .addCase(checkAuth.rejected, (state) => { state.isLoading = false; state.isInitialized = true; })
      .addCase(logout.fulfilled, (state) => { state.cleaner = null; state.isAuthenticated = false; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
