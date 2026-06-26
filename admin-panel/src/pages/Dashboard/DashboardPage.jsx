import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import PeopleIcon from '@mui/icons-material/People';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PaymentsIcon from '@mui/icons-material/Payments';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SortIcon from '@mui/icons-material/Sort';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

import dashboardApi from '../../services/dashboard.service';

// ─── Design Tokens ───
const PRIMARY   = '#2563EB';
const SUCCESS   = '#22C55E';
const WARNING   = '#F59E0B';
const DANGER    = '#EF4444';
const PURPLE    = '#8B5CF6';
const CYAN      = '#06B6D4';
const PINK      = '#EC4899';
const LIME      = '#84CC16';
const TEXT_PRIMARY   = '#111827';
const TEXT_SECONDARY = '#6B7280';
const BORDER    = '#E5E7EB';
const BG_LIGHT  = '#F9FAFB';

const CHART_COLORS = [PRIMARY, SUCCESS, WARNING, DANGER, PURPLE, PINK, CYAN, LIME];
const PERIODS = [
  { value: '7d',  label: '7D'  },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y',  label: '1Y'  },
];

// ─── Helper: format numbers ───
const fmt = (n) => (n || 0).toLocaleString('en-IN');
const fmtCur = (n) => `₹${fmt(n)}`;
const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getDate()} ${date.toLocaleString('en', { month: 'short' })}`;
};

// ─── Debounce ───
function useDebounce(value, delay = 400) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ─── CustomTooltip ───
const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 2, p: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: 140 }}>
      <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 600, mb: 0.5, display: 'block' }}>{label}</Typography>
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>{entry.name}:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: TEXT_PRIMARY }}>
            {currency ? fmtCur(entry.value) : fmt(entry.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── KPI Card ───
const KpiCard = ({ title, value, growth, icon, color, loading, format = 'number', onClick, subtitle }) => {
  const isPositive = (growth || 0) >= 0;
  const displayValue = format === 'currency' ? fmtCur(value) : fmt(value);
  return (
    <Card onClick={onClick} sx={{
      borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: '100%', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
      '&:hover': onClick ? { boxShadow: `0 8px 24px ${color}22`, transform: 'translateY(-2px)', borderColor: `${color}44` } : {},
    }}>
      <CardContent sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <>
            <Skeleton variant="text" width={100} height={18} />
            <Skeleton variant="text" width={140} height={44} sx={{ mt: 1 }} />
            <Skeleton variant="text" width={90} height={16} sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            {/* Decorative gradient blob */}
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', bgcolor: `${color}08` }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500, fontSize: '0.8rem', mb: 0.75 }}>
                  {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: TEXT_PRIMARY, fontSize: '1.75rem', lineHeight: 1.2, mb: 0.75 }}>
                  {displayValue}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                    {subtitle}
                  </Typography>
                )}
                {growth !== undefined && growth !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: isPositive ? SUCCESS : DANGER, bgcolor: isPositive ? '#F0FDF4' : '#FEF2F2', borderRadius: '6px', px: 0.75, py: 0.25 }}>
                      {isPositive ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                        {isPositive ? '+' : ''}{growth}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.68rem' }}>vs yesterday</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ width: 52, height: 52, borderRadius: '16px', bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}20` }}>
                {React.cloneElement(icon, { sx: { fontSize: 26, color } })}
              </Box>
            </Box>
            {onClick && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: '0.7rem' }}>View Details</Typography>
                <OpenInNewIcon sx={{ fontSize: 12, color }} />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Platform Overview Card ───
