import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionService } from '../../services/subscription.service';
import { SubscriptionPlan, ActiveSubscription } from '../../types/navigation';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  mySubscriptions: ActiveSubscription[];
  selectedPlan: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  mySubscriptions: [],
  selectedPlan: null,
  loading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk(
  'subscriptions/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionService.getPlans();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const fetchMySubscriptions = createAsyncThunk(
  'subscriptions/fetchMySubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionService.getMySubscriptions();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const subscribe = createAsyncThunk(
  'subscriptions/subscribe',
  async (data: { planId: string; vehicleId: string; apartmentId: string }, { rejectWithValue }) => {
    try {
      const res = await subscriptionService.subscribe(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Subscription failed');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await subscriptionService.cancel(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<SubscriptionPlan | null>) => {
      state.selectedPlan = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.plans = action.payload; })
      .addCase(fetchPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchMySubscriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => { state.loading = false; state.mySubscriptions = action.payload; })
      .addCase(fetchMySubscriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(subscribe.fulfilled, (state, action) => {
        state.mySubscriptions.unshift(action.payload);
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const idx = state.mySubscriptions.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.mySubscriptions[idx] = action.payload;
      });
  },
});

export const { setSelectedPlan, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
