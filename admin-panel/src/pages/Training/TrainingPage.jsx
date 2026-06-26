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
import { trainingApi } from '../../services/api';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0D5BD7', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

const TrainingPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formDialog, setFormDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await trainingApi.listVideos({ page, limit: 20, ...filters });
      setVideos(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await trainingApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSave = async () => {
    if (!formDialog) return;
    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await trainingApi.createVideo(formDialog.data);
      } else {
        await trainingApi.updateVideo(formDialog.data._id, formDialog.data);
      }
      setFormDialog(null);
      fetchData();
      fetchStats();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await trainingApi.deleteVideo(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
      fetchStats();
    } catch {}
  };

  const columns = [
    { key: 'title', label: 'Module Name', render: (v) => <Box sx={{ fontWeight: 600 }}>{v}</Box> },
    { key: 'category', label: 'Category', render: (v) => <Chip label={v?.replace(/_/g, ' ') || '-'} size="small" variant="outlined" /> },
    { key: 'duration', label: 'Duration (min)', render: (v) => v || '-' },
    { key: 'isMandatory', label: 'Mandatory', render: (v) => <StatusChip status={v ? 'yes' : 'no'} /> },
    { key: 'hasQuiz', label: 'Has Quiz', render: (v) => <StatusChip status={v ? 'yes' : 'no'} /> },
    { key: 'isActive', label: 'Status', render: (v) => <StatusChip status={v ? 'active' : 'inactive'} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', data: { ...row } })}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  const categoryChartData = stats?.categoryBreakdown?.map(c => ({ name: c._id?.replace(/_/g, ' '), value: c.count })) || [];

  return (
    <Box>
      <PageHeader title="Training Management" subtitle="Manage training modules, track cleaner progress" actionLabel="Add Module" onAction={() => setFormDialog({ mode: 'add', data: {} })} actionIcon={<AddIcon />} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Modules', value: stats?.totalVideos, icon: '📚', color: '#0D5BD7' },
          { title: 'Active', value: stats?.totalActive, icon: '✅', color: '#059669' },
          { title: 'Completed', value: stats?.totalCompleted, icon: '🎓', color: '#059669' },
          { title: 'Avg Progress', value: stats?.averageProgress ? `${Math.round(stats.averageProgress)}%` : '0%', icon: '📊', color: '#D97706' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      {categoryChartData.length > 0 && (
        <Box sx={{ mb: 3, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E5E7EB', p: 3 }}>
          <Box sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Training Categories</Box>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {categoryChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search modules..." />
        <TextField select size="small" value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))} sx={{ minWidth: 180 }}>
          <MenuItem value="">All Categories</MenuItem>
          {['exterior_cleaning', 'interior_cleaning', 'customer_handling', 'safety_training', 'advanced'].map(s => (
            <MenuItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
          ))}
        </TextField>
      </Box>

      <DataTable columns={columns} rows={videos} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No training modules found" emptyIcon="📚" />

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{detail.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Category</Box><Box sx={{ fontWeight: 600 }}>{detail.category?.replace(/_/g, ' ') || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Duration</Box><Box sx={{ fontWeight: 600 }}>{detail.duration || 0} min</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Mandatory</Box><StatusChip status={detail.isMandatory ? 'yes' : 'no'} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Has Quiz</Box><StatusChip status={detail.hasQuiz ? 'yes' : 'no'} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Passing Score</Box><Box sx={{ fontWeight: 600 }}>{detail.passingScore || 70}%</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Points</Box><Box sx={{ fontWeight: 600 }}>{detail.points || 0}</Box></Grid>
                {detail.description && <Grid item xs={12}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Description</Box><Box sx={{ mt: 0.5 }}>{detail.description}</Box></Grid>}
              </Grid>
            </DialogContent>
            <DialogActions><Button onClick={() => setDetail(null)} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        {formDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{formDialog.mode === 'add' ? 'Add Training Module' : 'Edit Training Module'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField label="Module Title" value={formDialog.data.title || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, title: e.target.value } }))} fullWidth required />
                <TextField label="Description" value={formDialog.data.description || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, description: e.target.value } }))} fullWidth multiline rows={2} />
                <TextField select label="Category" value={formDialog.data.category || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, category: e.target.value } }))} fullWidth>
                  <MenuItem value="">Select...</MenuItem>
                  {['exterior_cleaning', 'interior_cleaning', 'customer_handling', 'safety_training', 'advanced'].map(s => (
                    <MenuItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Duration (minutes)" type="number" value={formDialog.data.duration || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, duration: parseInt(e.target.value) } }))} fullWidth />
                <TextField label="Video URL" value={formDialog.data.videoUrl || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, videoUrl: e.target.value } }))} fullWidth />
                <TextField label="Order" type="number" value={formDialog.data.order || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, order: parseInt(e.target.value) } }))} fullWidth />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormDialog(null)} variant="outlined">Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving...' : formDialog.mode === 'add' ? 'Add Module' : 'Save Changes'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Module" message={`Are you sure?`} confirmLabel="Delete" />
    </Box>
  );
};

export default TrainingPage;
