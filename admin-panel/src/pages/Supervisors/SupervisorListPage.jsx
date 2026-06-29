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
  LineChart,
  Line,
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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import QrCodeIcon from '@mui/icons-material/QrCode';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// APIs
import { supervisorApi, apartmentApi, zoneApi, cleanerApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const SupervisorListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeTabQuery = queryParams.get('tab') || 'all'; // all, apartment-allocation, cleaner-allocation, qr-stock, work-approvals, performance
  const actionQuery = queryParams.get('action');

  // Lists and stats
  const [supervisors, setSupervisors] = useState([]);
  const [cleanersList, setCleanersList] = useState([]);
  const [apartmentsList, setApartmentsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('joiningDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [apartmentFilter, setApartmentFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Active filters applied
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    apartmentFilter: '',
    regionFilter: '',
  });

  // Selected details drawer
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);

  // Allocation Modals
  const [allocateApartmentModal, setAllocateApartmentModal] = useState(null); // supervisor object or null
  const [selectedAptIds, setSelectedAptIds] = useState([]);
  const [allocateCleanerModal, setAllocateCleanerModal] = useState(null); // supervisor object or null
  const [selectedCleanerIds, setSelectedCleanerIds] = useState([]);
  const [allocateQrModal, setAllocateQrModal] = useState(null); // supervisor object or null
  const [qrQuantity, setQrQuantity] = useState('50');

  // Work Approvals Mock State
  const [pendingWorks, setPendingWorks] = useState([
    { id: 'WRK-101', customerName: 'Adarsh Vyas', vehicle: 'Maruti Swift (MH-01-AB1234)', cleanerName: 'Rahul Kumar', time: '10:15 AM', photoBefore: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=300', photoAfter: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300', checked: false },
    { id: 'WRK-102', customerName: 'Ramesh Patel', vehicle: 'Hyundai i20 (MH-01-CD5678)', cleanerName: 'Vijay Singh', time: '10:45 AM', photoBefore: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=300', photoAfter: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=300', checked: false },
    { id: 'WRK-103', customerName: 'Sneha Rao', vehicle: 'Honda City (MH-01-EF9012)', cleanerName: 'Amit Shah', time: '11:00 AM', photoBefore: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300', photoAfter: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300', checked: false },
  ]);

  // Dialogs
  const [formDialog, setFormDialog] = useState(null); // { mode: 'add'|'edit', data: {} }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Delete Target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load Dropdowns on Mount
  const fetchDropdowns = useCallback(async () => {
    try {
      const [aptRes, zoneRes, cleanerRes] = await Promise.all([
        apartmentApi.list({ limit: 100 }),
        zoneApi.list({ limit: 100 }),
        cleanerApi.list({ limit: 100 })
      ]);
      if (aptRes?.data) setApartmentsList(aptRes.data);
      if (zoneRes?.data) setZonesList(zoneRes.data);
      if (cleanerRes?.data) setCleanersList(cleanerRes.data);
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // Listen to action Query
  useEffect(() => {
    if (actionQuery === 'add') {
      handleOpenAddDialog();
      const params = new URLSearchParams(location.search);
      params.delete('action');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [actionQuery]);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      let isActiveQuery = undefined;
      if (appliedFilters.status === 'active') {
        isActiveQuery = 'true';
      } else if (appliedFilters.status === 'inactive') {
        isActiveQuery = 'false';
      }

      const res = await supervisorApi.list({
        page,
        limit,
        search: appliedFilters.search,
        isActive: isActiveQuery,
        assignedZone: appliedFilters.regionFilter || undefined,
        apartmentId: appliedFilters.apartmentFilter || undefined,
      });

      if (res?.success) {
        let sortedData = [...(res.data || [])];
        sortedData.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (sortField === 'name') {
            valA = `${a.firstName} ${a.lastName || ''}`.trim();
            valB = `${b.firstName} ${b.lastName || ''}`.trim();
          } else if (sortField === 'rating') {
            valA = a.performanceRating || 0;
            valB = b.performanceRating || 0;
          } else if (sortField === 'cleaners') {
            valA = a.cleanersCount || 0;
            valB = b.cleanersCount || 0;
          } else if (sortField === 'apartments') {
            valA = a.apartmentsCount || 0;
            valB = b.apartmentsCount || 0;
          }

          if (typeof valA === 'string') {
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        });

        setSupervisors(sortedData);
        setPagination(res.pagination || { page, limit, total: sortedData.length, totalPages: Math.ceil(sortedData.length / limit) });
      }
    } catch (err) {
      enqueueSnackbar('Failed to fetch supervisors data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortField, sortOrder, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await supervisorApi.getStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch supervisor stats', err);
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
      apartmentFilter,
      regionFilter,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setApartmentFilter('');
    setRegionFilter('');
    setAppliedFilters({
      search: '',
      status: '',
      apartmentFilter: '',
      regionFilter: '',
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
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        assignedZone: '',
        experience: 0,
        password: '',
      },
    });
    setFormErrors({});
  };

  const handleOpenEditDialog = (row) => {
    setFormDialog({
      mode: 'edit',
      data: {
        _id: row._id,
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        phone: row.phone || '',
        email: row.email || '',
        assignedZone: row.assignedZone?._id || row.assignedZone || '',
        experience: row.experience || 0,
      },
    });
    setFormErrors({});
  };

  const handleSaveSupervisor = async () => {
    const errors = {};
    if (!formDialog.data.firstName?.trim()) errors.firstName = 'First Name is required';
    if (!formDialog.data.phone?.trim()) errors.phone = 'Phone number is required';
    if (formDialog.mode === 'add' && !formDialog.data.password?.trim()) {
      errors.password = 'Password is required';
    } else if (formDialog.mode === 'add' && formDialog.data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await supervisorApi.create(formDialog.data);
        enqueueSnackbar('Supervisor added successfully', { variant: 'success' });
      } else {
        await supervisorApi.update(formDialog.data._id, formDialog.data);
        enqueueSnackbar('Supervisor updated successfully', { variant: 'success' });
      }
      setFormDialog(null);
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to save supervisor', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await supervisorApi.verify(id);
      enqueueSnackbar('Supervisor activated', { variant: 'success' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedSupervisor && selectedSupervisor._id === id) {
        setSelectedSupervisor(prev => ({ ...prev, isActive: true }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await supervisorApi.deactivate(id);
      enqueueSnackbar('Supervisor suspended/deactivated', { variant: 'warning' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedSupervisor && selectedSupervisor._id === id) {
        setSelectedSupervisor(prev => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to deactivate supervisor', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await supervisorApi.delete(deleteTarget._id);
      enqueueSnackbar('Supervisor deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
      if (selectedSupervisor && selectedSupervisor._id === deleteTarget._id) {
        setSelectedSupervisor(null);
      }
      fetchData(1, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete supervisor', { variant: 'error' });
    }
  };

  // Perform custom allocations
  const handleAllocateApartment = async () => {
    if (!allocateApartmentModal) return;
    try {
      await supervisorApi.allocateApartment(allocateApartmentModal._id, { apartmentIds: selectedAptIds, action: 'set' });
      enqueueSnackbar('Apartments allocated successfully', { variant: 'success' });
      setAllocateApartmentModal(null);
      setSelectedAptIds([]);
      fetchData(pagination.page, pagination.limit);
    } catch (err) {
      enqueueSnackbar('Failed to allocate apartments', { variant: 'error' });
    }
  };

  const handleAllocateCleaner = async () => {
    if (!allocateCleanerModal) return;
    try {
      await supervisorApi.allocateCleaner(allocateCleanerModal._id, { cleanerIds: selectedCleanerIds, action: 'set' });
      enqueueSnackbar('Cleaners allocated successfully', { variant: 'success' });
      setAllocateCleanerModal(null);
      setSelectedCleanerIds([]);
      fetchData(pagination.page, pagination.limit);
    } catch (err) {
      enqueueSnackbar('Failed to allocate cleaners', { variant: 'error' });
    }
  };

  const handleAllocateQrStock = async () => {
    if (!allocateQrModal || !qrQuantity) return;
    try {
      await supervisorApi.allocateQr(allocateQrModal._id, { quantity: qrQuantity });
      enqueueSnackbar('QR Code stock allocated successfully', { variant: 'success' });
      setAllocateQrModal(null);
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to allocate QR codes', { variant: 'error' });
    }
  };

  // Work approval mocks
  const handleApproveWorkItem = async (itemId) => {
    try {
      setPendingWorks(prev => prev.filter(w => w.id !== itemId));
      enqueueSnackbar(`Work item ${itemId} approved`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error approving work', { variant: 'error' });
    }
  };

  const handleRejectWorkItem = async (itemId) => {
    try {
      setPendingWorks(prev => prev.filter(w => w.id !== itemId));
      enqueueSnackbar(`Work item ${itemId} rejected`, { variant: 'error' });
    } catch (err) {
      enqueueSnackbar('Error rejecting work', { variant: 'error' });
    }
  };

  const handleBulkApprove = () => {
    const selectedIds = pendingWorks.filter(w => w.checked).map(w => w.id);
    if (selectedIds.length === 0) {
      enqueueSnackbar('Select at least one work item to approve', { variant: 'warning' });
      return;
    }
    setPendingWorks(prev => prev.filter(w => !selectedIds.includes(w.id)));
    enqueueSnackbar(`Bulk approved ${selectedIds.length} work items`, { variant: 'success' });
  };

  const handleExportCSV = () => {
    const headers = ['Supervisor ID', 'Name', 'Mobile', 'Email', 'Region/Zone', 'Apartments', 'Cleaners', 'Rating', 'Status'];
    const rows = supervisors.map(s => [
      s.supervisorCode || `SU-${String(s._id).slice(-3).toUpperCase()}`,
      `${s.firstName} ${s.lastName || ''}`.trim(),
      s.phone || '',
      s.email || '',
      s.assignedZone?.name || 'N/A',
      s.apartmentsCount || 0,
      s.cleanersCount || 0,
      s.performanceRating || '4.0',
      s.isActive ? 'Active' : 'Inactive',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supervisors_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = useMemo(() => {
    return {
      total: stats?.totalSupervisors?.value || 0,
      totalChange: stats?.totalSupervisors?.changePercent !== undefined ? `${stats.totalSupervisors.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(stats.totalSupervisors.changePercent)}%` : '↑ 6.7%',
      active: stats?.activeSupervisors?.value || 0,
      activePercent: stats?.activeSupervisors?.percentOfTotal !== undefined ? `${stats.activeSupervisors.percentOfTotal}%` : '0%',
      inactive: stats?.inactiveSupervisors?.value || 0,
      inactivePercent: stats?.inactiveSupervisors?.percentOfTotal !== undefined ? `${stats.inactiveSupervisors.percentOfTotal}%` : '0%',
      pending: stats?.pendingApprovals?.value || 0,
      pendingChange: stats?.pendingApprovals?.changePercent !== undefined ? `${stats.pendingApprovals.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(stats.pendingApprovals.changePercent)}%` : '↓ 12.5%',
      cleaners: stats?.totalCleaners?.value || 0,
      apartments: stats?.totalApartments?.value || 0,
    };
  }, [stats]);

  // Overall performance charts data
  const performanceTrendData = [
    { day: 'Mon', approvals: 120, rejections: 2 },
    { day: 'Tue', approvals: 145, rejections: 4 },
    { day: 'Wed', approvals: 190, rejections: 1 },
    { day: 'Thu', approvals: 160, rejections: 5 },
    { day: 'Fri', approvals: 210, rejections: 2 },
    { day: 'Sat', approvals: 250, rejections: 3 },
    { day: 'Sun', approvals: 180, rejections: 1 },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Supervisor Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Supervisors</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>
              {activeTabQuery === 'all' && 'All Supervisors'}
              {activeTabQuery === 'apartment-allocation' && 'Apartment Allocation'}
              {activeTabQuery === 'cleaner-allocation' && 'Cleaner Allocation'}
              {activeTabQuery === 'qr-stock' && 'QR Code Stock'}
              {activeTabQuery === 'work-approvals' && 'Work Approvals'}
              {activeTabQuery === 'performance' && 'Performance Overview'}
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
            Add Supervisor
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Supervisors */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Supervisors
              </Typography>
              <Avatar sx={{ bgcolor: '#EFF6FF', width: 36, height: 36 }}>
                <SupervisorAccountIcon sx={{ color: '#2563EB', fontSize: 20 }} />
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

        {/* Active Supervisors */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Supervisors
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

        {/* Inactive Supervisors */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Inactive Supervisors
              </Typography>
              <Avatar sx={{ bgcolor: '#F5F3FF', width: 36, height: 36 }}>
                <BlockIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.inactive}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.inactivePercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Pending Approvals
              </Typography>
              <Avatar sx={{ bgcolor: '#FEF2F2', width: 36, height: 36 }}>
                <HourglassEmptyIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.pending}
            </Typography>
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.pendingChange} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>vs last month</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Total Cleaners */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Cleaners
              </Typography>
              <Avatar sx={{ bgcolor: '#F0FDFA', width: 36, height: 36 }}>
                <PeopleIcon sx={{ color: '#0D9488', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {Number(kpis.cleaners).toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Across all supervisors
            </Typography>
          </Card>
        </Grid>

        {/* Total Apartments */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Apartments
              </Typography>
              <Avatar sx={{ bgcolor: '#F0FDF4', width: 36, height: 36 }}>
                <ApartmentIcon sx={{ color: '#16A34A', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.apartments}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Managed by supervisors
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Conditionally Render Nested Views */}
      {activeTabQuery === 'apartment-allocation' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
            Apartment & Society Allocations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Apartment / Society Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned Supervisor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apartmentsList.map(apt => {
                  // Find if there is a supervisor mapped to this apartment tower
                  const assignedSup = supervisors.find(s => s.allocatedApartments?.includes(apt._id));
                  return (
                    <TableRow key={apt._id}>
                      <TableCell sx={{ fontWeight: 600 }}>{apt.name} ({apt.society})</TableCell>
                      <TableCell>{apt.city}</TableCell>
                      <TableCell>
                        {assignedSup ? (
                          <Chip avatar={<Avatar src={assignedSup.photo} />} label={`${assignedSup.firstName} ${assignedSup.lastName || ''}`} color="primary" variant="outlined" />
                        ) : (
                          <Chip label="Unassigned" color="default" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<AssignmentIndIcon />}
                          onClick={() => {
                            setAllocateApartmentModal(supervisors[0]); // default allocate to first
                            setSelectedAptIds([apt._id]);
                          }}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Change Assignment
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : activeTabQuery === 'cleaner-allocation' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
            Cleaner-to-Supervisor Allocations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Cleaner ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cleaner Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned Supervisor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cleanersList.map(c => {
                  const assignedSup = supervisors.find(s => s.userId?._id === c.supervisorId || s.userId === c.supervisorId);
                  return (
                    <TableRow key={c._id}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.cleanerId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>
                        {assignedSup ? (
                          <Chip avatar={<Avatar src={assignedSup.photo} />} label={`${assignedSup.firstName} ${assignedSup.lastName || ''}`} color="primary" variant="outlined" />
                        ) : (
                          <Chip label="Unassigned" color="default" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<AssignmentIndIcon />}
                          onClick={() => {
                            setAllocateCleanerModal(supervisors[0]);
                            setSelectedCleanerIds([c._id]);
                          }}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Assign Supervisor
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : activeTabQuery === 'qr-stock' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
            Supervisor QR Code Stock Allocation
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Supervisor ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supervisor Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">QR Codes Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">QR Codes Available</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supervisors.map(s => (
                  <TableRow key={s._id}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.supervisorCode}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{s.qrCodesIssued || 250}</TableCell>
                    <TableCell align="right" sx={{ color: '#16A34A', fontWeight: 600 }}>{s.qrCodesAvailable || 32}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<QrCodeIcon />}
                        onClick={() => {
                          setAllocateQrModal(s);
                          setQrQuantity('50');
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Allocate Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : activeTabQuery === 'work-approvals' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Supervisor Cleaning Work Approvals ({pendingWorks.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkApprove}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Bulk Approve Selected
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={pendingWorks.some(w => w.checked) && !pendingWorks.every(w => w.checked)}
                      checked={pendingWorks.length > 0 && pendingWorks.every(w => w.checked)}
                      onChange={(e) => setPendingWorks(prev => prev.map(w => ({ ...w, checked: e.target.checked })))}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Task ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cleaner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Before Photo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>After Photo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingWorks.map(w => (
                  <TableRow key={w.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={w.checked}
                        onChange={(e) => setPendingWorks(prev => prev.map(item => item.id === w.id ? { ...item, checked: e.target.checked } : item))}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{w.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{w.customerName}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>{w.vehicle}</Typography>
                    </TableCell>
                    <TableCell>{w.cleanerName}</TableCell>
                    <TableCell>
                      <Avatar src={w.photoBefore} variant="rounded" sx={{ width: 48, height: 48 }} />
                    </TableCell>
                    <TableCell>
                      <Avatar src={w.photoAfter} variant="rounded" sx={{ width: 48, height: 48 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton onClick={() => handleApproveWorkItem(w.id)} color="success" size="small"><ThumbUpIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => handleRejectWorkItem(w.id)} color="error" size="small"><ThumbDownIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingWorks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>No pending work submittals for approval</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : activeTabQuery === 'performance' ? (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
            Supervisor Weekly Performance Overview (Work Approvals vs Rejections)
          </Typography>
          <Box sx={{ height: 320, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} name="Approvals" />
                <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={3} name="Rejections" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      ) : (
        <>
          {/* Filter Bar */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
            <TextField
              size="small"
              placeholder="Search by name, mobile or supervisor ID..."
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
            </TextField>

            <TextField
              select
              size="small"
              label="Apartment"
              value={apartmentFilter}
              onChange={(e) => setApartmentFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Apartments</MenuItem>
              {apartmentsList.map((a) => (
                <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
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
              {zonesList.map((z) => (
                <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>
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
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Loading supervisors data...</Typography>
              </Box>
            ) : (
              <>
                <Table sx={{ minWidth: 1100, tableLayout: 'fixed' }}>
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px', cursor: 'pointer' }} onClick={() => handleSort('supervisorCode')}>
                        Supervisor ID <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '220px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                        Name <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '180px' }}>Mobile</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '120px', cursor: 'pointer' }} align="center" onClick={() => handleSort('apartments')}>
                        Apartments <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '110px', cursor: 'pointer' }} align="center" onClick={() => handleSort('cleaners')}>
                        Cleaners <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '130px', cursor: 'pointer' }} align="center" onClick={() => handleSort('rating')}>
                        Performance <SwapVertIcon fontSize="inherit" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '120px' }} align="center">Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, width: '150px' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supervisors.map((row) => {
                      const sCode = row.supervisorCode || `SU-${String(row._id).slice(-3).toUpperCase()}`;
                      return (
                        <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography
                              onClick={() => {
                                setSelectedSupervisor(row);
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
                              {sCode}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={row.photo} sx={{ width: 32, height: 32, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
                                {row.firstName ? row.firstName[0].toUpperCase() : 'S'}
                              </Avatar>
                              <Typography sx={{ fontWeight: 500, color: '#1E293B', fontSize: '0.875rem' }}>
                                {`${row.firstName} ${row.lastName || ''}`.trim()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap', color: '#475569', fontSize: '0.875rem' }}>
                            {row.phone}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }} align="center">
                            {row.apartmentsCount || 0}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }} align="center">
                            {row.cleanersCount || 0}
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }} align="center">
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                              <StarIcon sx={{ color: '#F59E0B', fontSize: 14 }} />
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706' }}>
                                {row.performanceRating || '4.0'}
                              </Typography>
                            </Box>
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
                                ...(row.isActive
                                  ? { bgcolor: '#ECFDF5', color: '#065F46' }
                                  : { bgcolor: '#FEF2F2', color: '#991B1B' }
                                ),
                              }}
                            >
                              {row.isActive ? 'Active' : 'Inactive'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }} align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedSupervisor(row);
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
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} supervisors
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{ sx: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 2, border: '1px solid #F1F5F9', minWidth: 160 } }}
      >
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
            setAllocateCleanerModal(activeMenuRow);
            setSelectedCleanerIds(activeMenuRow.allocatedCleaners?.map(c => c._id || c) || []);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <AssignmentIndIcon fontSize="small" /> Allocate Cleaner
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAllocateApartmentModal(activeMenuRow);
            setSelectedAptIds(activeMenuRow.allocatedApartments?.map(a => a._id || a) || []);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <ApartmentIcon fontSize="small" /> Allocate Apartment
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAllocateQrModal(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <QrCodeIcon fontSize="small" /> Allocate QR Stock
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteTarget(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
        >
          <DeleteIcon fontSize="small" /> Delete Supervisor
        </MenuItem>
      </Menu>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedSupervisor)}
        onClose={() => setSelectedSupervisor(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderLeft: '1px solid #E2E8F0' } }}
      >
        {selectedSupervisor && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
            {/* Header */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={selectedSupervisor.photo} sx={{ width: 64, height: 64, border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {selectedSupervisor.firstName ? selectedSupervisor.firstName[0].toUpperCase() : 'S'}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {selectedSupervisor.firstName} {selectedSupervisor.lastName}
                    </Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: '100px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: selectedSupervisor.isActive ? '#ECFDF5' : '#FEF2F2',
                        color: selectedSupervisor.isActive ? '#065F46' : '#991B1B',
                      }}
                    >
                      {selectedSupervisor.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: 600, mb: 0.25 }}>
                    {selectedSupervisor.supervisorCode || `SU-${String(selectedSupervisor._id).slice(-3).toUpperCase()}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    Supervisor
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                      {selectedSupervisor.performanceRating || '4.5'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      (256 Ratings)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedSupervisor(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #E2E8F0', px: 2 }}>
              <Tabs value={drawerTab} onChange={(e, val) => setDrawerTab(val)} variant="fullWidth">
                <Tab label="Profile" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Apartments" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Cleaners" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
                <Tab label="Performance" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
              </Tabs>
            </Box>

            {/* Drawer Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {drawerTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Personal Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Mobile Number</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Date of Birth</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>15 Aug 1986</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>#45, 2nd Cross, HSR Layout, Bangalore - 560102</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Work Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Joining Date</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{format(new Date(selectedSupervisor.joiningDate), 'dd MMM yyyy')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Region</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.assignedZone?.name || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Total Apartments</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.apartmentsCount || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Total Cleaners</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.cleanersCount || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>QR Codes Issued</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSupervisor.qrCodesIssued || 250}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>QR Codes Available</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#16A34A' }}>{selectedSupervisor.qrCodesAvailable || 32}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {drawerTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>Assigned Apartments</Typography>
                  {selectedSupervisor.allocatedApartments?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {selectedSupervisor.allocatedApartments.map((apt, idx) => (
                        <Card key={idx} sx={{ p: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{apt.name || 'Apartment Complex'}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>{apt.society || 'Bangalore society'}</Typography>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#64748B' }}>No apartments explicitly allocated</Typography>
                  )}
                </Box>
              )}

              {drawerTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>Assigned Cleaners</Typography>
                  {selectedSupervisor.allocatedCleaners?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {selectedSupervisor.allocatedCleaners.map((c, idx) => (
                        <Card key={idx} sx={{ p: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>ID: {c.cleanerId} | Phone: {c.phone}</Typography>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#64748B' }}>No cleaners explicitly allocated</Typography>
                  )}
                </Box>
              )}

              {drawerTab === 3 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 2 }}>Supervisor Metrics</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Work Approvals</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedSupervisor.workApprovalsCount || '1,256'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Rejections</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>{selectedSupervisor.workRejectionsCount || '24'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Completion Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>96.2%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Average Rating</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedSupervisor.performanceRating || '4.7'}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
              <Button variant="outlined" fullWidth sx={{ textTransform: 'none', fontWeight: 600 }}>View Full Profile</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Allocate Apartment Dialog */}
      <Dialog open={Boolean(allocateApartmentModal)} onClose={() => { setAllocateApartmentModal(null); setSelectedAptIds([]); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Allocate Apartments to Supervisor</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 1.5 }}>
          <TextField
            select
            size="small"
            label="Select Apartment Complexes"
            value={selectedAptIds}
            onChange={(e) => setSelectedAptIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            fullWidth
            SelectProps={{
              multiple: true,
              renderValue: (selected) => {
                const names = selected.map(id => apartmentsList.find(a => a._id === id)?.name).filter(Boolean);
                return names.join(', ');
              }
            }}
          >
            {apartmentsList.map(a => (
              <MenuItem key={a._id} value={a._id}>
                <Checkbox checked={selectedAptIds.indexOf(a._id) > -1} />
                {a.name} ({a.society})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAllocateApartmentModal(null); setSelectedAptIds([]); }}>Cancel</Button>
          <Button onClick={handleAllocateApartment} variant="contained" color="primary">Allocate</Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Cleaner Dialog */}
      <Dialog open={Boolean(allocateCleanerModal)} onClose={() => { setAllocateCleanerModal(null); setSelectedCleanerIds([]); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Allocate Cleaners to Supervisor</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 1.5 }}>
          <TextField
            select
            size="small"
            label="Select Cleaners"
            value={selectedCleanerIds}
            onChange={(e) => setSelectedCleanerIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            fullWidth
            SelectProps={{
              multiple: true,
              renderValue: (selected) => {
                const names = selected.map(id => {
                  const c = cleanersList.find(cleaner => cleaner._id === id);
                  return c ? `${c.firstName} ${c.lastName || ''}` : '';
                }).filter(Boolean);
                return names.join(', ');
              }
            }}
          >
            {cleanersList.map(c => (
              <MenuItem key={c._id} value={c._id}>
                <Checkbox checked={selectedCleanerIds.indexOf(c._id) > -1} />
                {c.firstName} {c.lastName} ({c.cleanerId})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAllocateCleanerModal(null); setSelectedCleanerIds([]); }}>Cancel</Button>
          <Button onClick={handleAllocateCleaner} variant="contained" color="primary">Allocate</Button>
        </DialogActions>
      </Dialog>

      {/* Allocate QR Dialog */}
      <Dialog open={Boolean(allocateQrModal)} onClose={() => setAllocateQrModal(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Allocate QR Code Stock</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1.5 }}>
          <TextField
            size="small"
            label="Quantity to Issue"
            type="number"
            value={qrQuantity}
            onChange={(e) => setQrQuantity(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocateQrModal(null)}>Cancel</Button>
          <Button onClick={handleAllocateQrStock} variant="contained" color="primary">Allocate</Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={Boolean(formDialog)} onClose={() => setFormDialog(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>{formDialog?.mode === 'add' ? 'Add New Supervisor' : 'Edit Supervisor'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5, minWidth: 360 }}>
          <TextField
            size="small"
            label="First Name"
            value={formDialog?.data.firstName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, firstName: e.target.value } }))}
            error={Boolean(formErrors.firstName)}
            helperText={formErrors.firstName}
            fullWidth
          />
          <TextField
            size="small"
            label="Last Name"
            value={formDialog?.data.lastName || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, lastName: e.target.value } }))}
            fullWidth
          />
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
            fullWidth
          />
          {formDialog?.mode === 'add' && (
            <TextField
              size="small"
              label="Password"
              type="password"
              value={formDialog?.data.password || ''}
              onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, password: e.target.value } }))}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
              fullWidth
            />
          )}
          <TextField
            select
            size="small"
            label="Assign Zone/Region"
            value={formDialog?.data.assignedZone || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, assignedZone: e.target.value } }))}
            fullWidth
          >
            {zonesList.map(z => (
              <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button onClick={handleSaveSupervisor} variant="contained" color="primary">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Supervisor"
        message={`Are you sure you want to permanently delete supervisor "${deleteTarget?.firstName} ${deleteTarget?.lastName || ''}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default SupervisorListPage;
