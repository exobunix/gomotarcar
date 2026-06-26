import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setData: (state, action) => { state.data = action.payload; state.loading = false; state.error = null; },
    resetState: () => initialState,
  },
});

export const { setLoading, setError, setData, resetState } = taskSlice.actions;
export default taskSlice.reducer;
