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
import Menu from '@mui/material/Menu';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import { format } from 'date-fns';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// APIs
import { qrApi, vehicleApi, customerApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const QR_TYPES = [
  { id: 'Booking', label: 'Booking', color: '#EFF6FF', textColor: '#2563EB' },
  { id: 'Feedback', label: 'Feedback', color: '#ECFDF5', textColor: '#10B981' },
  { id: 'Subscription', label: 'Subscription', color: '#F5F3FF', textColor: '#8B5CF6' },
  { id: 'Service', label: 'Service', color: '#FFF7ED', textColor: '#EA580C' },
  { id: 'Promotion', label: 'Promotion', color: '#FEF2F2', textColor: '#EF4444' },
  { id: 'App Download', label: 'App Download', color: '#ECFEFF', textColor: '#0891B2' },
  { id: 'Partner', label: 'Partner', color: '#EEF2F6', textColor: '#475569' },
  { id: 'Event', label: 'Event', color: '#FEF3C7', textColor: '#D97706' },
  { id: 'Car', label: 'Car', color: '#F0FDF4', textColor: '#16A34A' }
];

const LOCATIONS = ['Green View Heights, Bangalore', 'Skyline Residency, Bangalore', 'HSR Layout, Bangalore', 'Koramangala, Bangalore', 'Whitefield, Bangalore', 'Jayanagar, Bangalore', 'Indiranagar, Bangalore', 'Marathahalli, Bangalore', 'Sarjapur Road, Bangalore'];

const QRListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();

  // Lists & Stats
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Active filters applied
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    type: '',
    locationFilter: '',
  });

  // Selected details drawer
  const [selectedQR, setSelectedQR] = useState(null);

  // Dialogs
  const [genDialog, setGenDialog] = useState(false);
  const [genForm, setGenForm] = useState({
    name: '',
    purpose: '',
    type: 'Booking',
    location: 'Green View Heights, Bangalore',
    vehicleId: '',
    customerId: '',
  });
  const [generating, setGenerating] = useState(false);

  // Scan History dialog
  const [historyDialog, setHistoryDialog] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Confirm delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Confirm replace Target
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceReason, setReplaceReason] = useState('');
  const [replaceLoading, setReplaceLoading] = useState(false);

  // Confirm damaged Target
  const [damagedTarget, setDamagedTarget] = useState(null);
  const [damagedReason, setDamagedReason] = useState('');
  const [damagedLoading, setDamagedLoading] = useState(false);

  // Dropdown lists
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicleInput, setVehicleInput] = useState('');
  const [customerInput, setCustomerInput] = useState('');

  const fetchDropdownData = useCallback(async () => {
    try {
      const [vRes, cRes] = await Promise.allSettled([
        vehicleApi.list({ limit: 100 }),
        customerApi.list({ limit: 100 }),
      ]);
      if (vRes.status === 'fulfilled' && vRes.value?.data) setVehicles(vRes.value.data);
      if (cRes.status === 'fulfilled' && cRes.value?.data) setCustomers(cRes.value.data);
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await qrApi.list({
        page,
        limit,
        search: appliedFilters.search,
        status: appliedFilters.status || undefined,
        type: appliedFilters.type || undefined,
      });

      if (res?.success) {
        let sortedData = [...(res.data || [])];

        // Frontend location filtering
        if (appliedFilters.locationFilter) {
          sortedData = sortedData.filter(q => q.location === appliedFilters.locationFilter);
        }

        // Apply sorting
        sortedData.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (sortField === 'scans') {
            valA = a.scannedCount || 0;
            valB = b.scannedCount || 0;
          }

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setQrCodes(sortedData);
        setPagination({
          page: res.pagination?.page || page,
          limit: res.pagination?.limit || limit,
          total: sortedData.length,
          totalPages: Math.ceil(sortedData.length / limit),
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to fetch QR codes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortField, sortOrder, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await qrApi.getStats();
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

  // Sidebar deep link parameters listener
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (action === 'generate') {
      setGenDialog(true);
      navigate(location.pathname, { replace: true });
    }

    if (tab === 'history') {
      // Just filter showing active scans or similar
    }
  }, [location.search, navigate]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      status,
      type,
      locationFilter,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setLocationFilter('');
    setAppliedFilters({
      search: '',
      status: '',
      type: '',
      locationFilter: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleGenerateQR = async () => {
    if (genForm.type === 'Car' && (!genForm.vehicleId || !genForm.customerId)) {
      enqueueSnackbar('Please select a vehicle and customer for Car QR type', { variant: 'warning' });
      return;
    }
    setGenerating(true);
    try {
      const payload = { ...genForm };
      if (!payload.vehicleId) delete payload.vehicleId;
      if (!payload.customerId) delete payload.customerId;

      await qrApi.generate(payload);
      enqueueSnackbar('QR Code generated successfully', { variant: 'success' });
      setGenDialog(false);
      setGenForm({
        name: '',
        purpose: '',
        type: 'Booking',
        location: 'Green View Heights, Bangalore',
        vehicleId: '',
        customerId: '',
      });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to generate QR Code', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await qrApi.activate(id);
      enqueueSnackbar('QR Code activated successfully', { variant: 'success' });
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedQR && selectedQR._id === id) {
        setSelectedQR(prev => ({ ...prev, status: 'active' }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to activate QR Code', { variant: 'error' });
    }
  };

  const handleDeactivate = (id) => {
    const row = qrCodes.find(q => q._id === id) || (selectedQR?._id === id ? selectedQR : null);
    if (row) {
      setDamagedTarget(row);
      setDamagedReason('');
    }
  };

  const handleReplaceQR = async () => {
    if (!replaceTarget) return;
    setReplaceLoading(true);
    try {
      await qrApi.replace(replaceTarget._id, { reason: replaceReason || 'Manual replacement' });
      enqueueSnackbar('QR Code replaced and new active code generated successfully', { variant: 'success' });
      setReplaceTarget(null);
      setReplaceReason('');
      if (selectedQR && selectedQR._id === replaceTarget._id) {
        setSelectedQR(null);
      }
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to replace QR Code', { variant: 'error' });
    } finally {
      setReplaceLoading(false);
    }
  };

  const handleReportDamaged = async () => {
    if (!damagedTarget) return;
    setDamagedLoading(true);
    try {
      await qrApi.reportDamaged(damagedTarget._id, { reason: damagedReason || 'Damaged' });
      enqueueSnackbar('QR Code reported as damaged successfully', { variant: 'warning' });
      setDamagedTarget(null);
      setDamagedReason('');
      if (selectedQR && selectedQR._id === damagedTarget._id) {
        setSelectedQR(prev => ({ ...prev, status: 'damaged' }));
      }
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to report damaged', { variant: 'error' });
    } finally {
      setDamagedLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await qrApi.delete(deleteTarget._id);
      enqueueSnackbar('QR Code deleted permanently', { variant: 'success' });
      setDeleteTarget(null);
      if (selectedQR && selectedQR._id === deleteTarget._id) {
        setSelectedQR(null);
      }
      fetchData(1, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete QR Code', { variant: 'error' });
    }
  };

  const handleShowHistory = async (row) => {
    setHistoryDialog(row);
    setHistoryLoading(true);
    try {
      const res = await qrApi.getScanHistory(row._id, { limit: 50 });
      setHistoryData(res.data || []);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDownload = (id, formatType = 'png') => {
    const token = localStorage.getItem('accessToken');
    let url;
    if (formatType === 'png') {
      url = qrApi.downloadPngUrl(id);
    } else if (formatType === 'svg') {
      url = qrApi.downloadSvgUrl(id);
    } else {
      url = qrApi.downloadPdfUrl(id);
    }
    
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('Download failed');
        return r.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `gmc_qr_${id.slice(-6)}.${formatType}`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => enqueueSnackbar('Download failed', { variant: 'error' }));
  };

  const handleCopyLink = (code) => {
    const link = `https://gomotarcar.com/b/${code}`;
    navigator.clipboard.writeText(link);
    enqueueSnackbar('Short URL copied to clipboard!', { variant: 'success' });
  };

  const handleOpenActionMenu = (event, row) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveMenuRow(row);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveMenuRow(null);
  };

  const selectedVehicle = vehicles.find(v => v._id === genForm.vehicleId);
  const selectedCustomer = customers.find(c => c._id === genForm.customerId);

  const kpis = useMemo(() => {
    const total = stats?.total || 1256;
    const active = stats?.active || 1032;
    const damaged = stats?.damaged || 142;
    const expired = stats?.expired || 82;
    const scans = stats?.totalScans || 45672;

    return {
      total: total.toLocaleString(),
      active: active.toLocaleString(),
      activePercent: `${Math.round((active / (total || 1)) * 100)}%`,
      inactive: damaged.toLocaleString(),
      inactivePercent: `${Math.round((damaged / (total || 1)) * 100)}%`,
      expired: expired.toLocaleString(),
      expiredPercent: `${Math.round((expired / (total || 1)) * 100)}%`,
      scans: scans.toLocaleString(),
    };
  }, [stats]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            QR Code Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>QR Code Management</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>All QR Codes</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={() => {}}
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
            startIcon={<QrCode2Icon />}
            onClick={() => setGenDialog(true)}
            sx={{
              backgroundColor: '#2563EB',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              '&:hover': { backgroundColor: '#1D4ED8' }
            }}
          >
            Generate QR Code
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total QR Codes */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total QR Codes
              </Typography>
              <Avatar sx={{ bgcolor: '#EFF6FF', width: 36, height: 36 }}>
                <QrCodeIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              All time generated
            </Typography>
          </Card>
        </Grid>

        {/* Active QR Codes */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active QR Codes
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

        {/* Inactive QR Codes */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Inactive QR Codes
              </Typography>
              <Avatar sx={{ bgcolor: '#FFFBEB', width: 36, height: 36 }}>
                <BlockIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.inactive}
            </Typography>
            <Typography variant="body2" sx={{ color: '#D97706', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.inactivePercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Expired QR Codes */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Expired QR Codes
              </Typography>
              <Avatar sx={{ bgcolor: '#FEF2F2', width: 36, height: 36 }}>
                <DeleteIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.expired}
            </Typography>
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.expiredPercent} <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Total Scans */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Scans
              </Typography>
              <Avatar sx={{ bgcolor: '#F5F3FF', width: 36, height: 36 }}>
                <HistoryIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.scans}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              All time scans
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
        <TextField
          size="small"
          placeholder="Search by name, type, location or QR ID..."
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
          <MenuItem value="pending_activation">Pending</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {QR_TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
        </TextField>

        <TextField
          select
          size="small"
          label="Location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Locations</MenuItem>
          {LOCATIONS.map(l => <MenuItem key={l} value={l}>{l.split(',')[0]}</MenuItem>)}
        </TextField>

        <TextField
          size="small"
          label="Created On"
          type="date"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

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
          Filters
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
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading QR codes data...</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 1100, tableLayout: 'auto' }}>
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} onClick={() => handleSort('code')}>
                    QR ID <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }}>Name / Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} onClick={() => handleSort('type')}>
                    Type <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                    Created On <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} align="center" onClick={() => handleSort('scans')}>
                    Scans <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qrCodes.map((row) => {
                  const typeDef = QR_TYPES.find(t => t.id === row.type) || { color: '#EEF2F6', textColor: '#475569', label: row.type || 'Car' };
                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QrCodeIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          <Typography
                            onClick={() => setSelectedQR(row)}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: '#2563EB',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {row.code}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>
                          {row.name || (row.vehicleId ? `Vehicle QR (${row.vehicleId.vehicleNumber})` : 'System QR')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                          {row.purpose || (row.vehicleId ? `On-vehicle scan for cleaners` : 'General purposes')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={typeDef.label}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            bgcolor: typeDef.color,
                            color: typeDef.textColor
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>
                          {row.location?.split(',')[0] || 'System Wide'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          {row.location?.split(',')[1]?.trim() || 'Bangalore'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                        <Typography sx={{ fontWeight: 500, color: '#475569' }}>
                          {row.issuedAt ? format(new Date(row.issuedAt), 'dd MMM yyyy') : format(new Date(row.createdAt), 'dd MMM yyyy')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                          {row.issuedAt ? format(new Date(row.issuedAt), 'hh:mm a') : format(new Date(row.createdAt), 'hh:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 700 }} align="center">
                        {row.scannedCount || 0}
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
                            ...(row.status === 'active'
                              ? { bgcolor: '#ECFDF5', color: '#065F46' }
                              : row.status === 'expired'
                              ? { bgcolor: '#FEF2F2', color: '#991B1B' }
                              : { bgcolor: '#FFFBEB', color: '#92400E' } // pending_activation, damaged, replaced
                            ),
                          }}
                        >
                          {row.status === 'active' ? 'Active' : row.status === 'expired' ? 'Expired' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedQR(row)}
                              sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PNG">
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(row._id, 'png')}
                              sx={{ color: '#64748B', '&:hover': { color: '#16A34A', bgcolor: '#F0FDF4' } }}
                            >
                              <FileDownloadIcon fontSize="small" />
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
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} QR codes
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
        <MenuItem
          onClick={() => {
            handleShowHistory(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <HistoryIcon fontSize="small" sx={{ color: '#64748B' }} /> Scan History
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDownload(activeMenuRow._id, 'svg');
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <FileDownloadIcon fontSize="small" sx={{ color: '#64748B' }} /> Download SVG
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDownload(activeMenuRow._id, 'pdf');
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, fontSize: '0.875rem' }}
        >
          <FileDownloadIcon fontSize="small" sx={{ color: '#64748B' }} /> Download PDF
        </MenuItem>
        {activeMenuRow?.status !== 'active' ? (
          <MenuItem
            onClick={() => {
              handleActivate(activeMenuRow._id);
              handleCloseActionMenu();
            }}
            sx={{ gap: 1, color: '#10B981', fontSize: '0.875rem' }}
          >
            <CheckCircleIcon fontSize="small" /> Activate QR
          </MenuItem>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                handleDeactivate(activeMenuRow._id);
                handleCloseActionMenu();
              }}
              sx={{ gap: 1, color: '#F59E0B', fontSize: '0.875rem' }}
            >
              <BlockIcon fontSize="small" /> Report Damaged
            </MenuItem>
            {activeMenuRow?.type === 'Car' && (
              <MenuItem
                onClick={() => {
                  setReplaceTarget(activeMenuRow);
                  setReplaceReason('');
                  handleCloseActionMenu();
                }}
                sx={{ gap: 1, color: '#2563EB', fontSize: '0.875rem' }}
              >
                <RestartAltIcon fontSize="small" /> Replace QR Code
              </MenuItem>
            )}
          </>
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
        open={Boolean(selectedQR)}
        onClose={() => setSelectedQR(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 500 }, borderLeft: 'none' } }}
      >
        {selectedQR && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', display: 'inline', mr: 1.5 }}>
                  QR Code Details
                </Typography>
                <Chip
                  label={selectedQR.status === 'active' ? 'Active' : selectedQR.status === 'expired' ? 'Expired' : 'Inactive'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                    ...(selectedQR.status === 'active'
                      ? { bgcolor: '#ECFDF5', color: '#065F46' }
                      : selectedQR.status === 'expired'
                      ? { bgcolor: '#FEF2F2', color: '#991B1B' }
                      : { bgcolor: '#FFFBEB', color: '#92400E' }
                    )
                  }}
                />
              </Box>
              <IconButton onClick={() => setSelectedQR(null)} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1E293B', textAlign: 'center', mb: -1 }}>
                {selectedQR.code}
              </Typography>

              {/* QR Image block */}
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    borderColor: '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                    width: '100%',
                    maxWidth: 400,
                  }}
                >
                  <img
                    src={qrApi.imageUrl(selectedQR._id)}
                    alt="QR Code Sticker"
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </Paper>
              </Box>

              {/* Download & Share Actions */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: -0.5 }}>Downloads</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<FileDownloadIcon sx={{ fontSize: '0.875rem' }} />}
                      onClick={() => handleDownload(selectedQR._id, 'png')}
                      sx={{
                        backgroundColor: '#2563EB',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        py: 0.75,
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#1D4ED8' }
                      }}
                    >
                      PNG
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<FileDownloadIcon sx={{ fontSize: '0.875rem' }} />}
                      onClick={() => handleDownload(selectedQR._id, 'svg')}
                      sx={{
                        backgroundColor: '#10B981',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        py: 0.75,
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#0D9488' }
                      }}
                    >
                      SVG
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<FileDownloadIcon sx={{ fontSize: '0.875rem' }} />}
                      onClick={() => handleDownload(selectedQR._id, 'pdf')}
                      sx={{
                        backgroundColor: '#8B5CF6',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        py: 0.75,
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#7C3AED' }
                      }}
                    >
                      PDF
                    </Button>
                  </Grid>
                </Grid>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShareIcon />}
                  onClick={() => handleCopyLink(selectedQR.code)}
                  sx={{
                    borderColor: '#E2E8F0',
                    color: '#475569',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF',
                    '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }
                  }}
                >
                  Share Code (Copy Link)
                </Button>
              </Box>

              <Divider />

              {/* Metadata */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>QR Metadata</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Name / Purpose</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedQR.name || 'System QR'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>{selectedQR.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', maxWidth: 220 }}>
                    {selectedQR.location || 'System Wide'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Created On</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedQR.issuedAt ? format(new Date(selectedQR.issuedAt), 'dd MMM yyyy, hh:mm a') : format(new Date(selectedQR.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Created By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Admin User</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Short URL</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2563EB', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      gomotarcar.com/b/{selectedQR.code}
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyLink(selectedQR.code)}>
                      <ContentCopyIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Status</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: selectedQR.status === 'active' ? '#16A34A' : '#EF4444' }}>
                    {selectedQR.status}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Scan Summary */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Scan Summary</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Total Scans</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedQR.scannedCount || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Unique Scanners</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedQR.uniqueScans || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>Last Scanned On</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedQR.lastScannedAt ? format(new Date(selectedQR.lastScannedAt), 'dd MMM yyyy, hh:mm a') : 'Never Scanned'}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="text"
                startIcon={<HistoryIcon />}
                onClick={() => handleShowHistory(selectedQR)}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600, color: '#2563EB', pl: 0, mb: 1 }}
              >
                View Scan History &rarr;
              </Button>

              <Divider />

              {/* Status Actions */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: -0.5 }}>Status Management</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {selectedQR.status !== 'active' ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleActivate(selectedQR._id)}
                    sx={{
                      backgroundColor: '#10B981',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      flexGrow: 1,
                      py: 1,
                      '&:hover': { backgroundColor: '#0D9488' }
                    }}
                  >
                    Activate QR Code
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<BlockIcon />}
                      onClick={() => setDamagedTarget(selectedQR)}
                      sx={{
                        backgroundColor: '#F59E0B',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        flexGrow: 1,
                        py: 1,
                        '&:hover': { backgroundColor: '#D97706' }
                      }}
                    >
                      Report Damaged
                    </Button>
                    {selectedQR.type === 'Car' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={() => setReplaceTarget(selectedQR)}
                        sx={{
                          backgroundColor: '#2563EB',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          flexGrow: 1,
                          py: 1,
                          '&:hover': { backgroundColor: '#1D4ED8' }
                        }}
                      >
                        Replace QR
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteTarget(selectedQR)}
                  sx={{
                    borderColor: '#FEE2E2',
                    color: '#EF4444',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    '&:hover': { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Generate Dialog */}
      <Dialog open={genDialog} onClose={() => setGenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Generate QR Code</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            pt: 3.5,
            pb: 1,
            '& .MuiInputLabel-root': {
              color: '#64748B !important',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2563EB !important',
            },
          }}
        >
          <TextField
            size="small"
            label="Name / Purpose"
            placeholder="e.g. Customer Booking, HSR Feedback"
            value={genForm.name}
            onChange={(e) => setGenForm(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1 }}
          />
          <TextField
            size="small"
            label="Purpose Details / Description"
            placeholder="e.g. Scan to open booking form, Scan to give feedback"
            value={genForm.purpose}
            onChange={(e) => setGenForm(prev => ({ ...prev, purpose: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                label="Type"
                value={genForm.type}
                onChange={(e) => setGenForm(prev => ({ ...prev, type: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              >
                {QR_TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                label="Location"
                value={genForm.location}
                onChange={(e) => setGenForm(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              >
                {LOCATIONS.map(l => <MenuItem key={l} value={l}>{l.split(',')[0]}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          {genForm.type === 'Car' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Autocomplete
                options={vehicles}
                getOptionLabel={(option) => `${option.vehicleNumber || ''} - ${option.make || ''} ${option.model || ''}`}
                value={selectedVehicle || null}
                inputValue={vehicleInput}
                onInputChange={(_, v) => setVehicleInput(v)}
                onChange={(_, v) => setGenForm(f => ({ ...f, vehicleId: v?._id || '' }))}
                renderInput={(params) => (
                  <TextField {...params} label="Select Vehicle" placeholder="Search by plate number..." fullWidth required InputLabelProps={{ shrink: true }} />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Box>
                      <Box sx={{ fontWeight: 600 }}>{option.vehicleNumber}</Box>
                      <Box sx={{ fontSize: '0.75rem', color: '#64748B' }}>{option.make} {option.model}</Box>
                    </Box>
                  </li>
                )}
                noOptionsText="No active vehicles found"
              />

              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''} (${option.phone || ''})`}
                value={selectedCustomer || null}
                inputValue={customerInput}
                onInputChange={(_, v) => setCustomerInput(v)}
                onChange={(_, v) => setGenForm(f => ({ ...f, customerId: v?._id || '' }))}
                renderInput={(params) => (
                  <TextField {...params} label="Select Customer" placeholder="Search by name or phone..." fullWidth required InputLabelProps={{ shrink: true }} />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Box>
                      <Box sx={{ fontWeight: 600 }}>{option.firstName} {option.lastName}</Box>
                      <Box sx={{ fontSize: '0.75rem', color: '#64748B' }}>{option.phone}</Box>
                    </Box>
                  </li>
                )}
                noOptionsText="No customers found"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setGenDialog(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleGenerateQR} variant="contained" disabled={generating} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {generating ? 'Generating...' : 'Generate QR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scan History Dialog */}
      <Dialog open={!!historyDialog} onClose={() => setHistoryDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>Scan History — {historyDialog?.code}</Box>
          <IconButton onClick={() => setHistoryDialog(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <Box sx={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </Box>
          ) : historyData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ErrorOutlineIcon sx={{ color: '#94A3B8', fontSize: 40, mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#64748B' }}>No scans recorded for this QR code yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Scanned Date/Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scanned By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Device / Browser</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{format(new Date(entry.scannedAt), 'dd MMM yyyy, hh:mm a')}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{entry.name || 'Anonymous'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        <Chip label={entry.role || 'public'} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{entry.ip || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.device || 'web'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setHistoryDialog(null)} variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Replace Dialog */}
      <Dialog open={!!replaceTarget} onClose={() => setReplaceTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Replace QR Code</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            This will deactivate the current QR code <strong>{replaceTarget?.code}</strong> and generate a brand-new unique QR code for the vehicle <strong>{replaceTarget?.vehicleId?.vehicleNumber}</strong>.
          </Typography>
          <TextField
            autoFocus
            size="small"
            label="Reason for Replacement"
            placeholder="e.g. Lost tag, user requested new tag"
            value={replaceReason}
            onChange={(e) => setReplaceReason(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReplaceTarget(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleReplaceQR} variant="contained" disabled={replaceLoading} sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>
            {replaceLoading ? 'Replacing...' : 'Replace QR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Damaged Dialog */}
      <Dialog open={!!damagedTarget} onClose={() => setDamagedTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Report QR Code as Damaged</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            Mark the QR code <strong>{damagedTarget?.code}</strong> as damaged. This will flag it in the system.
          </Typography>
          <TextField
            autoFocus
            size="small"
            label="Damage Details / Reason"
            placeholder="e.g. Scratch on scan face, peeling off car bumper"
            value={damagedReason}
            onChange={(e) => setDamagedReason(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDamagedTarget(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleReportDamaged} variant="contained" disabled={damagedLoading} sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: '#F59E0B', '&:hover': { backgroundColor: '#D97706' } }}>
            {damagedLoading ? 'Reporting...' : 'Report Damaged'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete QR Code"
        message={`Are you sure you want to delete QR code ${deleteTarget?.code}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </Box>
  );
};

export default QRListPage;
