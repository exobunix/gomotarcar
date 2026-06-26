import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface UiState {
  globalLoading: boolean;
  toast: Toast;
  onboardingComplete: boolean;
}

const initialState: UiState = {
  globalLoading: false,
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
  onboardingComplete: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast = { ...action.payload, visible: true };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.onboardingComplete = action.payload;
    },
  },
});

export const { setGlobalLoading, showToast, hideToast, setOnboardingComplete } = uiSlice.actions;
export default uiSlice.reducer;
