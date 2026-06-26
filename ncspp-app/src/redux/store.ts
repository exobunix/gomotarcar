import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import franchiseReducer from './slices/franchiseSlice';
import servicesReducer from './slices/servicesSlice';
import offersReducer from './slices/offersSlice';
import walletReducer from './slices/walletSlice';
import leadReducer from './slices/leadSlice';
import notificationReducer from './slices/notificationSlice';
import reviewReducer from './slices/reviewSlice';
import payoutReducer from './slices/payoutSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    franchise: franchiseReducer,
    services: servicesReducer,
    offers: offersReducer,
    wallet: walletReducer,
    lead: leadReducer,
    notification: notificationReducer,
    review: reviewReducer,
    payout: payoutReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
