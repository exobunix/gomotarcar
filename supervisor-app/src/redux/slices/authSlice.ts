import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/auth.service';
import { supervisorService } from '../../services/supervisor.service';
import { SupervisorProfile } from '../../types/navigation';

interface AuthState {
  isAuthenticated: boolean;
  supervisor: SupervisorProfile | null;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  supervisor: null,
  isLoading: false,
  error: null,
  accessToken: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(phone, password);
      const accessToken = data?.tokens?.accessToken || data?.accessToken;
      const refreshToken = data?.tokens?.refreshToken || data?.refreshToken;
      if (accessToken) await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Login failed');
    }
  }
);

export const loadProfile = createAsyncThunk(
  'auth/loadProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await supervisorService.getProfile();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to load profile');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return rejectWithValue('No session');
      return { accessToken: token };
    } catch {
      return rejectWithValue('Failed to restore');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch { /* ignore */ }
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload?.tokens?.accessToken || action.payload?.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.supervisor = action.payload;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState);
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
