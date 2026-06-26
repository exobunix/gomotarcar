import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setData: (state, action) => { state.data = action.payload; state.loading = false; state.error = null; },
    resetState: () => initialState,
  },
});

export const { setLoading, setError, setData, resetState } = earningsSlice.actions;
export default earningsSlice.reducer;
