import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apartmentService } from '../../services/apartment.service';
import { ApartmentData } from '../../types/navigation';

interface ApartmentState {
  apartments: ApartmentData[];
  selectedApartment: ApartmentData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApartmentState = {
  apartments: [],
  selectedApartment: null,
  loading: false,
  error: null,
};

export const fetchApartments = createAsyncThunk(
  'apartments/fetchApartments',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const res = await apartmentService.listByCustomer(customerId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch apartments');
    }
  }
);

export const createApartment = createAsyncThunk(
  'apartments/createApartment',
  async (data: Omit<ApartmentData, '_id'>, { rejectWithValue }) => {
    try {
      const res = await apartmentService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add apartment');
    }
  }
);

export const updateApartment = createAsyncThunk(
  'apartments/updateApartment',
  async ({ id, data }: { id: string; data: Partial<ApartmentData> }, { rejectWithValue }) => {
    try {
      const res = await apartmentService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update apartment');
    }
  }
);

export const deleteApartment = createAsyncThunk(
  'apartments/deleteApartment',
  async (id: string, { rejectWithValue }) => {
    try {
      await apartmentService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete apartment');
    }
  }
);

export const setDefaultApartment = createAsyncThunk(
  'apartments/setDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apartmentService.setDefault(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to set default apartment');
    }
  }
);

const apartmentSlice = createSlice({
  name: 'apartments',
  initialState,
  reducers: {
    setSelectedApartment: (state, action: PayloadAction<ApartmentData | null>) => {
      state.selectedApartment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApartments.fulfilled, (state, action) => {
        state.loading = false;
        state.apartments = action.payload;
      })
      .addCase(fetchApartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createApartment.fulfilled, (state, action) => {
        state.apartments.unshift(action.payload);
      })
      .addCase(updateApartment.fulfilled, (state, action) => {
        const index = state.apartments.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.apartments[index] = action.payload;
      })
      .addCase(deleteApartment.fulfilled, (state, action) => {
        state.apartments = state.apartments.filter((a) => a._id !== action.payload);
      })
      .addCase(setDefaultApartment.fulfilled, (state, action) => {
        state.apartments.forEach((a) => {
          a.isDefault = a._id === action.payload._id;
        });
      });
  },
});

export const { setSelectedApartment, clearError } = apartmentSlice.actions;
export default apartmentSlice.reducer;
