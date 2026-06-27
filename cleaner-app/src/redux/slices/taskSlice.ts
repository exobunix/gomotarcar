import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/task.service';
import { TaskItem } from '../../types/navigation';

interface TaskState {
  todayTasks: TaskItem[];
  selectedTask: TaskItem | null;
  loading: boolean;
  error: string | null;
}

const generateMockTasks = (): TaskItem[] => {
  const statuses: ('pending' | 'in_progress' | 'completed')[] = ['completed', 'in_progress', 'pending'];
  const carModels = ['Sedan', 'SUV', 'Hatchback', 'Thar', 'Fortuner', 'Creta', 'Verna', 'i20', 'Baleno'];
  const packages = ['Premium Wash', 'Interior + Exterior', 'Exterior Wash', 'Ceramic Coating Wash', 'Deep Cleaning'];
  const firstNames = ['Amit', 'Neha', 'Rajesh', 'Priya', 'Sanjay', 'Anjali', 'Vikram', 'Ritu', 'Karan', 'Deepa', 'Rahul', 'Sunita', 'Vijay', 'Pooja', 'Arjun', 'Meera', 'Rohan', 'Kiran', 'Aditya', 'Jyoti'];
  const lastNames = ['Sharma', 'Verma', 'Mehta', 'Singh', 'Gupta', 'Patel', 'Reddy', 'Joshi', 'Kumar', 'Das', 'Sen', 'Nair', 'Choudhury', 'Mishra', 'Yadav', 'Rao', 'Pandey', 'Saxena', 'Iyer', 'Bose'];
  const towers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  const tasks: TaskItem[] = [];
  for (let i = 1; i <= 90; i++) {
    const status = statuses[i % 3]; // Distributed: completed, in_progress, pending
    const hour = 8 + (i % 10);
    const minute = (i % 4) * 15;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
    
    tasks.push({
      _id: `mock_task_${i}`,
      taskId: `TSK-${1000 + i}`,
      customerName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      customerPhone: `+91 98765 ${40000 + i}`,
      vehicleNumber: `DL ${((i % 9) + 1).toString().padStart(2, '0')} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 26))} ${1000 + i}`,
      vehicleModel: carModels[i % carModels.length],
      vehicleType: i % 3 === 0 ? 'SUV' : (i % 3 === 1 ? 'Sedan' : 'Hatchback'),
      apartmentName: 'Green Valley Apartments',
      apartmentAddress: `Tower ${towers[i % towers.length]} • Flat ${100 + (i % 20)}`,
      serviceType: packages[i % packages.length],
      packageName: packages[i % packages.length],
      amount: 499 + (i % 10) * 100,
      status: status,
      scheduledTime: timeString,
      scheduledDate: '24 Jun 2026',
    } as any);
  }
  return tasks;
};

const initialState: TaskState = {
  todayTasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};

export const fetchTodayTasks = createAsyncThunk(
  'tasks/fetchToday',
  async (cleanerId: string, { rejectWithValue }) => {
    try {
      const res = await taskService.getTodayTasks(cleanerId);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await taskService.getById(id);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const startTask = createAsyncThunk(
  'tasks/start',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await taskService.startTask(id);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/complete',
  async ({ id, data }: { id: string; data: { afterPhotos?: string[]; notes?: string } }, { rejectWithValue }) => {
    try {
      const res = await taskService.completeTask(id, data);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to complete task');
    }
  }
);

export const scanQRCode = createAsyncThunk(
  'tasks/scanQR',
  async (code: string, { rejectWithValue }) => {
    try {
      const res = await taskService.scanQR(code);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid QR code');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearSelectedTask: (state) => { state.selectedTask = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTodayTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.todayTasks = action.payload || [];
      })
      .addCase(fetchTodayTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        // Find task within local list to enable detail screen navigation
        const taskId = action.meta.arg;
        const task = state.todayTasks.find(t => t._id === taskId);
        if (task) {
          state.selectedTask = task;
        }
      })
      .addCase(startTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        const idx = state.todayTasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.todayTasks[idx] = action.payload;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        const idx = state.todayTasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.todayTasks[idx] = action.payload;
      });
  },
});

export const { clearSelectedTask, clearError } = taskSlice.actions;
export default taskSlice.reducer;
