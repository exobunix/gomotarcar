import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from 'recharts';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DescriptionIcon from '@mui/icons-material/Description';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// APIs
import { ncspApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const NcspPartnerListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeTabQuery = queryParams.get('tab') || 'all'; // all, approvals, performance, settlement
  const actionQuery = queryParams.get('action');

  // Lists and stats
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(activeTabQuery === 'approvals' ? 'pending' : '');
  const [cityFilter, setCityFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [minRevenue, setMinRevenue] = useState('');
  const [onboardingDate, setOnboardingDate] = useState('');

  // Active filters applied
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: activeTabQuery === 'approvals' ? 'pending' : '',
    cityFilter: '',
    regionFilter: '',
    kycFilter: '',
    minRevenue: '',
    onboardingDate: '',
  });

  // Sync tab query with status filter
  useEffect(() => {
    if (activeTabQuery === 'approvals') {
      setStatus('pending');
      setAppliedFilters(prev => ({ ...prev, status: 'pending' }));
    } else {
      setStatus('');
      setAppliedFilters(prev => ({ ...prev, status: '' }));
    }
  }, [activeTabQuery]);

  // Detail Drawer state
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);

  // Add/Edit Dialog
  const [formDialog, setFormDialog] = useState(null); // { mode: 'add'|'edit', data: {} }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Delete Target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Trigger Add dialog via URL action parameter
  useEffect(() => {
    if (actionQuery === 'add') {
      handleOpenAddDialog();
      // Remove action from URL to prevent reopen
      const params = new URLSearchParams(location.search);
      params.delete('action');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [actionQuery]);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await ncspApi.list({
        page,
        limit,
        search: appliedFilters.search,
        status: appliedFilters.status || undefined,
        city: appliedFilters.cityFilter || undefined,
        region: appliedFilters.regionFilter || undefined,
        kycStatus: appliedFilters.kycFilter || undefined,
        minRevenue: appliedFilters.minRevenue || undefined,
        onboardingDate: appliedFilters.onboardingDate || undefined,
      });

      if (res?.success) {
        let sortedData = [...(res.data || [])];
        // Client-side sorting for all fields to support advanced columns
        sortedData.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (sortField === 'address.city') {
            valA = a.address?.city || '';
            valB = b.address?.city || '';
          } else if (sortField === 'revenue') {
            valA = a.stats?.revenueThisMonth || 0;
            valB = b.stats?.revenueThisMonth || 0;
          } else if (sortField === 'bookings') {
            valA = a.stats?.totalBookings || 0;
            valB = b.stats?.totalBookings || 0;
          } else if (sortField === 'balance') {
            valA = a.stats?.balance || 0;
            valB = b.stats?.balance || 0;
          }

          if (typeof valA === 'string') {
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        });

        setPartners(sortedData);
        setPagination(res.pagination || { page, limit, total: sortedData.length, totalPages: Math.ceil(sortedData.length / limit) });
      }
    } catch (err) {
      enqueueSnackbar('Failed to fetch NCSP partners data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortField, sortOrder, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await ncspApi.getStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch NCSP stats', err);
    }
  }, []);

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      status: activeTabQuery === 'approvals' ? 'pending' : status,
      cityFilter,
      regionFilter,
      kycFilter,
      minRevenue,
      onboardingDate,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCityFilter('');
    setRegionFilter('');
    setKycFilter('');
    setMinRevenue('');
    setOnboardingDate('');
    setAppliedFilters({
      search: '',
      status: activeTabQuery === 'approvals' ? 'pending' : '',
      cityFilter: '',
      regionFilter: '',
      kycFilter: '',
      minRevenue: '',
      onboardingDate: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleOpenActionMenu = (event, row) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveMenuRow(row);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveMenuRow(null);
  };

  const handleOpenAddDialog = () => {
    setFormDialog({
      mode: 'add',
      data: {
        partnerName: '',
        ownerName: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        region: '',
        gstin: '',
      },
    });
    setFormErrors({});
  };

  const handleOpenEditDialog = (row) => {
    setFormDialog({
      mode: 'edit',
      data: {
        _id: row._id,
        partnerName: row.partnerName || '',
        ownerName: row.ownerName || '',
        phone: row.phone || '',
        email: row.email || '',
        street: row.address?.street || '',
        city: row.address?.city || '',
        state: row.address?.state || '',
        pincode: row.address?.pincode || '',
        region: row.address?.region || '',
        gstin: row.gstin || '',
      },
    });
    setFormErrors({});
  };

  const handleSavePartner = async () => {
    const errors = {};
    if (!formDialog.data.partnerName?.trim()) errors.partnerName = 'Partner Name is required';
    if (!formDialog.data.ownerName?.trim()) errors.ownerName = 'Contact Person is required';
    if (!formDialog.data.phone?.trim()) errors.phone = 'Phone number is required';
    if (!formDialog.data.email?.trim()) errors.email = 'Email is required';
    if (!formDialog.data.city?.trim()) errors.city = 'City is required';
    if (!formDialog.data.region?.trim()) errors.region = 'Region is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await ncspApi.create(formDialog.data);
        enqueueSnackbar('NCSP Partner registered successfully', { variant: 'success' });
      } else {
        await ncspApi.update(formDialog.data._id, formDialog.data);
        enqueueSnackbar('NCSP Partner updated successfully', { variant: 'success' });
      }
      setFormDialog(null);
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      const msg = err.message || 'Failed to save partner';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await ncspApi.verify(id);
      enqueueSnackbar('Partner status set to Active (KYC Verified)', { variant: 'success' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedPartner && selectedPartner._id === id) {
        setSelectedPartner(prev => ({ ...prev, isActive: true, verificationStatus: 'verified' }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to verify partner', { variant: 'error' });
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await ncspApi.deactivate(id);
      enqueueSnackbar('Partner deactivated', { variant: 'warning' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedPartner && selectedPartner._id === id) {
        setSelectedPartner(prev => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to deactivate partner', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await ncspApi.delete(deleteTarget._id);
      enqueueSnackbar('NCSP Partner deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
      if (selectedPartner && selectedPartner._id === deleteTarget._id) {
        setSelectedPartner(null);
      }
      fetchData(1, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete partner', { variant: 'error' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Partner ID', 'Partner Name', 'Contact Person', 'Email', 'Mobile', 'City', 'Region', 'Status', 'Onboarded On', 'Revenue This Month', 'Total Bookings', 'Settlement Balance'];
    const rows = partners.map(p => [
      p.partnerId,
      p.partnerName,
      p.ownerName,
      p.email,
      p.phone,
      p.address?.city || '',
      p.address?.region || '',
      p.isActive ? 'Active' : 'Inactive',
      format(new Date(p.onboardedOn), 'yyyy-MM-dd'),
      p.stats?.revenueThisMonth || 0,
      p.stats?.totalBookings || 0,
      p.stats?.balance || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ncsp_partners_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const kpis = useMemo(() => {
    return {
      total: stats?.totalPartners?.value || 0,
      totalChange: stats?.totalPartners?.changePercent !== undefined ? `↑ ${stats.totalPartners.changePercent}%` : '↑ 7.7%',
      active: stats?.activePartners?.value || 0,
      activePercent: stats?.activePartners?.percentOfTotal !== undefined ? `${stats.activePartners.percentOfTotal}%` : '0%',
      pending: stats?.pendingApprovals?.value || 0,
      pendingPercent: stats?.pendingApprovals?.percentOfTotal !== undefined ? `${stats.pendingApprovals.percentOfTotal}%` : '0%',
      inactive: stats?.inactivePartners?.value || 0,
      inactivePercent: stats?.inactivePartners?.percentOfTotal !== undefined ? `${stats.inactivePartners.percentOfTotal}%` : '0%',
      revenue: stats?.revenueThisMonth?.value || 0,
      revenueChange: stats?.revenueThisMonth?.changePercent !== undefined ? `↑ ${stats.revenueThisMonth.changePercent}%` : '↑ 15.4%',
    };
  }, [stats]);

  // Overall performance charts data
  const performanceTrendData = [
    { month: 'Jan', bookings: 450, revenue: 380000 },
    { month: 'Feb', bookings: 590, revenue: 520000 },
    { month: 'Mar', bookings: 800, revenue: 710000 },
    { month: 'Apr', bookings: 980, revenue: 890000 },
    { month: 'May', bookings: 1250, revenue: 1120000 },
    { month: 'Jun', bookings: 1420, revenue: 1245680 },
  ];

  // Drawer performance graph data
  const drawerPerformanceData = [
    { week: 'W1', bookings: 12 },
    { week: 'W2', bookings: 19 },
    { week: 'W3', bookings: 15 },
    { week: 'W4', bookings: 22 },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            NCSP Partner Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>NCSP Partners</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>
              {activeTabQuery === 'all' && 'All Partners'}
              {activeTabQuery === 'approvals' && 'Partner Approvals'}
              {activeTabQuery === 'performance' && 'Performance Overview'}
              {activeTabQuery === 'settlement' && 'Settlement Records'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              backgroundColor: '#2563EB',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              '&:hover': { backgroundColor: '#1D4ED8' }
            }}
          >
            Add NCSP Partner
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Partners */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total NCSP Partners
              </Typography>
              <Avatar sx={{ bgcolor: '#EFF6FF', width: 36, height: 36 }}>
                <BusinessIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.totalChange} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>vs last month</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Active Partners */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Partners
              </Typography>
              <Avatar sx={{ bgcolor: '#ECFDF5', width: 36, height: 36 }}>
                <CheckCircleOutlineIcon sx={{ color: '#10B981', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.active}
            </Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.activePercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Pending Approvals
              </Typography>
              <Avatar sx={{ bgcolor: '#FFFBEB', width: 36, height: 36 }}>
                <HourglassEmptyIcon sx={{ color: '#D97706', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.pending}
            </Typography>
            <Typography variant="body2" sx={{ color: '#D97706', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.pendingPercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Inactive Partners */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Inactive Partners
              </Typography>
              <Avatar sx={{ bgcolor: '#FEF2F2', width: 36, height: 36 }}>
                <HighlightOffIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.inactive}
            </Typography>
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.inactivePercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                This Month Revenue
              </Typography>
              <Avatar sx={{ bgcolor: '#F0FDF4', width: 36, height: 36 }}>
                <CurrencyRupeeIcon sx={{ color: '#16A34A', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5, fontSize: '1.5rem', whiteSpace: 'nowrap' }}>
              {formatCurrency(kpis.revenue)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.revenueChange} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>vs last month</Box>
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Conditional Rendering of Views */}
      {activeTabQuery === 'performance' ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                NCSP Partner Bookings & Revenue Growth Trend (H1 2026)
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={12} />
                    <ChartTooltip />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                    <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#10B981" fillOpacity={0} name="Bookings" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Rated Partners</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Partner Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Rating</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Bookings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.slice(0, 5).map(p => (
                      <TableRow key={p._id}>
                        <TableCell>{p.partnerName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#D97706' }}>★ {p.rating}</TableCell>
                        <TableCell align="right">{p.stats?.totalBookings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Highest Revenue Generative Partners</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Partner Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Revenue (This Month)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...partners].sort((a,b) => (b.stats?.revenueThisMonth || 0) - (a.stats?.revenueThisMonth || 0)).slice(0, 5).map(p => (
                      <TableRow key={p._id}>
                        <TableCell>{p.partnerName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(p.stats?.revenueThisMonth || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      ) : activeTabQuery === 'settlement' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
            Partner Settlement Statements
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Partner ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Partner Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Commission (15%)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Settled Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Pending Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.map(p => (
                  <TableRow key={p._id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.partnerId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.partnerName}</TableCell>
                    <TableCell align="right">{formatCurrency(p.stats?.totalRevenue || 0)}</TableCell>
                    <TableCell align="right">{formatCurrency((p.stats?.totalRevenue || 0) * 0.15)}</TableCell>
                    <TableCell align="right">{formatCurrency(p.stats?.totalPayouts || 0)}</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 600 }}>{formatCurrency(p.stats?.balance || 0)}</TableCell>
                    <TableCell align="center">
                      <Chip label={p.stats?.balance > 0 ? "Pending Pay" : "Settled"} color={p.stats?.balance > 0 ? "warning" : "success"} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <>
          {/* Filter Bar */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
            <TextField
              size="small"
              placeholder="Search by partner name, code, email or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 260 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>
              }}
            />

            {activeTabQuery !== 'approvals' && (
              <TextField
                select
                size="small"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            )}

            <TextField
              select
              size="small"
              label="City"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Cities</MenuItem>
              <MenuItem value="Bangalore">Bangalore</MenuItem>
              <MenuItem value="Mumbai">Mumbai</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
              <MenuItem value="Hyderabad">Hyderabad</MenuItem>
              <MenuItem value="Pune">Pune</MenuItem>
              <MenuItem value="Chennai">Chennai</MenuItem>
              <MenuItem value="Kolkata">Kolkata</MenuItem>
              <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
              <MenuItem value="Lucknow">Lucknow</MenuItem>
              <MenuItem value="Bhubaneswar">Bhubaneswar</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="">All Regions</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="West">West</MenuItem>
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="East">East</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="KYC Status"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="">All KYC</MenuItem>
              <MenuItem value="true">Verified</MenuItem>
              <MenuItem value="false">Pending</MenuItem>
            </TextField>

            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                height: 40,
                '&:hover': { backgroundColor: '#DBEAFE', boxShadow: 'none' }
              }}
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
            <IconButton onClick={handleResetFilters} title="Reset Filters" sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <RestartAltIcon sx={{ color: '#64748B' }} />
            </IconButton>
          </Paper>

          {/* Table Section */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflowX: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Loading partners data...</Typography>
              </Box>
            ) : (
              <>
                <Table sx={{ minWidth: 1250, tableLayout: 'auto' }}>
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px', cursor: 'pointer' }} onClick={() => handleSort('partnerId')}>
                        Partner ID <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '220px', cursor: 'pointer' }} onClick={() => handleSort('partnerName')}>
                        Partner Name <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '200px' }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px', cursor: 'pointer' }} onClick={() => handleSort('address.city')}>
                        City <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '110px' }}>Region</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '120px' }} align="center">Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '150px', cursor: 'pointer' }} onClick={() => handleSort('onboardedOn')}>
                        Onboarded On <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '160px', cursor: 'pointer' }} align="right" onClick={() => handleSort('revenue')}>
                        Revenue (This Month) <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.map((row) => (
                      <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography
                            onClick={() => {
                              setSelectedPartner(row);
                              setDrawerTab(0);
                            }}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: '#2563EB',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {row.partnerId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={row.logo} sx={{ width: 32, height: 32, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
                              {row.partnerName ? row.partnerName[0].toUpperCase() : 'P'}
                            </Avatar>
                            <Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
                              {row.partnerName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '0.8125rem', fontWeight: 500 }}>
                            {row.phone}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>
                            {row.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                          {row.address?.city}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                          {row.address?.region}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }} align="center">
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '100px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              ...(row.verificationStatus === 'pending'
                                ? { bgcolor: '#FEF3C7', color: '#D97706' }
                                : row.isActive
                                  ? { bgcolor: '#ECFDF5', color: '#065F46' }
                                  : { bgcolor: '#FEF2F2', color: '#991B1B' }
                              ),
                            }}
                          >
                            {row.verificationStatus === 'pending' ? 'Pending' : row.isActive ? 'Active' : 'Inactive'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                          {format(new Date(row.onboardedOn), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }} align="right">
                          {formatCurrency(row.stats?.revenueThisMonth || 0)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }} align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedPartner(row);
                                  setDrawerTab(0);
                                }}
                                sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(row)}
                                sx={{ color: '#64748B', '&:hover': { color: '#D97706', bgcolor: '#FFFBEB' } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenActionMenu(e, row)}
                              sx={{ color: '#64748B' }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {partners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" sx={{ color: '#64748B', mb: 1 }}>No NCSP partners found</Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Try adjusting your filters or add a new partner</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} partners
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      sx={{ minWidth: 32, p: 0.5, border: '1px solid #E2E8F0', color: '#475569' }}
                    >
                      &lt;
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(0, 5).map(pNum => (
                      <Button
                        key={pNum}
                        size="small"
                        variant={pagination.page === pNum ? 'contained' : 'outlined'}
                        onClick={() => setPagination(prev => ({ ...prev, page: pNum }))}
                        sx={{
                          minWidth: 32,
                          p: 0.5,
                          ...(pagination.page === pNum
                            ? { bgcolor: '#2563EB', color: '#FFFFFF' }
                            : { borderColor: '#E2E8F0', color: '#475569' }
                          )
                        }}
                      >
                        {pNum}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      sx={{ minWidth: 32, p: 0.5, border: '1px solid #E2E8F0', color: '#475569' }}
                    >
                      &gt;
                    </Button>

                    <TextField
                      select
                      size="small"
                      value={pagination.limit}
                      onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                      sx={{ ml: 2, '& .MuiInputBase-root': { height: 32, fontSize: '0.8125rem' } }}
                    >
                      <MenuItem value={10}>10 / page</MenuItem>
                      <MenuItem value={20}>20 / page</MenuItem>
                      <MenuItem value={50}>50 / page</MenuItem>
                    </TextField>
                  </Box>
                </Box>
              </>
            )}
          </TableContainer>
        </>
      )}

      {/* Row More Actions Context Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{ sx: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 2, border: '1px solid #F1F5F9', minWidth: 160 } }}
      >
        {activeMenuRow?.verificationStatus === 'pending' || !activeMenuRow?.isActive ? (
          <MenuItem
            onClick={() => {
              handleVerify(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#10B981', fontSize: '0.875rem' }}
          >
            <CheckCircleIcon fontSize="small" /> Activate & Verify
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleDeactivate(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
          >
            <BlockIcon fontSize="small" /> Suspend Partner
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleOpenEditDialog(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <EditIcon fontSize="small" /> Edit Details
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteTarget(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
        >
          <DeleteIcon fontSize="small" /> Delete Partner
        </MenuItem>
      </Menu>

      {/* Right Side Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderLeft: '1px solid #E2E8F0' } }}
      >
        {selectedPartner && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
            {/* Header */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={selectedPartner.logo} sx={{ width: 64, height: 64, border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {selectedPartner.partnerName}
                    </Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: '100px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: selectedPartner.verificationStatus === 'pending'
                          ? '#FEF3C7'
                          : selectedPartner.isActive ? '#ECFDF5' : '#FEF2F2',
                        color: selectedPartner.verificationStatus === 'pending'
                          ? '#D97706'
                          : selectedPartner.isActive ? '#065F46' : '#991B1B',
                      }}
                    >
                      {selectedPartner.verificationStatus === 'pending' ? 'Pending' : selectedPartner.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: 600, mb: 0.25 }}>
                    {selectedPartner.partnerId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    NCSP Partner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                      {selectedPartner.rating || '4.5'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      ({selectedPartner.ratingCount || 120} Ratings)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedPartner(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #E2E8F0', px: 2 }}>
              <Tabs value={drawerTab} onChange={(e, val) => setDrawerTab(val)} variant="fullWidth">
                <Tab label="Profile" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Performance" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Settlement" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Documents" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
              </Tabs>
            </Box>

            {/* Drawer Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {drawerTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  {/* Business Information */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>
                      Business Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Contact Person</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.ownerName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Mobile</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B', minWidth: 100 }}>Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B', textAlign: 'right' }}>
                          {selectedPartner.address?.street ? `${selectedPartner.address.street}, ` : ''}
                          {selectedPartner.address?.city} - {selectedPartner.address?.pincode || '560001'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>City</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.address?.city}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Region</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.address?.region}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>GSTIN</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.gstin || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Onboarding & Status */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>
                      Onboarding & Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Onboarded On</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                          {format(new Date(selectedPartner.onboardedOn), 'dd MMM yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Status</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: selectedPartner.isActive ? '#10B981' : '#EF4444' }}>
                          {selectedPartner.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>KYC Verified</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.kycVerified ? 'Yes' : 'No'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Agreement Signed</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.agreementSigned ? 'Yes' : 'No'}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Financial Summary */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>
                      Financial Summary (This Month)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Total Bookings</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>{selectedPartner.stats?.totalBookings || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Revenue</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>{formatCurrency(selectedPartner.stats?.revenueThisMonth || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Payouts</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748B' }}>{formatCurrency(selectedPartner.stats?.totalPayouts || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Balance</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>{formatCurrency(selectedPartner.stats?.balance || 0)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {drawerTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>
                    Monthly Performance Summary
                  </Typography>
                  <Card sx={{ p: 3, textAlign: 'center', mb: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                      {selectedPartner.rating || '4.5'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <StarIcon key={idx} sx={{ color: idx < Math.round(selectedPartner.rating || 4.5) ? '#F59E0B' : '#E2E8F0', fontSize: 24 }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      Based on {selectedPartner.ratingCount || 120} service quality ratings
                    </Typography>
                  </Card>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Weekly Booking Volume</Typography>
                  <Box sx={{ height: 160, mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={drawerPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Bar dataKey="bookings" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Active Apartments</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{Math.floor(selectedPartner.stats?.totalBookings * 0.15) || 5}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Assigned Supervisors</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>2</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Assigned Cleaners</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{Math.floor(selectedPartner.stats?.totalBookings * 0.05) || 8}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {drawerTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Settlement Reports
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Monthly Revenue</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(selectedPartner.stats?.revenueThisMonth || 0)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Commission (15%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>-{formatCurrency((selectedPartner.stats?.revenueThisMonth || 0) * 0.15)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Net Payable</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>{formatCurrency((selectedPartner.stats?.revenueThisMonth || 0) * 0.85)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Paid Amount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B' }}>{formatCurrency(selectedPartner.stats?.totalPayouts || 0)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Pending Payout</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>{formatCurrency(selectedPartner.stats?.balance || 0)}</Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Settlement History</Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>May 2026</TableCell>
                          <TableCell align="right">{formatCurrency(185000)}</TableCell>
                          <TableCell align="center"><Chip label="Settled" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Apr 2026</TableCell>
                          <TableCell align="right">{formatCurrency(142000)}</TableCell>
                          <TableCell align="center"><Chip label="Settled" color="success" size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {drawerTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                    Uploaded Documents & Verification
                  </Typography>

                  {[
                    { name: 'GSTIN Registration Certificate.pdf', type: 'GST Certificate' },
                    { name: 'PAN Card Verification.pdf', type: 'PAN Card' },
                    { name: 'NCSP Partnership Agreement.pdf', type: 'Agreement' },
                    { name: 'Cancelled Bank Cheque Proof.pdf', type: 'Bank Proof' },
                    { name: 'Owner Aadhaar KYC.pdf', type: 'KYC Document' }
                  ].map((doc, idx) => (
                    <Card key={idx} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DescriptionIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>{doc.type}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{doc.name}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label="Verified" color="success" size="small" variant="outlined" />
                        <IconButton size="small" href="#" download title="Download">
                          <FileDownloadIcon fontSize="small" sx={{ color: '#64748B' }} />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* View Full Profile Button */}
            <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.25,
                  '&:hover': { backgroundColor: '#EFF6FF', borderColor: '#1D4ED8' }
                }}
              >
                View Full Profile
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      <Dialog
        open={Boolean(formDialog)}
        onClose={() => setFormDialog(null)}
        PaperProps={{ sx: { borderRadius: 3, width: 480 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', pb: 1 }}>
          {formDialog?.mode === 'add' ? 'Register New NCSP Partner' : 'Edit NCSP Partner Info'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          <TextField
            size="small"
            label="Partner Name"
            value={formDialog?.data.partnerName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, partnerName: e.target.value } }))}
            error={Boolean(formErrors.partnerName)}
            helperText={formErrors.partnerName}
            fullWidth
          />

          <TextField
            size="small"
            label="Contact Person (Owner)"
            value={formDialog?.data.ownerName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, ownerName: e.target.value } }))}
            error={Boolean(formErrors.ownerName)}
            helperText={formErrors.ownerName}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="Mobile Phone"
              value={formDialog?.data.phone || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
              fullWidth
            />
            <TextField
              size="small"
              label="Email Address"
              value={formDialog?.data.email || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
            />
          </Box>

          <TextField
            size="small"
            label="Street Address"
            value={formDialog?.data.street || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, street: e.target.value } }))}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="City"
              value={formDialog?.data.city || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, city: e.target.value } }))}
              error={Boolean(formErrors.city)}
              helperText={formErrors.city}
              fullWidth
            />
            <TextField
              size="small"
              label="Region (South/West/North/East)"
              value={formDialog?.data.region || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, region: e.target.value } }))}
              error={Boolean(formErrors.region)}
              helperText={formErrors.region}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="State"
              value={formDialog?.data.state || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, state: e.target.value } }))}
              fullWidth
            />
            <TextField
              size="small"
              label="Pincode"
              value={formDialog?.data.pincode || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, pincode: e.target.value } }))}
              fullWidth
            />
          </Box>

          <TextField
            size="small"
            label="GSTIN"
            value={formDialog?.data.gstin || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, gstin: e.target.value } }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setFormDialog(null)} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePartner}
            disabled={saving}
            sx={{
              backgroundColor: '#2563EB',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1D4ED8' }
            }}
          >
            {saving ? 'Saving...' : 'Save Partner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete NCSP Partner"
        message={`Are you sure you want to permanently delete partner "${deleteTarget?.partnerName}"? This action cannot be undone.`}
        confirmText="Delete partner"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default NcspPartnerListPage;
