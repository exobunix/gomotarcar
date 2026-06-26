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
import { issueApi } from '../../services/api';
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ISSUE_FLOW = ['open', 'in_progress', 'resolved', 'closed'];

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formDialog, setFormDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await issueApi.list({ page, limit: 20, ...filters });
      setIssues(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await issueApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSave = async () => {
    if (!formDialog) return;
    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await issueApi.create(formDialog.data);
      } else {
        await issueApi.update(formDialog.data._id, formDialog.data);
      }
      setFormDialog(null);
      fetchData();
      fetchStats();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await issueApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
      fetchStats();
    } catch {}
  };

  const handleStatusUpdate = async (issue, newStatus) => {
    try {
      await issueApi.update(issue._id, { status: newStatus });
      fetchData();
      fetchStats();
    } catch {}
  };

  const columns = [
    { key: 'ticketNumber', label: 'Ticket', render: (v) => <Box sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{v || '-'}</Box> },
    { key: 'category', label: 'Category', render: (v) => <Chip label={v?.replace(/_/g, ' ') || '-'} size="small" variant="outlined" /> },
    { key: 'description', label: 'Description', render: (v) => <Box sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '-'}</Box> },
    { key: 'priority', label: 'Priority', render: (v) => <StatusChip status={v || 'medium'} /> },
    { key: 'assignedTo', label: 'Assigned To', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : <Chip label="Unassigned" size="small" color="warning" /> },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', data: { ...row } })}><EditIcon fontSize="small" /></IconButton></Tooltip>
      {row.status === 'open' && <Tooltip title="Start Progress"><IconButton size="small" color="info" onClick={() => handleStatusUpdate(row, 'in_progress')}><PersonAddIcon fontSize="small" /></IconButton></Tooltip>}
      {row.status === 'in_progress' && <Tooltip title="Resolve"><IconButton size="small" color="success" onClick={() => handleStatusUpdate(row, 'resolved')}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>}
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Issues & Support" subtitle="Track and resolve operational issues and support tickets" actionLabel="Report Issue" onAction={() => setFormDialog({ mode: 'add', data: {} })} actionIcon={<AddIcon />} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Issues', value: stats?.totalIssues, icon: '🎫', color: '#0D5BD7' },
          { title: 'Open', value: stats?.open, icon: '🔴', color: '#DC2626' },
          { title: 'In Progress', value: stats?.inProgress, icon: '🔄', color: '#D97706' },
          { title: 'Critical', value: stats?.critical, icon: '🚨', color: '#DC2626' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search issues..." />
        <TextField select size="small" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} sx={{ minWidth: 130 }}>
          <MenuItem value="">All Status</MenuItem>
          {ISSUE_FLOW.map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))} sx={{ minWidth: 120 }}>
          <MenuItem value="">All Priority</MenuItem>
          {['low', 'medium', 'high', 'critical'].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
        </TextField>
      </Box>

      <DataTable columns={columns} rows={issues} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No issues found" emptyIcon="🎫" />

      {/* Detail Dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{detail.ticketNumber || 'Issue Detail'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Category</Box><Box sx={{ fontWeight: 600 }}>{detail.category?.replace(/_/g, ' ') || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Priority</Box><StatusChip status={detail.priority} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Status</Box><StatusChip status={detail.status} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Assigned To</Box><Box sx={{ fontWeight: 600 }}>{detail.assignedTo ? `${detail.assignedTo.firstName} ${detail.assignedTo.lastName}` : 'Unassigned'}</Box></Grid>
                <Grid item xs={12}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Description</Box><Box sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{detail.description}</Box></Grid>
                {detail.resolution && <Grid item xs={12}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Resolution</Box><Box sx={{ mt: 0.5, color: '#059669' }}>{detail.resolution}</Box></Grid>}
                {detail.timeline?.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ fontWeight: 600, mb: 1, mt: 1 }}>Timeline</Box>
                    {detail.timeline.map((t, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, fontSize: '0.8rem' }}>
                        <StatusChip status={t.status} size="small" />
                        <Box sx={{ color: '#6B7280' }}>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ''}</Box>
                        {t.note && <Box sx={{ color: '#374151' }}>- {t.note}</Box>}
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)} variant="outlined">Close</Button>
              {detail.status === 'open' && <Button variant="contained" onClick={() => { setDetail(null); handleStatusUpdate(detail, 'in_progress'); }}>Start Progress</Button>}
              {detail.status === 'in_progress' && <Button variant="contained" color="success" onClick={() => { setDetail(null); handleStatusUpdate(detail, 'resolved'); }}>Resolve</Button>}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        {formDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{formDialog.mode === 'add' ? 'Report Issue' : 'Update Issue'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {formDialog.mode === 'add' && (
                  <>
                    <TextField select label="Category" value={formDialog.data.category || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, category: e.target.value } }))} fullWidth>
                      <MenuItem value="">Select...</MenuItem>
                      {['vehicle_locked', 'vehicle_missing', 'customer_complaint', 'qr_damaged', 'payment_issue', 'other'].map(s => (
                        <MenuItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
                      ))}
                    </TextField>
                    <TextField select label="Priority" value={formDialog.data.priority || 'medium'} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, priority: e.target.value } }))} fullWidth>
                      {['low', 'medium', 'high', 'critical'].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                    </TextField>
                  </>
                )}
                <TextField label="Description" value={formDialog.data.description || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, description: e.target.value } }))} fullWidth multiline rows={3} required />
                {formDialog.mode === 'edit' && (
                  <TextField select label="Status" value={formDialog.data.status || 'open'} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, status: e.target.value } }))} fullWidth>
                    {ISSUE_FLOW.map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                  </TextField>
                )}
                <TextField label="Assigned To (User ID)" value={formDialog.data.assignedTo || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, assignedTo: e.target.value } }))} fullWidth helperText="MongoDB ObjectId of user" />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormDialog(null)} variant="outlined">Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving...' : formDialog.mode === 'add' ? 'Report Issue' : 'Save Changes'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Issue" message={`Are you sure?`} confirmLabel="Delete" />
    </Box>
  );
};

export default IssuesPage;
