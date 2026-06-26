import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

import { reportsApi, getAssetUrl } from '../../services/api';
import { exportToCSV, flattenForExport } from '../../utils/export';
import PageHeader from '../../components/PageHeader';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BadgeIcon from '@mui/icons-material/Badge';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import StorefrontIcon from '@mui/icons-material/Storefront';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
const DONUT_COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#E5E7EB'];
const STATUS_COLORS = {
  completed: '#22C55E', cancelled: '#EF4444', booked: '#2563EB', accepted: '#F59E0B',
  in_progress: '#8B5CF6', active: '#22C55E', expired: '#F59E0B', none: '#E5E7EB',
};

const PERIOD_PRESETS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '365d', label: '1 Year' },
  { value: 'custom', label: 'Custom' },
];

const SkeletonChart = () => (
  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 2 }} />
  </Box>
);

const ReportStatCard = ({ title, value, subtitle, color = '#2563EB', icon, loading, format = 'number', subvalue }) => {
  const displayValue = format === 'currency'
    ? `₹${(value || 0).toLocaleString()}`
    : format === 'percent'
      ? `${value || 0}%`
      : typeof value === 'number' ? value.toLocaleString() : value || '—';

  return (
    <Card sx={{
      borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%',
      transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
    }}>
      <CardContent sx={{ p: 2.5 }}>
        {loading ? (
          <Box><Skeleton variant="text" width={100} height={18} /><Skeleton variant="text" width={80} height={36} sx={{ mt: 0.5 }} /></Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mt: 0.5, fontSize: '1.5rem' }}>
                {displayValue}
              </Typography>
              {subtitle && <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.25, display: 'block' }}>{subtitle}</Typography>}
              {subvalue !== undefined && (
                <Typography variant="caption" sx={{ color, fontWeight: 600, mt: 0.25, display: 'block' }}>{subvalue}</Typography>
              )}
            </Box>
            {icon && (
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 2, p: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, mb: 0.5, display: 'block' }}>{label}</Typography>
        {payload.map((entry, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>{entry.name}:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827' }}>
              {typeof entry.value === 'number' ? `₹${entry.value.toLocaleString()}` : entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

// ─── Date Range Picker Component ───
const DateRangePicker = ({ from, to, onChange, presets = PERIOD_PRESETS }) => {
  const [activePreset, setActivePreset] = useState('7d');

  const handlePreset = (value) => {
    setActivePreset(value);
    if (value === 'custom') return;
    const days = parseInt(value.replace('d', ''));
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onChange(from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {presets.map(p => (
          <Chip
            key={p.value}
            label={p.label}
            size="small"
            onClick={() => handlePreset(p.value)}
            sx={{
              fontWeight: 600, fontSize: '0.7rem', height: 28,
              bgcolor: activePreset === p.value ? '#2563EB' : '#F3F4F6',
              color: activePreset === p.value ? '#FFFFFF' : '#6B7280',
              '&:hover': { bgcolor: activePreset === p.value ? '#1D4ED8' : '#E5E7EB' },
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField type="date" size="small" value={from}
          onChange={e => { setActivePreset('custom'); onChange(e.target.value, to); }}
          sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem', borderRadius: 2, height: 32 } }}
        />
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>to</Typography>
        <TextField type="date" size="small" value={to}
          onChange={e => { setActivePreset('custom'); onChange(from, e.target.value); }}
          sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem', borderRadius: 2, height: 32 } }}
        />
      </Box>
    </Box>
  );
};

// ────────────────────────────────────────
// Summary Tab
// ────────────────────────────────────────
const SummaryTab = ({ data, loading }) => {
  const s = data?.summary || data;
  if (!s) return <SkeletonChart />;

  const kpis = [
    { title: 'Total Revenue', value: s.revenue?.total, icon: <PaymentsIcon />, color: '#2563EB', format: 'currency', subtitle: `Today: ₹${(s.revenue?.today || 0).toLocaleString()}` },
    { title: 'Total Bookings', value: s.bookings?.total, icon: <BookOnlineIcon />, color: '#22C55E', subtitle: `${s.bookings?.completed || 0} completed · ${s.bookings?.cancelled || 0} cancelled` },
    { title: 'Active Customers', value: s.customers?.total, icon: <PeopleIcon />, color: '#F59E0B', subtitle: `${s.customers?.new || 0} new this period` },
    { title: 'Active Subscriptions', value: s.subscriptions?.active, icon: <SubscriptionsIcon />, color: '#8B5CF6', subtitle: `${s.subscriptions?.expired || 0} expired · ${s.subscriptions?.cancelled || 0} cancelled` },
    { title: 'Total Cleaners', value: s.cleaners?.total, icon: <BadgeIcon />, color: '#06B6D4', subvalue: `${s.cleaners?.active || 0} active · ${s.cleaners?.verified || 0} verified` },
    { title: 'Franchise Partners', value: s.franchises?.total, icon: <StorefrontIcon />, color: '#EC4899', subvalue: `${s.franchises?.verified || 0} verified` },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <ReportStatCard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>
            📊 Business Snapshot
          </Typography>
          {loading ? <SkeletonChart /> : (
            <Grid container spacing={2}>
              {[
                { label: 'Customers', total: s.customers?.total, active: s.customers?.total, pending: s.customers?.new, color: '#2563EB' },
                { label: 'Cleaners', total: s.cleaners?.total, active: s.cleaners?.active, pending: s.cleaners?.pending, verified: s.cleaners?.verified, color: '#06B6D4' },
                { label: 'Subscriptions', total: s.subscriptions?.total, active: s.subscriptions?.active, expired: s.subscriptions?.expired, cancelled: s.subscriptions?.cancelled, color: '#8B5CF6' },
                { label: 'Franchises', total: s.franchises?.total, active: s.franchises?.verified, pending: s.franchises?.pending, color: '#EC4899' },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>{item.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', my: 0.5 }}>{item.total || 0}</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip label={`Active: ${item.active || 0}`} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: `${item.color}12`, color: item.color, height: 22, borderRadius: '6px' }} />
                      {item.pending !== undefined && <Chip label={`New: ${item.pending || 0}`} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: '#FEF3C7', color: '#D97706', height: 22, borderRadius: '6px' }} />}
                      {item.verified !== undefined && <Chip label={`Verified: ${item.verified || 0}`} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: `${item.color}12`, color: item.color, height: 22, borderRadius: '6px' }} />}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ────────────────────────────────────────
// Revenue Tab
// ────────────────────────────────────────
const RevenueTab = ({ data, loading, onRefresh }) => {
  const r = data?.revenue;
  if (!r) return <SkeletonChart />;

  const summary = r.summary || {};
  const chartData = r.timeSeries || [];
  const methodData = r.byMethod || [];
  const purposeData = r.byPurpose || [];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Total Revenue" value={summary.total} icon={<PaymentsIcon />} color="#2563EB" format="currency" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Net Revenue" value={summary.net} icon={<PaymentsIcon />} color="#22C55E" format="currency" loading={loading} subtitle={`After refunds`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Total Refunded" value={summary.refunded} icon={<PaymentsIcon />} color="#EF4444" format="currency" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Avg. Transaction" value={summary.average} icon={<PaymentsIcon />} color="#F59E0B" format="currency" loading={loading} subtitle={`${summary.count || 0} transactions`} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Revenue Time Series */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>📈 Revenue Trend</Typography>
              {loading ? <SkeletonChart /> : chartData.length === 0 ? (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" sx={{ color: '#9CA3AF' }}>No revenue data in this period</Typography></Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2.5} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Purpose */}
        <Grid item xs={12} sm={6} lg={2.5}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>🎯 By Purpose</Typography>
              {loading ? <SkeletonChart /> : purposeData.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF' }}>No data</Typography></Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={purposeData} dataKey="revenue" nameKey="purpose" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {purposeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                    {purposeData.slice(0, 5).map((d, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: COLORS[i % COLORS.length] }} />
                          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem', textTransform: 'capitalize' }}>{d.purpose?.replace(/_/g, ' ')}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.7rem' }}>₹{(d.revenue || 0).toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Method */}
        <Grid item xs={12} sm={6} lg={2.5}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>💳 By Method</Typography>
              {loading ? <SkeletonChart /> : methodData.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF' }}>No data</Typography></Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={methodData} dataKey="revenue" nameKey="method" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {methodData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                    {methodData.map((d, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: COLORS[(i + 3) % COLORS.length] }} />
                          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>{d.method || 'Unknown'}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.7rem' }}>₹{(d.revenue || 0).toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ────────────────────────────────────────
// Bookings Tab
// ────────────────────────────────────────
const BookingsTab = ({ data, loading }) => {
  const b = data?.bookings;
  if (!b) return <SkeletonChart />;

  const summary = b.summary || {};
  const chartData = b.timeSeries || [];
  const statusData = b.statusBreakdown || [];
  const popularServices = b.popularServices || [];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Total Bookings" value={summary.total} icon={<BookOnlineIcon />} color="#2563EB" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Completed" value={summary.completed} icon={<BookOnlineIcon />} color="#22C55E" loading={loading} subtitle={`${summary.completionRate || 0}% completion rate`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Cancelled" value={summary.cancelled} icon={<BookOnlineIcon />} color="#EF4444" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Popular Service" value={popularServices[0]?.service || '—'} icon={<BookOnlineIcon />} color="#F59E0B" loading={loading} subtitle={popularServices[0] ? `${popularServices[0].bookings} bookings` : ''} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>📊 Booking Trends</Typography>
              {loading ? <SkeletonChart /> : chartData.length === 0 ? (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" sx={{ color: '#9CA3AF' }}>No booking data in this period</Typography></Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <ReTooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="completed" stackId="a" fill="#22C55E" name="Completed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                    <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.5}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>📌 Status</Typography>
              {loading ? <SkeletonChart /> : statusData.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF' }}>No data</Typography></Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {statusData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.status] || DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {statusData.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[d.status] || DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem', textTransform: 'capitalize' }}>{d.status?.replace(/_/g, ' ')}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.7rem' }}>{d.count}</Typography>
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.5}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>🏆 Popular Services</Typography>
              {loading ? <SkeletonChart /> : popularServices.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF' }}>No data</Typography></Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {popularServices.slice(0, 6).map((s, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: i < Math.min(popularServices.length, 6) - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS[i % COLORS.length], fontSize: '0.7rem' }}>#{i + 1}</Typography>
                        <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.72rem' }}>{s.service}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.7rem', display: 'block' }}>{s.bookings}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.62rem' }}>₹{(s.revenue || 0).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ────────────────────────────────────────
// Cleaners Tab
// ────────────────────────────────────────
const CleanersTab = ({ data, loading }) => {
  const c = data?.cleaners;
  if (!c) return <SkeletonChart />;

  const summary = c.summary || {};
  const cleaners = c.cleaners || [];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Total Cleaners" value={summary.totalCleaners} icon={<BadgeIcon />} color="#2563EB" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Total Earnings" value={summary.totalEarnings} icon={<BadgeIcon />} color="#22C55E" format="currency" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Avg. Rating" value={summary.averageRating} icon={<BadgeIcon />} color="#F59E0B" format="percent" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard title="Top Performer" value={cleaners[0]?.name || '—'} icon={<BadgeIcon />} color="#8B5CF6" loading={loading} subtitle={cleaners[0] ? `₹${(cleaners[0].earnings || 0).toLocaleString()}` : ''} />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? <SkeletonChart /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['#', 'Cleaner', 'ID', 'Zone', 'Jobs', 'Rating', 'Earnings', 'Attendance'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.7rem', bgcolor: '#F9FAFB', py: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cleaners.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#9CA3AF' }}>No cleaner data available</TableCell></TableRow>
                  ) : cleaners.slice(0, 20).map((cleaner, idx) => (
                    <TableRow key={cleaner._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS[idx % COLORS.length], fontSize: '0.65rem', fontWeight: 700 }}>
                            {cleaner.name?.charAt(0) || 'C'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8rem' }}>{cleaner.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{cleaner.cleanerId || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{cleaner.zone}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8rem' }}>{cleaner.completedJobs}</TableCell>
                      <TableCell>
                        <Chip label={`⭐ ${cleaner.rating?.toFixed(1) || '0.0'}`} size="small" sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#FFFBEB', color: '#D97706', borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#22C55E', fontSize: '0.8rem' }}>₹{(cleaner.earnings || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: '#F3F4F6', overflow: 'hidden' }}>
                            <Box sx={{ width: `${Math.min(cleaner.attendancePercent || 0, 100)}%`, height: '100%', bgcolor: (cleaner.attendancePercent || 0) >= 80 ? '#22C55E' : '#F59E0B', borderRadius: 2 }} />
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#6B7280' }}>{cleaner.attendancePercent || 0}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ────────────────────────────────────────
// Customers Tab
// ────────────────────────────────────────
const CustomersTab = ({ data, loading }) => {
  const c = data?.customers;
  if (!c) return <SkeletonChart />;

  const growthData = c.growth || [];
  const subscriptions = c.subscriptions || [];
  const topCustomers = c.topCustomers || [];

  return (
    <Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>📈 Customer Growth</Typography>
              {loading ? <SkeletonChart /> : growthData.length === 0 ? (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" sx={{ color: '#9CA3AF' }}>No customer data</Typography></Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={growthData}>
                    <defs><linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <ReTooltip />
                    <Area type="monotone" dataKey="newCustomers" stroke="#8B5CF6" fill="url(#custGrad)" strokeWidth={2.5} name="New Customers" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>📊 Subscription Status</Typography>
              {loading ? <SkeletonChart /> : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={subscriptions} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                        {subscriptions.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.status] || DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {subscriptions.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[d.status] || DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem', textTransform: 'capitalize' }}>{d.status || 'None'}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.7rem' }}>{d.count}</Typography>
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2, fontSize: '0.95rem' }}>🏅 Top Customers</Typography>
              {loading ? <SkeletonChart /> : topCustomers.length === 0 ? (
                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF' }}>No data</Typography></Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {topCustomers.slice(0, 8).map((customer, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: i < Math.min(topCustomers.length, 8) - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS[i % COLORS.length], fontSize: '0.65rem' }}>#{i + 1}</Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, fontSize: '0.72rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{customer.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6rem' }}>{customer.phone}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#22C55E', fontSize: '0.7rem', display: 'block' }}>₹{(customer.totalSpent || 0).toLocaleString()}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6rem' }}>{customer.totalBookings || 0} bookings</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============================================================
// MAIN REPORTS PAGE
// ============================================================
const ReportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [exporting, setExporting] = useState(false);

  const TAB_KEYS = ['summary', 'revenue', 'bookings', 'cleaners', 'customers'];

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate: dateFrom, endDate: dateTo };

      const [summary, revenue, bookings, cleaners, customers] = await Promise.allSettled([
        reportsApi.getSummary(params),
        reportsApi.getRevenue({ ...params, groupBy: 'day' }),
        reportsApi.getBookings({ ...params, groupBy: 'day' }),
        reportsApi.getCleaners(params),
        reportsApi.getCustomers({ ...params, groupBy: 'day' }),
      ]);

      setReportData({
        summary: summary.value?.data || summary.value,
        revenue: revenue.value?.data || revenue.value,
        bookings: bookings.value?.data || bookings.value,
        cleaners: cleaners.value?.data || cleaners.value,
        customers: customers.value?.data || customers.value,
      });
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDateChange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleExport = async () => {
    const reportType = TAB_KEYS[tab];
    if (reportType === 'summary') {
      // Summary is a KPI overview — export as a single-row CSV
      const s = reportData.summary || {};
      const cols = [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ];
      const rows = [
        { metric: 'Total Revenue', value: `₹${((s.revenue?.total || 0)).toLocaleString()}` },
        { metric: 'Total Bookings', value: (s.bookings?.total || 0).toLocaleString() },
        { metric: 'Completed Bookings', value: (s.bookings?.completed || 0).toLocaleString() },
        { metric: 'Active Customers', value: (s.customers?.total || 0).toLocaleString() },
        { metric: 'Active Subscriptions', value: (s.subscriptions?.active || 0).toLocaleString() },
        { metric: 'Total Cleaners', value: (s.cleaners?.total || 0).toLocaleString() },
        { metric: 'Franchise Partners', value: (s.franchises?.total || 0).toLocaleString() },
      ];
      exportToCSV(rows, cols, `summary-report-${dateFrom}-to-${dateTo}`);
      return;
    }

    setExporting(true);
    try {
      const params = { startDate: dateFrom, endDate: dateTo };
      const res = await reportsApi.getExportData(reportType, params);
      const data = res?.data || [];

      if (!data.length) {
        console.warn('No data to export');
        return;
      }

      const columnDefs = Object.keys(data[0]).map(k => ({ key: k, label: k }));
      exportToCSV(data, columnDefs, `${reportType}-report-${dateFrom}-to-${dateTo}`);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const renderTabContent = () => {
    switch (tab) {
      case 0: return <SummaryTab data={reportData} loading={loading} />;
      case 1: return <RevenueTab data={reportData} loading={loading} onRefresh={fetchReports} />;
      case 2: return <BookingsTab data={reportData} loading={loading} />;
      case 3: return <CleanersTab data={reportData} loading={loading} />;
      case 4: return <CustomersTab data={reportData} loading={loading} />;
      default: return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export comprehensive business reports"
      />

      {/* Date Range + Export Controls */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <DateRangePicker from={dateFrom} to={dateTo} onChange={handleDateChange} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Refresh data">
              <IconButton size="small" onClick={fetchReports} sx={{ bgcolor: '#F3F4F6', borderRadius: 2 }}>
                <RefreshIcon fontSize="small" sx={{ color: '#6B7280' }} />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              disabled={exporting}
              sx={{ borderRadius: 2, fontSize: '0.75rem', borderColor: '#E5E7EB', color: '#374151', whiteSpace: 'nowrap' }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB', px: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', color: '#6B7280', minHeight: 48, '&.Mui-selected': { color: '#2563EB' } },
              '& .MuiTabs-indicator': { backgroundColor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {['📊 Summary', '💰 Revenue', '📋 Bookings', '🧹 Cleaners', '👥 Customers'].map(label => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ p: 2.5 }}>
          {renderTabContent()}
        </Box>
      </Card>
    </Box>
  );
};

export default ReportsPage;
