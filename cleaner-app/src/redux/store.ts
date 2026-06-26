import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import attendanceReducer from './slices/attendanceSlice';
import earningsReducer from './slices/earningsSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import leaveReducer from './slices/leaveSlice';
import trainingReducer from './slices/trainingSlice';
import performanceReducer from './slices/performanceSlice';
import incentivesReducer from './slices/incentivesSlice';
import supportReducer from './slices/supportSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    attendance: attendanceReducer,
    earnings: earningsReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    leave: leaveReducer,
    training: trainingReducer,
    performance: performanceReducer,
    incentives: incentivesReducer,
    support: supportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
