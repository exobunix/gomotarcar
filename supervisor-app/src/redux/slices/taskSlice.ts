import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/task.service';
import { TaskItem } from '../../types/navigation';

interface TaskState {
  tasks: TaskItem[];
  dailyTasks: TaskItem[];
  approvalTasks: TaskItem[];
  selectedTask: TaskItem | null;
  loading: boolean;
  dailyLoading: boolean;
  approvalLoading: boolean;
  actionLoading: string | null; // taskId being acted on
  stats: any;
  dailyStats: any; // today's stats: { total, completed, pending, inProgress, missed }
  approvalStats: any; // { pendingApproval, approvedToday, rejectedToday }
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  dailyTasks: [],
  approvalTasks: [],
  selectedTask: null,
  loading: false,
  dailyLoading: false,
  approvalLoading: false,
  actionLoading: null,
  stats: null,
  dailyStats: null,
  approvalStats: null,
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

export const fetchTodayForSupervisor = createAsyncThunk('tasks/fetchTodaySupervisor', async (params?: any) => {
  const res = await taskService.getTodayForSupervisor(params);
  // Response: { success, data: [...], stats: {...}, pagination: {...} }
  return { tasks: res.data.data, stats: res.data.stats };
});

export const fetchTaskStats = createAsyncThunk('tasks/fetchStats', async () => {
  const res = await taskService.getStats();
  return res.data.data;
});

export const fetchApprovalStats = createAsyncThunk('tasks/fetchApprovalStats', async () => {
  const res = await taskService.getApprovalStats();
  return res.data.data;
});

export const fetchApprovalList = createAsyncThunk('tasks/fetchApprovalList', async (params?: any) => {
  const res = await taskService.getApprovalList(params);
  return { tasks: res.data.data, pagination: res.data.pagination };
});

export const approveTask = createAsyncThunk('tasks/approve', async ({ id, data }: { id: string; data?: any }) => {
  const res = await taskService.approve(id, data);
  return res.data.data;
});

export const rejectTask = createAsyncThunk('tasks/reject', async ({ id, reason }: { id: string; reason: string }) => {
  const res = await taskService.reject(id, { reason });
  return res.data.data;
});

export const rescheduleTask = createAsyncThunk('tasks/reschedule', async ({ id, data }: { id: string; data: any }) => {
  const res = await taskService.reschedule(id, data);
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

// Helper to update a task in-place in both tasks and dailyTasks arrays
const patchTaskInState = (state: TaskState, updatedTask: any) => {
  if (!updatedTask?._id) return;
  state.tasks = state.tasks.map(t => t._id === updatedTask._id ? updatedTask : t);
  state.dailyTasks = state.dailyTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
  if (state.selectedTask?._id === updatedTask._id) state.selectedTask = updatedTask;
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.tasks = action.payload || []; })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })

      .addCase(fetchDailyWork.fulfilled, (state, action) => { state.dailyTasks = action.payload || []; })

      .addCase(fetchTodayForSupervisor.pending, (state) => { state.dailyLoading = true; })
      .addCase(fetchTodayForSupervisor.fulfilled, (state, action) => {
        state.dailyLoading = false;
        state.dailyTasks = action.payload.tasks || [];
        state.dailyStats = action.payload.stats || null;
      })
      .addCase(fetchTodayForSupervisor.rejected, (state) => { state.dailyLoading = false; })

      .addCase(fetchTaskById.fulfilled, (state, action) => { state.selectedTask = action.payload; })
      .addCase(fetchTaskStats.fulfilled, (state, action) => { state.stats = action.payload; })

      // Approval stats & list
      .addCase(fetchApprovalStats.fulfilled, (state, action) => { state.approvalStats = action.payload; })
      .addCase(fetchApprovalList.pending, (state) => { state.approvalLoading = true; })
      .addCase(fetchApprovalList.fulfilled, (state, action) => {
        state.approvalLoading = false;
        state.approvalTasks = action.payload.tasks || [];
      })
      .addCase(fetchApprovalList.rejected, (state) => { state.approvalLoading = false; })


      .addCase(approveTask.pending, (state, action) => { state.actionLoading = action.meta.arg.id; })
      .addCase(approveTask.fulfilled, (state, action) => {
        state.actionLoading = null;
        patchTaskInState(state, action.payload);
      })
      .addCase(approveTask.rejected, (state) => { state.actionLoading = null; })

      // Reject
      .addCase(rejectTask.pending, (state, action) => { state.actionLoading = action.meta.arg.id; })
      .addCase(rejectTask.fulfilled, (state, action) => {
        state.actionLoading = null;
        patchTaskInState(state, action.payload);
      })
      .addCase(rejectTask.rejected, (state) => { state.actionLoading = null; })

      // Reschedule
      .addCase(rescheduleTask.pending, (state, action) => { state.actionLoading = action.meta.arg.id; })
      .addCase(rescheduleTask.fulfilled, (state, action) => {
        state.actionLoading = null;
        patchTaskInState(state, action.payload);
      })
      .addCase(rescheduleTask.rejected, (state) => { state.actionLoading = null; })

      .addCase(requestRedo.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        patchTaskInState(state, action.payload);
      })
      .addCase(assignCleaner.fulfilled, (state, action) => { state.selectedTask = action.payload; });
  },
});

export default taskSlice.reducer;
