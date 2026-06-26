import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cleanerReducer from './slices/cleanerSlice';
import customerReducer from './slices/customerSlice';
import taskReducer from './slices/taskSlice';
import attendanceReducer from './slices/attendanceSlice';
import earningsReducer from './slices/earningsSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cleaners: cleanerReducer,
    customers: customerReducer,
    tasks: taskReducer,
    attendance: attendanceReducer,
    earnings: earningsReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
