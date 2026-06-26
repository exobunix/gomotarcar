import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/task.service';
import { TaskItem } from '../../types/navigation';

interface TaskState {
  tasks: TaskItem[];
  dailyTasks: TaskItem[];
  selectedTask: TaskItem | null;
  loading: boolean;
  stats: any;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  dailyTasks: [],
  selectedTask: null,
  loading: false,
  stats: null,
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async (params?: any) => {
  const res = await taskService.list(params);
  return res.data.data;
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id: string) => {
  const res = await taskService.getById(id);
  return res.data.data;
});

export const fetchDailyWork = createAsyncThunk('tasks/fetchDaily', async (date: string) => {
  const res = await taskService.getDailyWork(date);
  return res.data.data;
});

export const fetchTaskStats = createAsyncThunk('tasks/fetchStats', async () => {
  const res = await taskService.getStats();
  return res.data.data;
});

export const approveTask = createAsyncThunk('tasks/approve', async ({ id, data }: { id: string; data?: any }) => {
  const res = await taskService.approve(id, data);
  return res.data.data;
});

export const rejectTask = createAsyncThunk('tasks/reject', async ({ id, reason }: { id: string; reason: string }) => {
  const res = await taskService.reject(id, { reason });
  return res.data.data;
});

export const requestRedo = createAsyncThunk('tasks/redo', async ({ id, reason }: { id: string; reason: string }) => {
  const res = await taskService.requestRedo(id, { reason });
  return res.data.data;
});

export const assignCleaner = createAsyncThunk('tasks/assign', async ({ id, cleanerId }: { id: string; cleanerId: string }) => {
  const res = await taskService.assignCleaner(id, { cleanerId });
  return res.data.data;
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.tasks = action.payload; })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchDailyWork.fulfilled, (state, action) => { state.dailyTasks = action.payload; })
      .addCase(fetchTaskById.fulfilled, (state, action) => { state.selectedTask = action.payload; })
      .addCase(fetchTaskStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(approveTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        state.tasks = state.tasks.map((t) => t._id === action.payload._id ? action.payload : t);
      })
      .addCase(rejectTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        state.tasks = state.tasks.map((t) => t._id === action.payload._id ? action.payload : t);
      })
      .addCase(requestRedo.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        state.tasks = state.tasks.map((t) => t._id === action.payload._id ? action.payload : t);
      })
      .addCase(assignCleaner.fulfilled, (state, action) => { state.selectedTask = action.payload; });
  },
});

export default taskSlice.reducer;
