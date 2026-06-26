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
import { attendanceApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';

const AttendanceListPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: '', fromDate: '', toDate: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await attendanceApi.list({ page, limit: 20, ...filters });
      setRecords(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await attendanceApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const chartData = stats ? [
    { name: 'Present', value: stats.todayPresent || 0 },
    { name: 'Absent', value: stats.todayAbsent || 0 },
    { name: 'Late', value: stats.todayLate || 0 },
    { name: 'Half Day', value: stats.todayHalfDay || 0 },
  ] : [];

  const columns = [
    { key: 'cleanerId', label: 'Cleaner', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : '-' },
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'checkIn', label: 'Check In', render: (v) => v?.time ? new Date(v.time).toLocaleTimeString() : '-' },
    { key: 'checkOut', label: 'Check Out', render: (v) => v?.time ? new Date(v.time).toLocaleTimeString() : '-' },
    { key: 'summary', label: 'Hours', render: (v) => v?.effectiveWorkingMinutes ? `${Math.round(v.effectiveWorkingMinutes / 60)}h ${v.effectiveWorkingMinutes % 60}m` : '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Attendance Management" subtitle="Track cleaner attendance, check-ins, and working hours" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Present Today', value: stats?.todayPresent, icon: '✅', color: '#059669' },
          { title: 'Absent', value: stats?.todayAbsent, icon: '❌', color: '#DC2626' },
          { title: 'Late', value: stats?.todayLate, icon: '⏰', color: '#D97706' },
          { title: 'Half Day', value: stats?.todayHalfDay, icon: '🌗', color: '#8B5CF6' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      {chartData.some(d => d.value > 0) && (
        <Box sx={{ mb: 3, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E5E7EB', p: 3 }}>
          <Box sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Today's Attendance</Box>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ReTooltip />
              <Legend />
              <Bar dataKey="value" fill="#0D5BD7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField type="date" size="small" label="From" value={filters.fromDate} onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
        <TextField type="date" size="small" label="To" value={filters.toDate} onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
        <TextField select size="small" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} sx={{ minWidth: 130 }}>
          <MenuItem value="">All Status</MenuItem>
          {['present', 'absent', 'late', 'half-day', 'leave'].map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
        </TextField>
      </Box>

      <DataTable columns={columns} rows={records} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No attendance records found" emptyIcon="📅" />

      {/* Detail Dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Attendance Detail</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Cleaner</Box><Box sx={{ fontWeight: 600 }}>{detail.cleanerId?.firstName} {detail.cleanerId?.lastName}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Date</Box><Box sx={{ fontWeight: 600 }}>{detail.date ? new Date(detail.date).toLocaleDateString() : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Status</Box><StatusChip status={detail.status} /></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Check In</Box><Box sx={{ fontWeight: 600 }}>{detail.checkIn?.time ? new Date(detail.checkIn.time).toLocaleTimeString() : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Check Out</Box><Box sx={{ fontWeight: 600 }}>{detail.checkOut?.time ? new Date(detail.checkOut.time).toLocaleTimeString() : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Late By</Box><Box sx={{ fontWeight: 600 }}>{detail.checkIn?.lateMinutes ? `${detail.checkIn.lateMinutes} min` : 'On time'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Working Hours</Box><Box sx={{ fontWeight: 600 }}>{detail.summary?.effectiveWorkingMinutes ? `${Math.round(detail.summary.effectiveWorkingMinutes / 60)}h ${detail.summary.effectiveWorkingMinutes % 60}m` : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Overtime</Box><Box sx={{ fontWeight: 600 }}>{detail.summary?.overtimeMinutes ? `${detail.summary.overtimeMinutes}m` : 'None'}</Box></Grid>
                {detail.checkIn?.location?.coordinates && <Grid item xs={12}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Location</Box><Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{detail.checkIn.location.coordinates.join(', ')}</Box></Grid>}
              </Grid>
            </DialogContent>
            <DialogActions><Button onClick={() => setDetail(null)} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AttendanceListPage;
