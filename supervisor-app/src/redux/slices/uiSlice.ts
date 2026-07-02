import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  globalLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  selectedTab: string;
  drawerOpen: boolean;
}

const initialState: UIState = {
  globalLoading: false,
  toast: null,
  selectedTab: 'DashboardTab',
  drawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.globalLoading = action.payload; },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => { state.toast = action.payload; },
    hideToast: (state) => { state.toast = null; },
    setSelectedTab: (state, action: PayloadAction<string>) => { state.selectedTab = action.payload; },
    toggleDrawer: (state) => { state.drawerOpen = !state.drawerOpen; },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => { state.drawerOpen = action.payload; },
  },
});

export const { setLoading, showToast, hideToast, setSelectedTab, toggleDrawer, setDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
