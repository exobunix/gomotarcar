import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types/navigation';

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

// Mock inventory data — replace with API calls when backend is ready
export const fetchInventory = createAsyncThunk('inventory/fetch', async () => {
  return [
    { _id: '1', name: 'Microfiber Cloths', category: 'cleaning', quantity: 200, unit: 'pcs', minStock: 50, allocated: 30, available: 170, createdAt: '2024-01-01' },
    { _id: '2', name: 'Car Shampoo 5L', category: 'chemicals', quantity: 50, unit: 'bottles', minStock: 10, allocated: 8, available: 42, createdAt: '2024-01-01' },
    { _id: '3', name: 'Wheel Cleaner', category: 'chemicals', quantity: 30, unit: 'bottles', minStock: 5, allocated: 5, available: 25, createdAt: '2024-01-01' },
    { _id: '4', name: 'Glass Cleaner', category: 'chemicals', quantity: 40, unit: 'bottles', minStock: 10, allocated: 6, available: 34, createdAt: '2024-01-01' },
    { _id: '5', name: 'Vacuum Bags', category: 'equipment', quantity: 100, unit: 'pcs', minStock: 20, allocated: 15, available: 85, createdAt: '2024-01-01' },
    { _id: '6', name: 'Tire Dressings', category: 'chemicals', quantity: 25, unit: 'bottles', minStock: 5, allocated: 4, available: 21, createdAt: '2024-01-01' },
    { _id: '7', name: 'Protective Gloves', category: 'safety', quantity: 150, unit: 'pairs', minStock: 30, allocated: 20, available: 130, createdAt: '2024-01-01' },
    { _id: '8', name: 'Face Masks', category: 'safety', quantity: 300, unit: 'pcs', minStock: 50, allocated: 25, available: 275, createdAt: '2024-01-01' },
  ] as InventoryItem[];
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: [], selectedItem: null, loading: false, error: null } as InventoryState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; })
      .addCase(fetchInventory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; });
  },
});

export default inventorySlice.reducer;
