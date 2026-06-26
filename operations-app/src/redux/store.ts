import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import approvalsReducer from './slices/approvalsSlice';
import supportReducer from './slices/supportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    approvals: approvalsReducer,
    support: supportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