const PlatformCard = ({ title, data, icon, color, loading, onClick, path }) => {
  const rows = [
    { label: 'Total',    value: data?.total,    color: TEXT_PRIMARY },
    { label: 'Active',   value: data?.active,   color: SUCCESS },
    { label: 'Pending',  value: data?.pending,  color: WARNING },
    { label: 'Inactive', value: data?.inactive, color: TEXT_SECONDARY },
    ...(data?.verified  !== undefined ? [{ label: 'Verified',  value: data?.verified,  color: SUCCESS }] : []),
    ...(data?.rejected  !== undefined ? [{ label: 'Rejected',  value: data?.rejected,  color: DANGER  }] : []),
  ].filter(r => r.value !== undefined);

  return (
    <Card onClick={onClick} sx={{
      borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: '100%', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
      '&:hover': onClick ? { boxShadow: `0 8px 24px ${color}22`, borderColor: `${color}44` } : {},
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.88rem' }}>{title}</Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20` }}>
            {React.cloneElement(icon, { sx: { fontSize: 18, color } })}
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} variant="text" width="100%" height={20} />)}
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {rows.map(r => (
                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.73rem' }}>{r.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: r.color, fontSize: '0.8rem' }}>{r.value ?? 0}</Typography>
                </Box>
              ))}
            </Box>
            {onClick && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: '0.68rem' }}>Manage →</Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Activity type config ───
const activityConfig = {
  booking:   { color: PRIMARY,  label: 'Booking'  },
  payment:   { color: SUCCESS,  label: 'Payment'  },
  complaint: { color: DANGER,   label: 'Complaint' },
  cleaner:   { color: PURPLE,   label: 'Cleaner'  },
  customer:  { color: CYAN,     label: 'Customer' },
  audit:     { color: TEXT_SECONDARY, label: 'Audit' },
  default:   { color: WARNING,  label: 'Event'    },
};

