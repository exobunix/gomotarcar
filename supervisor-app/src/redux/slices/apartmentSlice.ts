import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apartmentService } from '../../services/apartment.service';
import { ApartmentItem } from '../../types/navigation';

interface ApartmentState {
  apartments: ApartmentItem[];
  selectedApartment: ApartmentItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApartmentState = {
  apartments: [],
  selectedApartment: null,
  loading: false,
  error: null,
};

export const fetchApartments = createAsyncThunk('apartments/fetch', async (params?: any) => {
  const res = await apartmentService.list(params);
  return res.data.data;
});

export const fetchApartmentById = createAsyncThunk('apartments/fetchById', async (id: string) => {
  const res = await apartmentService.getById(id);
  return res.data.data;
});

const apartmentSlice = createSlice({
  name: 'apartments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApartments.pending, (state) => { state.loading = true; })
      .addCase(fetchApartments.fulfilled, (state, action) => { state.loading = false; state.apartments = action.payload; })
      .addCase(fetchApartments.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchApartmentById.pending, (state) => { state.loading = true; })
      .addCase(fetchApartmentById.fulfilled, (state, action) => { state.loading = false; state.selectedApartment = action.payload; })
      .addCase(fetchApartmentById.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; });
  },
});

export default apartmentSlice.reducer;
