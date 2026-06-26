import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface UiState {
  globalLoading: boolean;
  toast: Toast;
}

const initialState: UiState = {
  globalLoading: false,
  toast: { message: '', type: 'info', visible: false },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => { state.globalLoading = action.payload; },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => { state.toast = { ...action.payload, visible: true }; },
    hideToast: (state) => { state.toast.visible = false; },
  },
});

export const { setGlobalLoading, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