const DashboardPage = () => {
  const navigate = useNavigate();

  // ─── State ───
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [data,          setData]          = useState(null);
  const [lastUpdated,   setLastUpdated]   = useState(null);

  // Chart periods
  const [revPeriod,     setRevPeriod]     = useState('7d');
  const [revData,       setRevData]       = useState([]);
  const [revLoading,    setRevLoading]    = useState(false);

  const [bkgPeriod,     setBkgPeriod]     = useState('7d');
  const [bkgData,       setBkgData]       = useState([]);
  const [bkgLoading,    setBkgLoading]    = useState(false);

  const [custPeriod,    setCustPeriod]    = useState('7d');
  const [custData,      setCustData]      = useState({ new: 0, active: 0, inactive: 0 });

  // Top cleaners
  const [cleanerPage,   setCleanerPage]   = useState(1);
  const [cleanerSort,   setCleanerSort]   = useState('earnings');
  const [cleanerOrder,  setCleanerOrder]  = useState('desc');
  const [cleanerSearch, setCleanerSearch] = useState('');
  const dSearch = useDebounce(cleanerSearch, 400);
  const [topCleaners,   setTopCleaners]   = useState([]);
  const [cleanerPag,    setCleanerPag]    = useState({ total: 0, pages: 0 });
  const [cleanerLoading,setCleanerLoading] = useState(false);

  // ─── Fetch helpers ───
  const fetchMain = useCallback(async () => {
    try {
      // Interceptor already unwraps response.data → {success, data: {...}}
      const res = await dashboardApi.getAll();
      const d = res?.data || res;
      setData(d);
      setLastUpdated(new Date());
      setError(null);
      return d;
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
      return null;
    }
  }, []);

  const fetchRevenue = useCallback(async (period) => {
    setRevLoading(true);
    try {
      const res = await dashboardApi.getRevenue(period);
      const d = res?.data || res;
      setRevData(d?.chart || []);
    } catch {}
    finally { setRevLoading(false); }
  }, []);

  const fetchBookings = useCallback(async (period) => {
    setBkgLoading(true);
    try {
      const res = await dashboardApi.getBookings(period);
      const d = res?.data || res;
      setBkgData(d?.chart || []);
    } catch {}
    finally { setBkgLoading(false); }
  }, []);

  const fetchCustomers = useCallback(async (period) => {
    try {
      const res = await dashboardApi.getCustomers(period);
      const d = res?.data || res;
      setCustData({ new: d?.newCustomers || 0, active: d?.activeCustomers || 0, inactive: d?.inactiveCustomers || 0 });
    } catch {}
  }, []);

  const fetchTopCleaners = useCallback(async (page, sort, order, search) => {
    setCleanerLoading(true);
    try {
      const res = await dashboardApi.getTopCleaners({ page, limit: 8, sort, order, search });
      const d = res?.data || res;
      setTopCleaners(d?.cleaners || []);
      setCleanerPag(d?.pagination || { total: 0, pages: 0 });
    } catch { setTopCleaners([]); }
    finally { setCleanerLoading(false); }
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMain();
      await Promise.all([
        fetchRevenue('7d'),
        fetchBookings('7d'),
        fetchCustomers('7d'),
        fetchTopCleaners(1, 'earnings', 'desc', ''),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchMain, fetchRevenue, fetchBookings, fetchCustomers, fetchTopCleaners]);

  // Refresh charts when period changes
  useEffect(() => { fetchRevenue(revPeriod); }, [revPeriod, fetchRevenue]);
  useEffect(() => { fetchBookings(bkgPeriod); }, [bkgPeriod, fetchBookings]);
  useEffect(() => { fetchCustomers(custPeriod); }, [custPeriod, fetchCustomers]);

  // Refresh cleaner table
  useEffect(() => {
    fetchTopCleaners(cleanerPage, cleanerSort, cleanerOrder, dSearch);
  }, [cleanerPage, cleanerSort, cleanerOrder, dSearch, fetchTopCleaners]);

  // ─── Derived data ───
  const kpi         = useMemo(() => data?.kpiCards       || {}, [data]);
  const secondary   = useMemo(() => data?.secondaryCards || {}, [data]);
  const activities  = useMemo(() => data?.recentActivities || [], [data]);
  const approvals   = useMemo(() => data?.pendingApprovals || [], [data]);
  const custGrowth  = useMemo(() => data?.charts?.customerGrowth || custData, [data, custData]);

  // ─── Refresh all ───
  const handleRefresh = async () => {
    setLoading(true);
    await fetchMain();
    await Promise.all([fetchRevenue(revPeriod), fetchBookings(bkgPeriod), fetchCustomers(custPeriod), fetchTopCleaners(cleanerPage, cleanerSort, cleanerOrder, dSearch)]);
    setLoading(false);
  };

  // ─── Period toggle style ───
  const toggleSx = {
    '& .MuiToggleButton-root': {
      border: `1px solid ${BORDER}`, color: TEXT_SECONDARY, fontSize: '0.68rem',
      fontWeight: 600, px: 1.25, py: 0.375, minWidth: 36, lineHeight: 1.4,
      '&.Mui-selected': { bgcolor: PRIMARY, color: '#fff', borderColor: PRIMARY, '&:hover': { bgcolor: '#1D4ED8' } },
    },
  };

  // ─── Render ───
  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: TEXT_PRIMARY, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mt: 0.25 }}>
            Real-time overview of your platform performance
            {lastUpdated && (
              <Typography component="span" sx={{ color: '#9CA3AF', fontSize: '0.7rem', ml: 1 }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label="● Live"
            size="small"
            sx={{ bgcolor: '#F0FDF4', color: SUCCESS, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${SUCCESS}30` }}
          />
          <Tooltip title="Refresh all data">
            <IconButton size="small" onClick={handleRefresh}
              sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, p: 0.75, color: TEXT_SECONDARY, '&:hover': { borderColor: PRIMARY, color: PRIMARY } }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Error ── */}
      {error && (
        <Card sx={{ borderRadius: 3, border: '1px solid #FEE2E2', bgcolor: '#FEF2F2', mb: 3, boxShadow: 'none' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
            <ErrorOutlineIcon sx={{ color: DANGER, fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: DANGER }}>Failed to load dashboard data</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{error}</Typography>
            </Box>
            <Button variant="contained" size="small" onClick={handleRefresh}
              sx={{ bgcolor: DANGER, borderRadius: 2, boxShadow: 'none' }}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* ── KPI Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            title: 'Total Customers', icon: <PeopleIcon />, color: PRIMARY,
            value: kpi?.totalCustomers?.value, growth: kpi?.totalCustomers?.growth,
            subtitle: `${fmt(kpi?.totalCustomers?.today || 0)} new today`,
            onClick: () => navigate('/customers'),
          },
          {
            title: 'Active Subscriptions', icon: <SubscriptionsIcon />, color: SUCCESS,
            value: kpi?.activeSubscriptions?.value, growth: kpi?.activeSubscriptions?.growth,
            subtitle: `${fmt(kpi?.activeSubscriptions?.trial || 0)} on trial`,
            onClick: () => navigate('/subscriptions'),
          },
          {
            title: 'Total Bookings', icon: <BookOnlineIcon />, color: WARNING,
            value: kpi?.totalBookings?.value, growth: kpi?.totalBookings?.growth,
            subtitle: `${fmt(kpi?.totalBookings?.today || 0)} today`,
            onClick: () => navigate('/bookings'),
          },
          {
            title: 'Total Revenue', icon: <PaymentsIcon />, color: '#059669', format: 'currency',
            value: kpi?.totalRevenue?.value, growth: kpi?.totalRevenue?.growth,
            subtitle: `Today: ${fmtCur(kpi?.totalRevenue?.today || 0)}`,
            onClick: () => navigate('/payments'),
          },
        ].map((card, i) => (
          <Grid key={i} item xs={12} sm={6} lg={3}>
            <KpiCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Platform Overview ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '1rem' }}>
          Platform Overview
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.72rem' }}>
          Click any card to manage
        </Typography>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { title: 'Car Cleaners',      data: secondary?.cleaners,          icon: <BadgeIcon />,             color: PRIMARY,  onClick: () => navigate('/cleaners')       },
          { title: 'Supervisors',       data: secondary?.supervisors,       icon: <SupervisorAccountIcon />, color: PURPLE,   onClick: () => navigate('/supervisors')    },
          { title: 'NCSP Partners',     data: secondary?.ncspPartners,      icon: <HandshakeIcon />,         color: CYAN,     onClick: () => navigate('/ncsp')           },
          { title: 'Franchise Partners',data: secondary?.franchisePartners, icon: <StorefrontIcon />,        color: PINK,     onClick: () => navigate('/franchises')     },
          { title: 'Operations Team',   data: secondary?.operationsTeam,    icon: <GroupsIcon />,            color: LIME,     onClick: () => navigate('/operations-team') },
        ].map((card, i) => (
          <Grid key={i} item xs={12} sm={6} md={4} lg={2.4}>
            <PlatformCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts Row ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Revenue Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Revenue Overview</Typography>
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.72rem' }}>
                    Subscription + Booking revenue
                  </Typography>
                </Box>
                <ToggleButtonGroup value={revPeriod} exclusive onChange={(_, v) => v && setRevPeriod(v)} size="small" sx={toggleSx}>
                  {PERIODS.map(p => <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
              {revLoading ? <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} /> :
               revData.length === 0 ? (
                <Box sx={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>No revenue data for this period</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Payments will appear here once captured</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bkgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={SUCCESS} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={SUCCESS} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: TEXT_SECONDARY }} axisLine={false} tickLine={false} tickFormatter={fmtDate} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: TEXT_SECONDARY }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <ReTooltip content={<CustomTooltip currency />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="subscriptionRevenue" stroke={PRIMARY} fill="url(#subGrad)" name="Subscription" strokeWidth={2.5} dot={false} />
                    <Area type="monotone" dataKey="bookingRevenue" stroke={SUCCESS} fill="url(#bkgGrad)" name="Booking" strokeWidth={2.5} dot={false} />
                    {revData.some(d => d.leadRevenue > 0) &&
                      <Area type="monotone" dataKey="leadRevenue" stroke={WARNING} name="Lead" strokeWidth={2} dot={false} />}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Booking Overview</Typography>
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.72rem' }}>
                    Daily booking trends
                  </Typography>
                </Box>
                <ToggleButtonGroup value={bkgPeriod} exclusive onChange={(_, v) => v && setBkgPeriod(v)} size="small" sx={toggleSx}>
                  {PERIODS.map(p => <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
              {bkgLoading ? <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} /> :
               bkgData.length === 0 ? (
                <Box sx={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <BookOnlineIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>No bookings for this period</Typography>
                  <Button size="small" variant="outlined" onClick={() => navigate('/bookings')}
                    sx={{ borderRadius: 2, mt: 1, fontSize: '0.75rem' }}>Create Booking</Button>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={bkgData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: TEXT_SECONDARY }} axisLine={false} tickLine={false} tickFormatter={fmtDate} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: TEXT_SECONDARY }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="completed" fill={SUCCESS} name="Completed" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="pending"   fill={WARNING}  name="Pending"   radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="cancelled" fill={DANGER}   name="Cancelled" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Bottom Row: Customer Growth + Activities + Top Cleaners ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Customer Growth */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Customer Growth</Typography>
                <ToggleButtonGroup value={custPeriod} exclusive onChange={(_, v) => v && setCustPeriod(v)} size="small" sx={toggleSx}>
                  {PERIODS.map(p => <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
              {loading ? <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto', my: 2 }} /> : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active',   value: Math.max(custGrowth?.active   || 0, 1) },
                          { name: 'Inactive', value: Math.max(custGrowth?.inactive || 0, 1) },
                        ]}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        paddingAngle={4} dataKey="value" startAngle={90} endAngle={450}
                      >
                        <Cell fill={SUCCESS} />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                      <ReTooltip formatter={(v, n) => [fmt(v), n]} />
                    </PieChart>
                  </ResponsiveContainer>

                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    {[
                      { label: 'New this period', value: custGrowth?.new     || 0, color: PRIMARY },
                      { label: 'Active',           value: custGrowth?.active  || 0, color: SUCCESS },
                      { label: 'Inactive',         value: custGrowth?.inactive|| 0, color: '#9CA3AF' },
                    ].map(s => (
                      <Grid key={s.label} item xs={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: s.color, fontSize: '1.2rem', lineHeight: 1 }}>{fmt(s.value)}</Typography>
                        <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.65rem', display: 'block', mt: 0.25 }}>{s.label}</Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/customers')}
                    sx={{ mt: 2, borderRadius: 2, fontSize: '0.75rem', borderColor: BORDER, color: TEXT_SECONDARY, '&:hover': { borderColor: PRIMARY, color: PRIMARY } }}>
                    View All Customers →
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Recent Activities</Typography>
                <Button size="small" onClick={() => navigate('/analytics')} sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.72rem', px: 0.5 }}>
                  View All
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1,2,3,4,5,6].map(i => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="75%" height={16} />
                        <Skeleton variant="text" width="40%" height={12} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : activities.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <NotificationsActiveIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>No recent activities</Typography>
                </Box>
              ) : (
                <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
                  {activities.slice(0, 10).map((act, i) => {
                    const cfg = activityConfig[act.type] || activityConfig.default;
                    return (
                      <Box key={act._id || i} sx={{
                        display: 'flex', gap: 1.25, py: 1.25, px: 0.75,
                        borderRadius: 2, transition: 'background 0.15s',
                        '&:hover': { bgcolor: BG_LIGHT },
                        borderLeft: `3px solid ${cfg.color}`,
                        ml: 0.25, mb: 0.25,
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 500, fontSize: '0.78rem', lineHeight: 1.4 }}
                            noWrap>
                            {act.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                            <Chip label={cfg.label} size="small"
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: `${cfg.color}12`, color: cfg.color, borderRadius: '4px' }} />
                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.62rem' }}>
                              {act.ago || 'just now'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Cleaners */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Top Performers</Typography>
                <Button size="small" onClick={() => navigate('/cleaners')} sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.72rem', px: 0.5 }}>
                  View All
                </Button>
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
                <TextField
                  size="small" placeholder="Search cleaner..." value={cleanerSearch}
                  onChange={e => { setCleanerSearch(e.target.value); setCleanerPage(1); }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>, sx: { borderRadius: 2, fontSize: '0.78rem' } }}
                  sx={{ flex: 1 }}
                />
                <Select size="small" value={cleanerSort} onChange={e => { setCleanerSort(e.target.value); setCleanerPage(1); }}
                  sx={{ fontSize: '0.72rem', borderRadius: 2, minWidth: 90 }}>
                  <MenuItem value="earnings" sx={{ fontSize: '0.78rem' }}>Earnings</MenuItem>
                  <MenuItem value="rating"   sx={{ fontSize: '0.78rem' }}>Rating</MenuItem>
                  <MenuItem value="jobs"     sx={{ fontSize: '0.78rem' }}>Jobs</MenuItem>
                </Select>
                <Tooltip title={cleanerOrder === 'desc' ? 'Descending' : 'Ascending'}>
                  <IconButton size="small" onClick={() => setCleanerOrder(o => o === 'desc' ? 'asc' : 'desc')}
                    sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                    <SwapVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {cleanerLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[1,2,3,4,5,6,7].map(i => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" height={14} /><Skeleton variant="text" width="40%" height={11} /></Box>
                      <Skeleton variant="text" width={40} height={14} />
                    </Box>
                  ))}
                </Box>
              ) : topCleaners.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                  <BadgeIcon sx={{ fontSize: 36, color: '#D1D5DB', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>No cleaner data</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 320 }}>
                    {topCleaners.map((c, i) => (
                      <Box key={c._id} onClick={() => navigate('/cleaners')}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.875, px: 0.5, borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: BG_LIGHT } }}>
                        {/* Rank */}
                        <Typography sx={{ fontWeight: 800, color: i < 3 ? WARNING : TEXT_SECONDARY, fontSize: '0.72rem', width: 16, textAlign: 'center', flexShrink: 0 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${(cleanerPage - 1) * 8 + i + 1}`}
                        </Typography>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: CHART_COLORS[i % CHART_COLORS.length], fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                          {c.name?.charAt(0) || 'C'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY, fontSize: '0.78rem', lineHeight: 1.2 }} noWrap>
                            {c.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.65rem' }}>{c.completedJobs} jobs</Typography>
                            <Typography variant="caption" sx={{ color: WARNING, fontSize: '0.65rem' }}>⭐ {(c.rating || 0).toFixed(1)}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: SUCCESS, fontSize: '0.72rem', display: 'block' }}>
                            {fmtCur(c.earnings)}
                          </Typography>
                          <Box sx={{ width: 40, mt: 0.25 }}>
                            <LinearProgress variant="determinate" value={c.attendancePercent || 0}
                              sx={{ height: 3, borderRadius: 2, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': {
                                bgcolor: (c.attendancePercent || 0) >= 80 ? SUCCESS : (c.attendancePercent || 0) >= 60 ? WARNING : DANGER,
                                borderRadius: 2,
                              }}} />
                            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.6rem' }}>{c.attendancePercent || 0}%</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Pagination */}
                  {cleanerPag.pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, mt: 1, borderTop: `1px solid ${BORDER}` }}>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.68rem' }}>
                        {(cleanerPage - 1) * 8 + 1}–{Math.min(cleanerPage * 8, cleanerPag.total)} of {cleanerPag.total}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" disabled={cleanerPage <= 1} onClick={() => setCleanerPage(p => p - 1)}
                          sx={{ minWidth: 28, height: 26, fontSize: '0.7rem', borderRadius: 1 }}>‹</Button>
                        <Button size="small" disabled={cleanerPage >= cleanerPag.pages} onClick={() => setCleanerPage(p => p + 1)}
                          sx={{ minWidth: 28, height: 26, fontSize: '0.7rem', borderRadius: 1 }}>›</Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Pending Approvals + Quick Actions ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem' }}>Pending Approvals</Typography>
                {approvals.some(a => a.count > 0) && (
                  <Chip label={`${approvals.reduce((s, a) => s + (a.count || 0), 0)} pending`} size="small"
                    sx={{ bgcolor: '#FEF3C7', color: WARNING, fontWeight: 700, fontSize: '0.7rem' }} />
                )}
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 2 }} />)}
                </Box>
              ) : approvals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: SUCCESS, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>All approvals are up to date!</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {approvals.map((item, i) => (
                    <Box key={i} onClick={() => navigate(item.path || '/cleaners')}
                      sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        p: 1.5, borderRadius: 2, border: `1px solid ${item.count > 0 ? '#FDE68A' : BORDER}`,
                        bgcolor: item.count > 0 ? '#FFFBEB' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                        '&:hover': { borderColor: PRIMARY, bgcolor: '#EFF6FF', transform: 'translateX(2px)' },
                      }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: item.count > 0 ? '#FEF3C7' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.count > 0
                            ? <HourglassEmptyIcon sx={{ fontSize: 18, color: WARNING }} />
                            : <CheckCircleIcon sx={{ fontSize: 18, color: SUCCESS }} />}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY, fontSize: '0.85rem' }}>{item.type}</Typography>
                          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: '0.7rem' }}>
                            {item.count > 0 ? `${item.count} pending review` : 'No pending items'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.count > 0 && (
                          <Chip label={item.count} size="small" sx={{ bgcolor: WARNING, color: '#fff', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                        )}
                        <ArrowForwardIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.95rem', mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Add Customer',    icon: '👤', path: '/customers',     color: PRIMARY  },
                  { label: 'Add Cleaner',     icon: '🧹', path: '/cleaners',      color: SUCCESS  },
                  { label: 'Add Supervisor',  icon: '👔', path: '/supervisors',   color: PURPLE   },
                  { label: 'Generate QR',     icon: '📱', path: '/qr',            color: CYAN     },
                  { label: 'New Booking',     icon: '📋', path: '/bookings',      color: WARNING  },
                  { label: 'Subscriptions',   icon: '📦', path: '/subscriptions', color: PINK     },
                  { label: 'Complaints',      icon: '⚠️', path: '/complaints',    color: DANGER   },
                  { label: 'Notifications',   icon: '🔔', path: '/notifications', color: LIME     },
                  { label: 'Reports',         icon: '📊', path: '/analytics',     color: '#64748B' },
                  { label: 'Settings',        icon: '⚙️', path: '/settings',      color: '#374151' },
                  { label: 'Franchise',       icon: '🏪', path: '/franchises',    color: '#7C3AED' },
                  { label: 'NCSP Partners',   icon: '🤝', path: '/ncsp',          color: '#0891B2' },
                ].map(action => (
                  <Grid item xs={6} sm={4} md={3} key={action.label}>
                    <Button
                      fullWidth variant="outlined" onClick={() => navigate(action.path)}
                      sx={{
                        display: 'flex', flexDirection: 'column', gap: 0.5,
                        p: 1.25, borderRadius: 2, borderColor: BORDER, color: action.color,
                        height: 'auto', minHeight: 68, bgcolor: `${action.color}04`,
                        '&:hover': { borderColor: action.color, bgcolor: `${action.color}10`, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${action.color}22` },
                        transition: 'all 0.2s',
                      }}>
                      <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{action.icon}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.63rem', textAlign: 'center', lineHeight: 1.2, color: 'inherit' }}>
                        {action.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
