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
import Typography from '@mui/material/Typography';
import { taskApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const STATUS_FLOW = ['assigned', 'in_progress', 'completed'];

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [kanbanView, setKanbanView] = useState(false);
  const [assignDialog, setAssignDialog] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await taskApi.list({ page, limit: 20, ...filters });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await taskApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      if (newStatus === 'in_progress') await taskApi.start(task._id);
      else if (newStatus === 'completed') await taskApi.complete(task._id, {});
      else if (newStatus === 'missed') await taskApi.markMissed(task._id, { reason: '' });
      fetchData();
      fetchStats();
    } catch {}
  };

  const columns = [
    { key: 'taskId', label: 'Task ID', render: (v) => <Box sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{v || '-'}</Box> },
    { key: 'customerId', label: 'Customer', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : '-' },
    { key: 'vehicleId', label: 'Vehicle', render: (v) => v?.vehicleNumber || '-' },
    { key: 'cleanerId', label: 'Cleaner', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : <Chip label="Unassigned" size="small" color="warning" /> },
    { key: 'scheduledDate', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'packageType', label: 'Package', render: (v) => <Chip label={v || 'basic'} size="small" variant="outlined" /> },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      {row.status === 'assigned' && (
        <Tooltip title="Start"><IconButton size="small" color="success" onClick={() => handleStatusChange(row, 'in_progress')}><PlayArrowIcon fontSize="small" /></IconButton></Tooltip>
      )}
      {row.status === 'in_progress' && (
        <Tooltip title="Complete"><IconButton size="small" color="success" onClick={() => handleStatusChange(row, 'completed')}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
      )}
      {!row.cleanerId && (
        <Tooltip title="Assign Cleaner"><IconButton size="small" color="warning" onClick={() => setAssignDialog(row)}><AssignmentIcon fontSize="small" /></IconButton></Tooltip>
      )}
    </Box>
  );

  // Kanban grouping
  const kanbanGroups = { assigned: [], in_progress: [], completed: [], missed: [], cancelled: [] };
  tasks.forEach(t => { if (kanbanGroups[t.status]) kanbanGroups[t.status].push(t); });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>Task Management</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>Manage cleaning tasks, assignments, and status tracking</Typography>
        </Box>
        <Button variant={kanbanView ? 'contained' : 'outlined'} onClick={() => setKanbanView(!kanbanView)} sx={{ height: 44 }}>
          {kanbanView ? 'Table View' : 'Kanban View'}
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Tasks', value: stats?.totalTasks, icon: '📋', color: '#0D5BD7' },
          { title: 'Assigned', value: stats?.assigned, icon: '📝', color: '#D97706' },
          { title: 'In Progress', value: stats?.inProgress, icon: '🔄', color: '#8B5CF6' },
          { title: 'Completed', value: stats?.completed, icon: '✅', color: '#059669' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search tasks..." />
        <TextField select size="small" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Status</MenuItem>
          {['assigned', 'in_progress', 'completed', 'missed', 'cancelled'].map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
        </TextField>
      </Box>

      {kanbanView ? (
        <Grid container spacing={2}>
          {Object.entries(kanbanGroups).filter(([status]) => status !== 'cancelled').map(([status, items]) => (
            <Grid item xs={12} md={status === 'completed' ? 6 : 3} key={status}>
              <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 3, p: 2, border: '1px solid #E5E7EB', minHeight: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Typography>
                  <Chip label={items.length} size="small" sx={{ fontWeight: 700 }} />
                </Box>
                {items.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>No tasks</Box>
                ) : items.map(task => (
                  <Box key={task._id} sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 1.5, mb: 1, border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { borderColor: '#0D5BD7' } }} onClick={() => setDetail(task)}>
                    <Box sx={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: 'monospace' }}>{task.taskId || task._id?.slice(-6)}</Box>
                    <Box sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.5 }}>{task.customerId?.firstName} {task.customerId?.lastName} - {task.vehicleId?.vehicleNumber}</Box>
                    <Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : ''} {task.scheduledTime || ''}</Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <DataTable columns={columns} rows={tasks} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No tasks found" emptyIcon="📋" />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Task {detail.taskId || detail._id?.slice(-6)}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Customer</Box><Box sx={{ fontWeight: 600 }}>{detail.customerId?.firstName} {detail.customerId?.lastName}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Vehicle</Box><Box sx={{ fontWeight: 600 }}>{detail.vehicleId?.vehicleNumber} ({detail.vehicleId?.make} {detail.vehicleId?.model})</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Cleaner</Box><Box sx={{ fontWeight: 600 }}>{detail.cleanerId ? `${detail.cleanerId.firstName} ${detail.cleanerId.lastName}` : 'Unassigned'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Status</Box><StatusChip status={detail.status} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Date</Box><Box sx={{ fontWeight: 600 }}>{detail.scheduledDate ? new Date(detail.scheduledDate).toLocaleDateString() : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Time</Box><Box sx={{ fontWeight: 600 }}>{detail.scheduledTime || detail.timeSlot || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Package</Box><Box sx={{ fontWeight: 600 }}>{detail.packageType || 'Basic'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Earnings</Box><Box sx={{ fontWeight: 600 }}>₹{detail.cleanerEarnings || 0}</Box></Grid>
                {detail.specialInstructions && <Grid item xs={12}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Instructions</Box><Box sx={{ mt: 0.5 }}>{detail.specialInstructions}</Box></Grid>}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)} variant="outlined">Close</Button>
              {detail.status === 'assigned' && <Button variant="contained" color="success" onClick={() => { setDetail(null); handleStatusChange(detail, 'in_progress'); }}>Start Task</Button>}
              {detail.status === 'in_progress' && <Button variant="contained" color="success" onClick={() => { setDetail(null); handleStatusChange(detail, 'completed'); }}>Complete Task</Button>}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TaskListPage;
