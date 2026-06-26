import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offerService } from '../../services/offer.service';

interface OffersState {
  offers: any[];
  loading: boolean;
  error: string | null;
}

const initialState: OffersState = {
  offers: [],
  loading: false,
  error: null,
};

export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await offerService.getOffers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
  },
);

export const createOffer = createAsyncThunk(
  'offers/createOffer',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await offerService.createOffer(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create offer');
    }
  },
);

export const updateOffer = createAsyncThunk(
  'offers/updateOffer',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await offerService.updateOffer(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update offer');
    }
  },
);

export const deleteOffer = createAsyncThunk(
  'offers/deleteOffer',
  async (id: string, { rejectWithValue }) => {
    try {
      await offerService.deleteOffer(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete offer');
    }
  },
);

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = Array.isArray(action.payload) ? action.payload : action.payload?.offers || [];
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.offers.unshift(action.payload);
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        const index = state.offers.findIndex((o: any) => o._id === action.payload._id);
        if (index !== -1) state.offers[index] = action.payload;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((o: any) => o._id !== action.payload);
      });
  },
});

export const { clearError } = offersSlice.actions;
export default offersSlice.reducer;
