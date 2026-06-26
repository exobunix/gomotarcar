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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { notificationApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

const NOTIF_TYPES = [
  'task_assignment', 'task_reminder', 'attendance_alert', 'issue_update',
  'payment_update', 'leave_status', 'incentive', 'booking_update',
  'subscription_reminder', 'complaint_update', 'announcement', 'system',
];

const NotificationCenterPage = () => {
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ type: '' });
  const [stats, setStats] = useState(null);
  const [sendDialog, setSendDialog] = useState(false);
  const [sendForm, setSendForm] = useState({ recipientId: '', title: '', body: '', type: 'system', priority: 'normal' });
  const [bulkForm, setBulkForm] = useState({ roles: [], title: '', body: '', type: 'announcement', priority: 'normal' });
  const [bulkDialog, setBulkDialog] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await notificationApi.list({ page, limit: 20, ...filters });
      setNotifications(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await notificationApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { if (tab === 0) { fetchData(); fetchStats(); } }, [tab, fetchData, fetchStats]);

  const handleSend = async () => {
    try {
      await notificationApi.send(sendForm);
      setSendDialog(false); fetchData(); fetchStats();
    } catch {}
  };

  const handleBulk = async () => {
    try {
      await notificationApi.sendBulk({ ...bulkForm, roles: Array.isArray(bulkForm.roles) ? bulkForm.roles : [bulkForm.roles] });
      setBulkDialog(false); fetchData();
    } catch {}
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v, r) => <><Box sx={{ fontWeight: 600 }}>{v}</Box><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{r.body?.slice(0, 60)}</Box></> },
    { key: 'type', label: 'Type', render: (v) => <Chip label={v?.replace(/_/g, ' ') || '-'} size="small" variant="outlined" /> },
    { key: 'recipientRole', label: 'Role', render: (v) => v ? <Chip label={v.replace(/_/g, ' ')} size="small" /> : '-' },
    { key: 'isRead', label: 'Status', render: (v) => <StatusChip status={v ? 'yes' : 'no'} label={v ? 'Read' : 'Unread'} /> },
    { key: 'pushSent', label: 'Push', render: (v) => v ? <Chip label="Sent" size="small" color="success" /> : '-' },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleString() : '-' },
  ];

  const availableRoles = ['super_admin', 'manager', 'supervisor', 'operations', 'franchise', 'cleaner', 'customer'];

  return (
    <Box>
      <PageHeader title="Notification Center" subtitle="Send notifications and view history" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid #E5E7EB' }}>
        <Tab label="History" />
        <Tab label="Send" />
        <Tab label="Bulk Send" />
      </Tabs>

      {tab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { title: 'Total', value: stats?.total, icon: '🔔', color: '#0D5BD7' },
              { title: 'Read', value: stats?.read, icon: '👁️', color: '#059669' },
              { title: 'Unread', value: stats?.unread, icon: '🆕', color: '#D97706' },
              { title: 'Push Sent', value: stats?.pushSent, icon: '📲', color: '#0D5BD7' },
            ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField select size="small" value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))} sx={{ minWidth: 160 }}>
              <MenuItem value="">All Types</MenuItem>
              {NOTIF_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<SendIcon />} onClick={() => setSendDialog(true)}>Send Notification</Button>
            <Button variant="outlined" startIcon={<SendIcon />} onClick={() => setBulkDialog(true)}>Bulk Send</Button>
          </Box>

          <DataTable columns={columns} rows={notifications} loading={loading} pagination={pagination} onPageChange={fetchData} emptyMessage="No notifications sent yet" />
        </>
      )}

      {tab === 1 && (
        <Box sx={{ maxWidth: 500 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Recipient ID" value={sendForm.recipientId} onChange={(e) => setSendForm({ ...sendForm, recipientId: e.target.value })} fullWidth helperText="MongoDB ObjectId of the user" />
            <TextField label="Title" value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })} fullWidth required />
            <TextField label="Body" value={sendForm.body} onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })} fullWidth multiline rows={3} required />
            <TextField select label="Type" value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })} fullWidth>
              {NOTIF_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <TextField select label="Priority" value={sendForm.priority} onChange={(e) => setSendForm({ ...sendForm, priority: e.target.value })} fullWidth>
              {['low', 'normal', 'high', 'urgent'].map(p => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleSend} sx={{ alignSelf: 'flex-start' }}>Send</Button>
          </Box>
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ maxWidth: 500 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField select label="Target Roles" value={bulkForm.roles} onChange={(e) => setBulkForm({ ...bulkForm, roles: e.target.value })} fullWidth SelectProps={{ multiple: true }}>
              {availableRoles.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <TextField label="Title" value={bulkForm.title} onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })} fullWidth required />
            <TextField label="Body" value={bulkForm.body} onChange={(e) => setBulkForm({ ...bulkForm, body: e.target.value })} fullWidth multiline rows={3} required />
            <TextField select label="Type" value={bulkForm.type} onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })} fullWidth>
              {NOTIF_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleBulk} sx={{ alignSelf: 'flex-start' }}>Send to All</Button>
          </Box>
        </Box>
      )}

      {/* Send Dialog */}
      <Dialog open={sendDialog} onClose={() => setSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Recipient ID" value={sendForm.recipientId} onChange={(e) => setSendForm({ ...sendForm, recipientId: e.target.value })} fullWidth />
            <TextField label="Title" value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })} fullWidth required />
            <TextField label="Body" value={sendForm.body} onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })} fullWidth multiline rows={3} required />
            <TextField select label="Type" value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })} fullWidth>
              {NOTIF_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSend} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Send</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Roles" value={bulkForm.roles} onChange={(e) => setBulkForm({ ...bulkForm, roles: typeof e.target.value === 'string' ? [e.target.value] : e.target.value })} fullWidth SelectProps={{ multiple: true }}>
              {availableRoles.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <TextField label="Title" value={bulkForm.title} onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })} fullWidth required />
            <TextField label="Body" value={bulkForm.body} onChange={(e) => setBulkForm({ ...bulkForm, body: e.target.value })} fullWidth multiline rows={3} required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleBulk} variant="contained">Send to All</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenterPage;
