import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import bookingReducer from './slices/bookingSlice';
import qrReducer from './slices/qrSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import vehicleReducer from './slices/vehicleSlice';
import apartmentReducer from './slices/apartmentSlice';
import walletReducer from './slices/walletSlice';
import complaintReducer from './slices/complaintSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    subscription: subscriptionReducer,
    booking: bookingReducer,
    qr: qrReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    vehicles: vehicleReducer,
    apartments: apartmentReducer,
    wallet: walletReducer,
    complaints: complaintReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
