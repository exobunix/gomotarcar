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
import { zoneApi } from '../../services/api';
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

const ZoneListPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', city: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formDialog, setFormDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await zoneApi.list({ page, limit: 20, ...filters });
      setZones(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await zoneApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSave = async () => {
    if (!formDialog) return;
    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await zoneApi.create(formDialog.data);
      } else {
        await zoneApi.update(formDialog.data._id, formDialog.data);
      }
      setFormDialog(null);
      fetchData();
      fetchStats();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await zoneApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
      fetchStats();
    } catch {}
  };

  const columns = [
    { key: 'name', label: 'Zone Name', render: (v) => <Box sx={{ fontWeight: 600 }}>{v}</Box> },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State', render: (v) => v || '-' },
    { key: 'supervisorId', label: 'Supervisor', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : '-' },
    { key: 'cleanerCount', label: 'Cleaners', render: (v) => v || 0 },
    { key: 'activeTasks', label: 'Active Tasks', render: (v) => v || 0 },
    { key: 'isActive', label: 'Status', render: (v) => <StatusChip status={v ? 'active' : 'inactive'} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', data: { ...row } })}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Zone Management" subtitle="Manage service zones, boundaries, and assignments" actionLabel="Add Zone" onAction={() => setFormDialog({ mode: 'add', data: {} })} actionIcon={<AddIcon />} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Zones', value: stats?.totalZones, icon: '🗺️', color: '#0D5BD7' },
          { title: 'Active', value: stats?.activeZones, icon: '✅', color: '#059669' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search zones..." />
        <TextField size="small" label="City" value={filters.city} onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))} sx={{ minWidth: 150 }} />
      </Box>

      <DataTable columns={columns} rows={zones} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No zones found" emptyIcon="🗺️" />

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{detail.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>City</Box><Box sx={{ fontWeight: 600 }}>{detail.city}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>State</Box><Box sx={{ fontWeight: 600 }}>{detail.state || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Supervisor</Box><Box sx={{ fontWeight: 600 }}>{detail.supervisorId?.firstName} {detail.supervisorId?.lastName || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Status</Box><StatusChip status={detail.isActive ? 'active' : 'inactive'} /></Grid>
                <Grid item xs={4}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Cleaners</Box><Box sx={{ fontWeight: 700 }}>{detail.cleanerCount || 0}</Box></Grid>
                <Grid item xs={4}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Active Tasks</Box><Box sx={{ fontWeight: 700 }}>{detail.activeTasks || 0}</Box></Grid>
                <Grid item xs={4}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Radius</Box><Box sx={{ fontWeight: 700 }}>{detail.radius || 100}m</Box></Grid>
              </Grid>
            </DialogContent>
            <DialogActions><Button onClick={() => setDetail(null)} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        {formDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{formDialog.mode === 'add' ? 'Add Zone' : 'Edit Zone'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField label="Zone Name" value={formDialog.data.name || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, name: e.target.value } }))} fullWidth required />
                <TextField label="City" value={formDialog.data.city || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, city: e.target.value } }))} fullWidth />
                <TextField label="State" value={formDialog.data.state || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, state: e.target.value } }))} fullWidth />
                <TextField label="Radius (meters)" type="number" value={formDialog.data.radius || 100} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, radius: parseInt(e.target.value) } }))} fullWidth />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormDialog(null)} variant="outlined">Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving...' : formDialog.mode === 'add' ? 'Add Zone' : 'Save Changes'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Zone" message={`Are you sure you want to delete ${deleteTarget?.name}?`} confirmLabel="Delete" />
    </Box>
  );
};

export default ZoneListPage;
