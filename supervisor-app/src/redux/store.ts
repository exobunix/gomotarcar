import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cleanerReducer from './slices/cleanerSlice';
import apartmentReducer from './slices/apartmentSlice';
import taskReducer from './slices/taskSlice';
import qrReducer from './slices/qrSlice';
import complaintReducer from './slices/complaintSlice';
import incentiveReducer from './slices/incentiveSlice';
import inventoryReducer from './slices/inventorySlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cleaners: cleanerReducer,
    apartments: apartmentReducer,
    tasks: taskReducer,
    qr: qrReducer,
    complaints: complaintReducer,
    incentives: incentiveReducer,
    inventory: inventoryReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
