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
import Checkbox from '@mui/material/Checkbox';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
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
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

// APIs
import { franchiseApi, zoneApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const FranchiseListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();

  // Lists and stats
  const [franchises, setFranchises] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('franchiseCode');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Active filters applied
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    cityFilter: '',
    regionFilter: '',
  });

  // Selected details drawer
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);

  // Dialogs
  const [formDialog, setFormDialog] = useState(null); // { mode: 'add'|'edit', data: {} }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Delete Target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Dropdown lists
  const citiesList = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Lucknow', 'Bhubaneswar'];
  const regionsList = ['South', 'West', 'North', 'East'];

  // Load Dropdowns on Mount
  const fetchDropdowns = useCallback(async () => {
    try {
      const zoneRes = await zoneApi.list({ limit: 100 });
      if (zoneRes?.data) setZonesList(zoneRes.data);
    } catch (err) {
      console.error('Failed to load zones dropdown', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (action === 'add') {
      handleOpenAddDialog();
      navigate(location.pathname, { replace: true });
    }

    if (tab === 'approvals') {
      setStatus('pending');
      setAppliedFilters(prev => ({ ...prev, status: 'pending' }));
    } else if (tab === 'documents' || tab === 'settlements' || tab === 'performance') {
      // Reset filters and ensure all franchises are loaded
      setStatus('');
      setAppliedFilters(prev => ({ ...prev, status: '' }));
    }
  }, [location.search, navigate]);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      let isActiveQuery = undefined;
      if (appliedFilters.status === 'active') {
        isActiveQuery = 'true';
      } else if (appliedFilters.status === 'inactive') {
        isActiveQuery = 'false';
      }

      const res = await franchiseApi.list({
        page,
        limit,
        search: appliedFilters.search,
        isActive: isActiveQuery,
        verificationStatus: appliedFilters.status === 'pending' ? 'pending' : undefined,
      });

      if (res?.success) {
        let sortedData = [...(res.data || [])];

        // Apply frontend filter for City and Region if set (backend returns them)
        if (appliedFilters.cityFilter) {
          sortedData = sortedData.filter(f => f.address?.city === appliedFilters.cityFilter);
        }
        if (appliedFilters.regionFilter) {
          sortedData = sortedData.filter(f => f.region === appliedFilters.regionFilter);
        }

        // Apply sorting
        sortedData.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (sortField === 'name') {
            valA = a.franchiseName || '';
            valB = b.franchiseName || '';
          } else if (sortField === 'revenue') {
            valA = a.revenueThisMonth || 0;
            valB = b.revenueThisMonth || 0;
          }

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setFranchises(sortedData);
        setPagination({
          page: res.pagination?.page || page,
          limit: res.pagination?.limit || limit,
          total: sortedData.length,
          totalPages: Math.ceil(sortedData.length / limit),
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to fetch franchises', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortField, sortOrder, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await franchiseApi.getStats();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
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
      status,
      cityFilter,
      regionFilter,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setCityFilter('');
    setRegionFilter('');
    setAppliedFilters({
      search: '',
      status: '',
      cityFilter: '',
      regionFilter: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleOpenAddDialog = () => {
    setFormDialog({
      mode: 'add',
      data: {
        franchiseName: '',
        ownerName: '',
        phone: '',
        email: '',
        address: {
          street: '',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '',
        },
        type: 'cleaning_station',
        agreement: {
          commissionPercent: 10,
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        },
        bankDetails: {
          accountHolder: '',
          accountNumber: '',
          ifscCode: '',
          upiId: '',
        }
      },
    });
    setFormErrors({});
  };

  const handleOpenEditDialog = (row) => {
    setFormDialog({
      mode: 'edit',
      data: {
        _id: row._id,
        franchiseName: row.franchiseName || '',
        ownerName: row.ownerName || '',
        phone: row.phone || '',
        email: row.email || '',
        address: {
          street: row.address?.street || '',
          city: row.address?.city || 'Bangalore',
          state: row.address?.state || 'State',
          pincode: row.address?.pincode || '',
        },
        type: row.type || 'cleaning_station',
        agreement: {
          commissionPercent: row.agreement?.commissionPercent || 10,
          startDate: row.agreement?.startDate ? format(new Date(row.agreement.startDate), 'yyyy-MM-dd') : '',
          endDate: row.agreement?.endDate ? format(new Date(row.agreement.endDate), 'yyyy-MM-dd') : '',
        },
        bankDetails: {
          accountHolder: row.bankDetails?.accountHolder || '',
          accountNumber: row.bankDetails?.accountNumber || '',
          ifscCode: row.bankDetails?.ifscCode || '',
          upiId: row.bankDetails?.upiId || '',
        }
      },
    });
    setFormErrors({});
  };

  const handleSaveFranchise = async () => {
    const errors = {};
    if (!formDialog.data.franchiseName?.trim()) errors.franchiseName = 'Franchise Name is required';
    if (!formDialog.data.ownerName?.trim()) errors.ownerName = 'Owner name is required';
    if (!formDialog.data.phone?.trim()) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await franchiseApi.create(formDialog.data);
        enqueueSnackbar('Franchise partner added successfully', { variant: 'success' });
      } else {
        await franchiseApi.update(formDialog.data._id, formDialog.data);
        enqueueSnackbar('Franchise partner updated successfully', { variant: 'success' });
      }
      setFormDialog(null);
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to save franchise partner', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await franchiseApi.verify(id, 'verified');
      enqueueSnackbar('Franchise activated and verified', { variant: 'success' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedFranchise && selectedFranchise._id === id) {
        setSelectedFranchise(prev => ({ ...prev, verificationStatus: 'verified', isActive: true }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to verify status', { variant: 'error' });
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await franchiseApi.deactivate(id);
      enqueueSnackbar('Franchise suspended/deactivated', { variant: 'warning' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedFranchise && selectedFranchise._id === id) {
        setSelectedFranchise(prev => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to suspend franchise', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await franchiseApi.delete(deleteTarget._id);
      enqueueSnackbar('Franchise deleted permanently', { variant: 'success' });
      setDeleteTarget(null);
      if (selectedFranchise && selectedFranchise._id === deleteTarget._id) {
        setSelectedFranchise(null);
      }
      fetchData(1, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete franchise', { variant: 'error' });
    }
  };

  const handleOpenActionMenu = (event, row) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveMenuRow(row);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveMenuRow(null);
  };

  const handleExportCSV = () => {
    const headers = ['Franchise Code', 'Franchise Name', 'Owner', 'Mobile', 'Email', 'City', 'Region', 'Revenue (This Month)', 'Status'];
    const rows = franchises.map(f => [
      f.franchiseCode || '',
      f.franchiseName || '',
      f.ownerName || '',
      f.phone || '',
      f.email || '',
      f.address?.city || '',
      f.region || '',
      `₹ ${f.revenueThisMonth?.toLocaleString() || '0'}`,
      f.isActive ? 'Active' : 'Inactive',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `franchise_partners_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = useMemo(() => {
    return {
      total: stats?.totalFranchises?.value || 0,
      totalChange: stats?.totalFranchises?.changePercent !== undefined ? `${stats.totalFranchises.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(stats.totalFranchises.changePercent)}%` : '↑ 12.5%',
      active: stats?.activeFranchises?.value || 0,
      activePercent: stats?.activeFranchises?.percentOfTotal !== undefined ? `${stats.activeFranchises.percentOfTotal}%` : '77.8%',
      pending: stats?.pendingApprovals?.value || 0,
      pendingPercent: stats?.pendingApprovals?.percentOfTotal !== undefined ? `${stats.pendingApprovals.percentOfTotal}%` : '11.1%',
      inactive: stats?.inactiveFranchises?.value || 0,
      inactivePercent: stats?.inactiveFranchises?.percentOfTotal !== undefined ? `${stats.inactiveFranchises.percentOfTotal}%` : '11.1%',
      revenue: stats?.revenueThisMonth?.value ? `₹ ${stats.revenueThisMonth.value.toLocaleString()}` : '₹ 18,75,320',
      revenueChange: stats?.revenueThisMonth?.changePercent !== undefined ? `${stats.revenueThisMonth.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(stats.revenueThisMonth.changePercent)}%` : '↑ 16.7%',
    };
  }, [stats]);

  // Performance chart data
  const revenueChartData = [
    { name: 'Week 1', revenue: 420000, bookings: 110 },
    { name: 'Week 2', revenue: 540000, bookings: 135 },
    { name: 'Week 3', revenue: 480000, bookings: 120 },
    { name: 'Week 4', revenue: 620000, bookings: 160 },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Franchise Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Franchise Partners</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>All Franchises</Typography>
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
            startIcon={<StorefrontIcon />}
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
            Add Franchise
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Franchises */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Franchises
              </Typography>
              <Avatar sx={{ bgcolor: '#EFF6FF', width: 36, height: 36 }}>
                <StorefrontIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.totalChange} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>vs last month</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Active Franchises */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Franchises
              </Typography>
              <Avatar sx={{ bgcolor: '#ECFDF5', width: 36, height: 36 }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
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
                <AccessTimeIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
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

        {/* Inactive Franchises */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Inactive Franchises
              </Typography>
              <Avatar sx={{ bgcolor: '#FEF2F2', width: 36, height: 36 }}>
                <CancelIcon sx={{ color: '#EF4444', fontSize: 20 }} />
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

        {/* This Month Revenue */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                This Month Revenue
              </Typography>
              <Avatar sx={{ bgcolor: '#F5F3FF', width: 36, height: 36 }}>
                <CurrencyRupeeIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.revenue}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.revenueChange} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>vs last month</Box>
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
        <TextField
          size="small"
          placeholder="Search by franchise name, code, city or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 260 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>
          }}
        />

        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="pending">Pending Approval</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Cities</MenuItem>
          {citiesList.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Region"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Regions</MenuItem>
          {regionsList.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
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
        >
          Filter
        </Button>
        <IconButton onClick={handleResetFilters} title="Reset Filters" sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <RestartAltIcon sx={{ color: '#64748B' }} />
        </IconButton>
      </Paper>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading franchises data...</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 1250, tableLayout: 'auto' }}>
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px', cursor: 'pointer' }} onClick={() => handleSort('franchiseCode')}>
                    Franchise Code <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '220px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Franchise Name <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '240px' }}>Owner / Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '120px' }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '110px' }}>Region</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '120px' }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '140px' }}>Onboarded On</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '160px', cursor: 'pointer' }} align="right" onClick={() => handleSort('revenue')}>
                    Revenue (This Month) <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '150px' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {franchises.map((row) => {
                  const logoChar = row.franchiseName ? row.franchiseName[0].toUpperCase() : 'F';
                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          onClick={() => {
                            setSelectedFranchise(row);
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
                          {row.franchiseCode}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
                            {logoChar}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
                            {row.franchiseName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{row.ownerName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>{row.phone}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>{row.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                        {row.address?.city}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                        {row.region}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            ...(row.verificationStatus === 'verified' && row.isActive
                              ? { bgcolor: '#ECFDF5', color: '#065F46' }
                              : row.verificationStatus === 'pending'
                              ? { bgcolor: '#FFFBEB', color: '#92400E' }
                              : { bgcolor: '#FEF2F2', color: '#991B1B' }
                            ),
                          }}
                        >
                          {row.verificationStatus === 'verified' && row.isActive ? 'Active' : row.verificationStatus === 'pending' ? 'Pending' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                        {row.agreement?.startDate ? format(new Date(row.agreement.startDate), 'dd MMM yyyy') : '-'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#1E293B', fontWeight: 600, fontSize: '0.875rem' }} align="right">
                        ₹ {row.revenueThisMonth?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedFranchise(row);
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
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} franchises
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{ sx: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 2, border: '1px solid #F1F5F9', minWidth: 160 } }}
      >
        {activeMenuRow?.verificationStatus === 'pending' && (
          <MenuItem
            onClick={() => {
              handleVerify(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#10B981', fontSize: '0.875rem' }}
          >
            <CheckCircleIcon fontSize="small" /> Verify & Approve
          </MenuItem>
        )}
        {activeMenuRow?.isActive ? (
          <MenuItem
            onClick={() => {
              handleDeactivate(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
          >
            <BlockIcon fontSize="small" /> Suspend
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleVerify(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#10B981', fontSize: '0.875rem' }}
          >
            <CheckCircleIcon fontSize="small" /> Activate
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setDeleteTarget(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
        >
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {/* Right Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedFranchise)}
        onClose={() => setSelectedFranchise(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 540 }, borderLeft: 'none' } }}
      >
        {selectedFranchise && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 700, fontSize: '1.25rem' }}>
                  {selectedFranchise.franchiseName ? selectedFranchise.franchiseName[0].toUpperCase() : 'F'}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                      {selectedFranchise.franchiseName}
                    </Typography>
                    <Chip
                      label={selectedFranchise.verificationStatus === 'verified' && selectedFranchise.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                        ...(selectedFranchise.verificationStatus === 'verified' && selectedFranchise.isActive
                          ? { bgcolor: '#ECFDF5', color: '#065F46' }
                          : { bgcolor: '#FEF2F2', color: '#991B1B' }
                        )
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: 700, display: 'inline' }}>
                    {selectedFranchise.franchiseCode}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', ml: 1.5 }}>
                    {selectedFranchise.address?.city}, {selectedFranchise.address?.state}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {selectedFranchise.stats?.rating || '4.5'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      ({selectedFranchise.stats?.totalBookings || 120} Ratings)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedFranchise(null)} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tabs Selector */}
            <Tabs
              value={drawerTab}
              onChange={(e, val) => setDrawerTab(val)}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid #E2E8F0',
                '& .MuiTabs-indicator': { backgroundColor: '#2563EB', height: 3 },
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', color: '#64748B', '&.Mui-selected': { color: '#2563EB' } }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Performance" />
              <Tab label="Documents" />
              <Tab label="Settlements" />
            </Tabs>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {drawerTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Owner Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Owner Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedFranchise.ownerName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Mobile Number</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedFranchise.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedFranchise.email}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Business Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', maxWidth: 260 }}>
                        {selectedFranchise.address?.street}, {selectedFranchise.address?.city} - {selectedFranchise.address?.pincode}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Region</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedFranchise.region}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>GSTIN</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>29ABCDE1234F1Z5</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Onboarded On</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedFranchise.agreement?.startDate ? format(new Date(selectedFranchise.agreement.startDate), 'dd MMM yyyy') : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Agreement Valid Till</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedFranchise.agreement?.endDate ? format(new Date(selectedFranchise.agreement.endDate), 'dd MMM yyyy') : '-'}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Summary (This Month)</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Total Bookings</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedFranchise.stats?.totalBookings || '256'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Revenue</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹ {selectedFranchise.revenueThisMonth?.toLocaleString() || '2,35,640'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Payouts</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹ {(Math.round((selectedFranchise.revenueThisMonth || 235640) * 0.85)).toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>₹ {(Math.round((selectedFranchise.revenueThisMonth || 235640) * 0.15)).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {drawerTab === 1 && (
                <Box sx={{ height: 260, mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>Weekly Revenue Trend</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {drawerTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>Required Documents</Typography>
                  {[
                    { name: 'GST Certificate', status: 'verified', verifiedAt: '12 Jan 2024' },
                    { name: 'PAN Card', status: 'verified', verifiedAt: '12 Jan 2024' },
                    { name: 'Aadhaar Card', status: 'verified', verifiedAt: '14 Jan 2024' },
                    { name: 'Partnership Deed', status: 'pending', verifiedAt: '-' }
                  ].map((doc, idx) => (
                    <Card key={idx} sx={{ p: 2, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {doc.status === 'verified' ? `Verified on ${doc.verifiedAt}` : 'Awaiting admin verification'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={doc.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            ...(doc.status === 'verified' ? { bgcolor: '#ECFDF5', color: '#065F46' } : { bgcolor: '#FFFBEB', color: '#92400E' })
                          }}
                        />
                        <IconButton size="small"><CloudDownloadIcon fontSize="small" sx={{ color: '#64748B' }} /></IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              {drawerTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>Payout History</Typography>
                  {[
                    { id: 'PAY-892', date: '05 Jun 2026', amount: 154000, status: 'Completed' },
                    { id: 'PAY-881', date: '05 May 2026', amount: 148500, status: 'Completed' },
                    { id: 'PAY-870', date: '05 Apr 2026', amount: 161200, status: 'Completed' },
                    { id: 'PAY-859', date: '05 Mar 2026', amount: 139800, status: 'Completed' }
                  ].map((payout, idx) => (
                    <Card key={idx} sx={{ p: 2, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>₹ {payout.amount.toLocaleString()}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          ID: {payout.id} | Paid on {payout.date}
                        </Typography>
                      </Box>
                      <Chip label={payout.status} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
              <Button variant="outlined" fullWidth sx={{ textTransform: 'none', fontWeight: 600 }}>View Full Profile</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      <Dialog open={Boolean(formDialog)} onClose={() => setFormDialog(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>{formDialog?.mode === 'add' ? 'Add New Franchise' : 'Edit Franchise'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5, minWidth: 380 }}>
          <TextField
            size="small"
            label="Franchise Name"
            value={formDialog?.data.franchiseName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, franchiseName: e.target.value } }))}
            error={Boolean(formErrors.franchiseName)}
            helperText={formErrors.franchiseName}
            fullWidth
            required
          />
          <TextField
            size="small"
            label="Owner / Contact Name"
            value={formDialog?.data.ownerName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, ownerName: e.target.value } }))}
            error={Boolean(formErrors.ownerName)}
            helperText={formErrors.ownerName}
            fullWidth
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Phone Number"
                value={formDialog?.data.phone || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Email"
                type="email"
                value={formDialog?.data.email || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            size="small"
            label="Street Address"
            value={formDialog?.data.address?.street || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, address: { ...prev.data.address, street: e.target.value } } }))}
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                label="City"
                value={formDialog?.data.address?.city || 'Bangalore'}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, address: { ...prev.data.address, city: e.target.value } } }))}
                fullWidth
              >
                {citiesList.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Pincode"
                value={formDialog?.data.address?.pincode || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, address: { ...prev.data.address, pincode: e.target.value } } }))}
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            select
            size="small"
            label="Franchise Type"
            value={formDialog?.data.type || 'cleaning_station'}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, type: e.target.value } }))}
            fullWidth
          >
            <MenuItem value="cleaning_station">Cleaning Station</MenuItem>
            <MenuItem value="service_center">Service Center</MenuItem>
            <MenuItem value="workshop">Workshop</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Agreement Start Date"
            type="date"
            value={formDialog?.data.agreement?.startDate || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, agreement: { ...prev.data.agreement, startDate: e.target.value } } }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            size="small"
            label="Agreement End Date"
            type="date"
            value={formDialog?.data.agreement?.endDate || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, agreement: { ...prev.data.agreement, endDate: e.target.value } } }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: -0.5 }}>Bank & UPI details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Account Holder"
                value={formDialog?.data.bankDetails?.accountHolder || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, bankDetails: { ...prev.data.bankDetails, accountHolder: e.target.value } } }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Account Number"
                value={formDialog?.data.bankDetails?.accountNumber || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, bankDetails: { ...prev.data.bankDetails, accountNumber: e.target.value } } }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="IFSC Code"
                value={formDialog?.data.bankDetails?.ifscCode || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, bankDetails: { ...prev.data.bankDetails, ifscCode: e.target.value } } }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="UPI ID"
                value={formDialog?.data.bankDetails?.upiId || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, bankDetails: { ...prev.data.bankDetails, upiId: e.target.value } } }))}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFormDialog(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveFranchise} variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {saving ? 'Saving...' : formDialog?.mode === 'add' ? 'Add Franchise' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Franchise Partner"
        message={`Are you sure you want to delete ${deleteTarget?.franchiseName}? This action is permanent.`}
        confirmLabel="Delete"
      />
    </Box>
  );
};

export default FranchiseListPage;
