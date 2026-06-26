import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

export const login = createAsyncThunk('auth/login', async (credentials: { phone: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.token = action.payload.accessToken; state.user = action.payload.user; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
