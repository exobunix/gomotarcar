import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  globalLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  selectedTab: string;
}

const initialState: UIState = {
  globalLoading: false,
  toast: null,
  selectedTab: 'DashboardTab',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.globalLoading = action.payload; },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => { state.toast = action.payload; },
    hideToast: (state) => { state.toast = null; },
    setSelectedTab: (state, action: PayloadAction<string>) => { state.selectedTab = action.payload; },
  },
});

export const { setLoading, showToast, hideToast, setSelectedTab } = uiSlice.actions;
export default uiSlice.reducer;
