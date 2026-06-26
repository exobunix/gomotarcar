import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const cleanerSlice = createSlice({
  name: 'cleaner',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setData: (state, action) => { state.data = action.payload; state.loading = false; state.error = null; },
    resetState: () => initialState,
  },
});

export const { setLoading, setError, setData, resetState } = cleanerSlice.actions;
export default cleanerSlice.reducer;
