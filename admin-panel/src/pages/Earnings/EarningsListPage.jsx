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
import { earningsApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const EarningsListPage = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ paymentStatus: '', periodType: '', fromDate: '', toDate: '' });
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await earningsApi.list({ page, limit: 20, ...filters });
      setEarnings(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await earningsApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const columns = [
    { key: 'cleanerId', label: 'Cleaner', render: (v) => v ? `${v.firstName || ''} ${v.lastName || ''}` : '-' },
    { key: 'taskId', label: 'Task', render: (v) => v?.taskId || '-' },
    { key: 'baseAmount', label: 'Base Amount', render: (v) => <Box sx={{ fontWeight: 600 }}>₹{(v || 0).toLocaleString()}</Box> },
    { key: 'incentiveAmount', label: 'Incentive', render: (v) => <Box sx={{ color: v ? '#059669' : '#9CA3AF' }}>{v ? `₹${v.toLocaleString()}` : '-'}</Box> },
    { key: 'netAmount', label: 'Net Amount', render: (v) => <Box sx={{ fontWeight: 700 }}>₹{(v || 0).toLocaleString()}</Box> },
    { key: 'periodType', label: 'Period', render: (v) => <Chip label={v || '-'} size="small" variant="outlined" /> },
    { key: 'paymentStatus', label: 'Status', render: (v) => <StatusChip status={v || 'pending'} /> },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => setDetail(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Earnings Management" subtitle="Track cleaner earnings, commissions, and payouts" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Earnings', value: stats?.totalEarnings, icon: '💰', color: '#0D5BD7' },
          { title: 'Total Amount', value: stats?.totalAmount ? `₹${(stats.totalAmount).toLocaleString()}` : '₹0', icon: '💵', color: '#059669' },
          { title: 'Pending', value: stats?.pending, icon: '⏳', color: '#D97706' },
          { title: 'Paid', value: stats?.paid, icon: '✅', color: '#059669' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField type="date" size="small" label="From" value={filters.fromDate} onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
        <TextField type="date" size="small" label="To" value={filters.toDate} onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
        <TextField select size="small" value={filters.periodType} onChange={(e) => setFilters(f => ({ ...f, periodType: e.target.value }))} sx={{ minWidth: 120 }}>
          <MenuItem value="">All Periods</MenuItem>
          {['daily', 'weekly', 'monthly'].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={filters.paymentStatus} onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))} sx={{ minWidth: 130 }}>
          <MenuItem value="">All Status</MenuItem>
          {['pending', 'processed', 'paid', 'failed'].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
        </TextField>
      </Box>

      <DataTable columns={columns} rows={earnings} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No earnings records found" emptyIcon="💰" />

      {/* Detail Dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Earnings Detail</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Cleaner</Box><Box sx={{ fontWeight: 600 }}>{detail.cleanerId?.firstName} {detail.cleanerId?.lastName}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Task</Box><Box sx={{ fontWeight: 600 }}>{detail.taskId?.taskId || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Base Amount</Box><Box sx={{ fontWeight: 600 }}>₹{(detail.baseAmount || 0).toLocaleString()}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Incentive</Box><Box sx={{ fontWeight: 600, color: '#059669' }}>{detail.incentiveAmount ? `₹${detail.incentiveAmount.toLocaleString()}` : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Deductions</Box><Box sx={{ fontWeight: 600, color: '#DC2626' }}>{detail.deductionAmount ? `₹${detail.deductionAmount.toLocaleString()}` : '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Net Amount</Box><Box sx={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{(detail.netAmount || 0).toLocaleString()}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Period</Box><Box sx={{ fontWeight: 600 }}>{detail.periodType || '-'}</Box></Grid>
                <Grid item xs={6}><Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Payment Status</Box><StatusChip status={detail.paymentStatus || 'pending'} /></Grid>
              </Grid>
            </DialogContent>
            <DialogActions><Button onClick={() => setDetail(null)} variant="outlined">Close</Button></DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EarningsListPage;
