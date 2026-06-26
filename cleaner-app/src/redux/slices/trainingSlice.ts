import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trainingService } from '../../services/training.service';
import { TrainingVideo, TrainingCategory } from '../../types/navigation';

interface TrainingState {
  categories: TrainingCategory[];
  videos: TrainingVideo[];
  selectedVideo: TrainingVideo | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrainingState = {
  categories: [], videos: [], selectedVideo: null, loading: false, error: null,
};

export const fetchCategories = createAsyncThunk('training/categories', async (_, { rejectWithValue }) => {
  try { const res = await trainingService.getCategories(); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

export const fetchVideos = createAsyncThunk('training/videos', async (category?: string, { rejectWithValue }) => {
  try { const res = await trainingService.getVideos(category); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

export const fetchVideoById = createAsyncThunk('training/videoById', async (id: string, { rejectWithValue }) => {
  try { const res = await trainingService.getVideoById(id); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; })
      .addCase(fetchVideos.pending, (s) => { s.loading = true; })
      .addCase(fetchVideos.fulfilled, (s, a) => { s.loading = false; s.videos = a.payload; })
      .addCase(fetchVideos.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchVideoById.fulfilled, (s, a) => { s.selectedVideo = a.payload; });
  },
});

export const { clearError } = trainingSlice.actions;
export default trainingSlice.reducer;
