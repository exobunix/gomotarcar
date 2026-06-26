import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../services/review.service';

interface ReviewState {
  reviews: any[];
  ratingSummary: { average: number; total: number; distribution: Record<number, number> } | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  ratingSummary: null,
  loading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  'review/fetchReviews',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviews(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  },
);

export const replyToReview = createAsyncThunk(
  'review/replyToReview',
  async ({ id, reply }: { id: string; reply: string }, { rejectWithValue }) => {
    try {
      const response = await reviewService.replyToReview(id, reply);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reply');
    }
  },
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.reviews = Array.isArray(data) ? data : data?.reviews || [];
        state.ratingSummary = data?.summary || null;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(replyToReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex((r: any) => r._id === action.payload._id);
        if (index !== -1) state.reviews[index] = action.payload;
      });
  },
});

export const { clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
