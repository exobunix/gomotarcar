import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types/navigation';
import { inventoryService } from '../../services/inventory.service';

interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk('inventory/fetch', async () => {
  const res = await inventoryService.list();
  return res.data.data as InventoryItem[];
});

export const allocateInventory = createAsyncThunk(
  'inventory/allocate',
  async (data: { cleanerId: string; itemId: string; quantity: number }) => {
    const res = await inventoryService.allocate(data);
    return res.data.data as InventoryItem[];
  }
);

export const restockInventory = createAsyncThunk(
  'inventory/restock',
  async (data: { itemId: string; quantity: number }) => {
    const res = await inventoryService.restock(data);
    return res.data.data as InventoryItem[];
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInventory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload || []; })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      
      .addCase(allocateInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(allocateInventory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload || []; })
      .addCase(allocateInventory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      
      .addCase(restockInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(restockInventory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload || []; })
      .addCase(restockInventory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; });
  },
});

export default inventorySlice.reducer;
