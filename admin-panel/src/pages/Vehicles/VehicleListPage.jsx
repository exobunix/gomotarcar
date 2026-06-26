import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { vehicleApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', vehicleType: '' });
  const [stats, setStats] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', make: '', model: '', year: '', color: '', fuelType: 'petrol', vehicleType: 'sedan', customerId: '' });
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await vehicleApi.list({ page, limit: 20, ...filters });
      setVehicles(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await vehicleApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSave = async () => {
    try {
      if (editing) { await vehicleApi.update(editing._id, form); } else { await vehicleApi.create(form); }
      setDialog(false); fetchData(); fetchStats();
    } catch {}
  };

  const handleDelete = async () => { if (deleteTarget) { try { await vehicleApi.delete(deleteTarget._id); setDeleteTarget(null); fetchData(); fetchStats(); } catch {} } };
  const handleDeactivate = async (id) => { try { await vehicleApi.deactivate(id); fetchData(); } catch {} };

  const columns = [
    { key: 'vehicleNumber', label: 'Number', render: (v) => <Box sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{v}</Box> },
    { key: 'make', label: 'Make/Model', render: (v, r) => `${v || ''} ${r.model || ''}`.trim() || '-' },
    { key: 'vehicleType', label: 'Type', render: (v) => <Chip label={v || '-'} size="small" variant="outlined" /> },
    { key: 'year', label: 'Year' },
    { key: 'fuelType', label: 'Fuel', render: (v) => <Chip label={v || '-'} size="small" variant="outlined" /> },
    { key: 'totalCleanings', label: 'Cleanings', render: (v) => <Chip label={v || 0} size="small" /> },
    { key: 'isActive', label: 'Status', render: (v) => <StatusChip status={v ? 'active' : 'expired'} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditing(row); setForm({ vehicleNumber: row.vehicleNumber, make: row.make, model: row.model, year: row.year?.toString() || '', color: row.color || '', fuelType: row.fuelType || 'petrol', vehicleType: row.vehicleType || 'sedan', customerId: row.customerId?._id || '' }); setDialog(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
      {row.isActive && <Tooltip title="Deactivate"><IconButton size="small" color="warning" onClick={() => handleDeactivate(row._id)}><BlockIcon fontSize="small" /></IconButton></Tooltip>}
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Vehicle Management" subtitle="Manage customer vehicles and cleaning history" actionLabel="Add Vehicle" actionIcon={<AddIcon />} onAction={() => { setEditing(null); setForm({ vehicleNumber: '', make: '', model: '', year: '', color: '', fuelType: 'petrol', vehicleType: 'sedan', customerId: '' }); setDialog(true); }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Vehicles', value: stats?.totalVehicles, icon: '🚗', color: '#0D5BD7' },
          { title: 'Active', value: stats?.activeVehicles, icon: '✅', color: '#059669' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search by number, make, model..." />
        <TextField select size="small" value={filters.vehicleType} onChange={(e) => setFilters(f => ({ ...f, vehicleType: e.target.value }))} sx={{ minWidth: 130 }}>
          <MenuItem value="">All Types</MenuItem>
          {['hatchback', 'sedan', 'suv', 'luxury', 'ev'].map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
        </TextField>
      </Box>

      <DataTable columns={columns} rows={vehicles} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No vehicles found" />

      {/* Detail Dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{detail.vehicleNumber}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Make</Box><Box sx={{ fontWeight: 600 }}>{detail.make}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Model</Box><Box sx={{ fontWeight: 600 }}>{detail.model}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Year</Box><Box sx={{ fontWeight: 600 }}>{detail.year || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Color</Box><Box sx={{ fontWeight: 600 }}>{detail.color || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Fuel Type</Box><Box sx={{ fontWeight: 600 }}>{detail.fuelType || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Type</Box><Box sx={{ fontWeight: 600 }}>{detail.vehicleType || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Cleanings</Box><Box sx={{ fontWeight: 600 }}>{detail.totalCleanings || 0}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Last Cleaning</Box><Box sx={{ fontWeight: 600 }}>{detail.lastCleaning ? new Date(detail.lastCleaning).toLocaleDateString() : 'Never'}</Box></Grid>
              </Grid>
              {detail.cleaningHistory?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ fontWeight: 600, mb: 1 }}>Cleaning History</Box>
                  {detail.cleaningHistory.slice(-5).reverse().map((h, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #F3F4F6' }}>
                      <Box sx={{ fontSize: '0.85rem' }}>{h.cleanerName || 'N/A'}</Box>
                      <Box sx={{ fontSize: '0.85rem', color: '#6B7280' }}>{h.date ? new Date(h.date).toLocaleDateString() : '-'}</Box>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions><Button onClick={() => setDetail(null)} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Vehicle Number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} fullWidth required placeholder="MH01AB1234" />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} fullWidth required placeholder="Toyota" /></Grid>
              <Grid item xs={6}><TextField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} fullWidth required placeholder="Fortuner" /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} fullWidth /></Grid>
              <Grid item xs={4}><TextField label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} fullWidth /></Grid>
              <Grid item xs={4}>
                <TextField select label="Fuel" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} fullWidth>
                  {['petrol', 'diesel', 'electric', 'cng'].map(o => <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField select label="Type" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} fullWidth>
                  {['hatchback', 'sedan', 'suv', 'luxury', 'ev'].map(o => <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}><TextField label="Customer ID" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} fullWidth helperText="MongoDB ObjectId" /></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Vehicle" message={`Delete vehicle ${deleteTarget?.vehicleNumber}? This cannot be undone.`} confirmLabel="Delete" />
    </Box>
  );
};

export default VehicleListPage;
