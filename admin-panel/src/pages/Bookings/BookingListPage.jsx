import React, { useState, useEffect, useCallback } from 'react';
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
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import { useSnackbar } from 'notistack';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import BuildIcon from '@mui/icons-material/Build';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SettingsIcon from '@mui/icons-material/Settings';

// APIs
import { bookingApi, customerApi, vehicleApi, franchiseApi, marketplaceApi } from '../../services/api';

const statusFlow = ['booked', 'accepted', 'in_progress', 'completed'];

const BookingListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [stats, setStats] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [franchiseId, setFranchiseId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Date Picker Popover
  const [dateAnchorEl, setDateAnchorEl] = useState(null);

  // Lists for dropdown options
  const [franchises, setFranchises] = useState([]);
  const [servicesList, setServicesList] = useState([
    'Periodic Service', 'Steam Car Wash', 'AC Service', 'Battery Replacement', 'Wheel Care'
  ]);

  // Drawer / Dialogs state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  
  // New Booking Form State
  const [newBookingData, setNewBookingData] = useState({
    customerId: '',
    vehicleId: '',
    serviceName: 'Periodic Service',
    franchiseId: '',
    slotDate: '',
    slotTime: '10:00 AM',
    serviceMode: 'workshop',
    basePrice: 1500,
    discount: 0
  });
  const [customersList, setCustomersList] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);

  // Fetch lists for dropdowns
  const fetchFilterOptions = useCallback(async () => {
    try {
      const fRes = await franchiseApi.list({ limit: 100 });
      if (fRes?.data) setFranchises(fRes.data);
      
      const cRes = await customerApi.list({ limit: 100 });
      if (cRes?.data) setCustomersList(cRes.data);
      
      const catRes = await marketplaceApi.listCategories({ limit: 100 });
      if (catRes?.data && catRes.data.length > 0) {
        setServicesList(catRes.data.map(cat => cat.name));
      }
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  }, []);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await bookingApi.list({
        page,
        limit,
        search,
        status,
        serviceType,
        franchiseId,
        fromDate,
        toDate
      });
      if (res?.data) {
        setBookings(res.data);
        setPagination(res.pagination || { page, limit, total: res.data.length });
      }
    } catch (err) {
      enqueueSnackbar('Failed to fetch bookings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, status, serviceType, franchiseId, fromDate, toDate, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await bookingApi.getStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
    fetchStats();
  }, [fetchData, fetchStats, pagination.page, pagination.limit]);

  // Load vehicles when customer changes in New Booking form
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!newBookingData.customerId) {
        setCustomerVehicles([]);
        return;
      }
      try {
        const res = await vehicleApi.listByCustomer(newBookingData.customerId);
        if (res?.data) {
          setCustomerVehicles(res.data);
          if (res.data.length > 0) {
            setNewBookingData(prev => ({ ...prev, vehicleId: res.data[0]._id }));
          } else {
            setNewBookingData(prev => ({ ...prev, vehicleId: '' }));
          }
        }
      } catch (err) {
        console.error('Failed to load customer vehicles', err);
      }
    };
    fetchVehicles();
  }, [newBookingData.customerId]);

  const handleCreateBooking = async () => {
    if (!newBookingData.customerId || !newBookingData.vehicleId || !newBookingData.slotDate) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }
    try {
      const res = await bookingApi.create(newBookingData);
      if (res?.success) {
        enqueueSnackbar('Booking created successfully!', { variant: 'success' });
        setNewBookingOpen(false);
        fetchData();
        fetchStats();
      }
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to create booking', { variant: 'error' });
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeMenuRow) return;
    try {
      const res = await bookingApi.updateStatus(activeMenuRow._id, { status: newStatus, note: `Status updated to ${newStatus}` });
      if (res?.success) {
        enqueueSnackbar(`Booking status updated to ${newStatus}`, { variant: 'success' });
        fetchData();
        fetchStats();
        // Update selectedBooking details if it's the one currently open in the Drawer
        if (selectedBooking && selectedBooking._id === activeMenuRow._id) {
          setSelectedBooking(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setStatusMenuAnchor(null);
      setActiveMenuRow(null);
    }
  };

  const handleGenerateJobCard = async (id) => {
    try {
      const res = await bookingApi.generateJobCard(id);
      if (res?.success) {
        enqueueSnackbar('Job Card generated successfully!', { variant: 'success' });
        fetchData();
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(prev => ({ ...prev, status: 'job_card_pending' }));
        }
      }
    } catch (err) {
      enqueueSnackbar('Failed to generate Job Card', { variant: 'error' });
    }
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      enqueueSnackbar('No bookings to export', { variant: 'info' });
      return;
    }
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Service', 'Mode', 'Partner/Franchise', 'Slot Date', 'Slot Time', 'Amount', 'Status', 'Payment Status'];
    const rows = bookings.map(b => [
      formatBookingId(b.bookingId),
      b.customerId ? `${b.customerId.firstName} ${b.customerId.lastName || ''}` : '-',
      b.customerId?.phone || '-',
      b.serviceName || '-',
      b.serviceMode || '-',
      b.franchiseId?.franchiseName || '-',
      b.slotDate ? new Date(b.slotDate).toLocaleDateString() : '-',
      b.slotTime || '-',
      b.totalAmount || 0,
      b.status || '-',
      b.paymentStatus || '-'
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper formatting functions
  const formatBookingId = (id) => {
    if (!id) return '';
    if (id.startsWith('BKG-')) {
      return `BK-${id.substring(4)}`;
    }
    return id;
  };

  const getAvatarInitials = (customer) => {
    if (!customer) return 'C';
    const first = customer.firstName ? customer.firstName[0] : '';
    const last = customer.lastName ? customer.lastName[0] : '';
    return (first + last).toUpperCase() || 'C';
  };

  const getAvatarColor = (name) => {
    if (!name) return '#2563EB';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`;
  };

  const getServiceIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('ac')) return <AcUnitIcon sx={{ color: '#0284C7' }} />;
    if (n.includes('wash') || n.includes('clean')) return <LocalCarWashIcon sx={{ color: '#059669' }} />;
    if (n.includes('wheel') || n.includes('tyre')) return <SettingsIcon sx={{ color: '#4B5563' }} />;
    if (n.includes('periodic') || n.includes('service')) return <BuildIcon sx={{ color: '#D97706' }} />;
    return <BuildIcon sx={{ color: '#D97706' }} />;
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'completed':
        return { bg: '#DEF7EC', text: '#03543F', label: 'Completed' };
      case 'in_progress':
        return { bg: '#FEF08A', text: '#713F12', label: 'In Progress' };
      case 'accepted':
        return { bg: '#E0F2FE', text: '#0369A1', label: 'Accepted' };
      case 'booked':
      case 'pending':
        return { bg: '#FFEDD5', text: '#9A3412', label: 'Pending' };
      case 'cancelled':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Cancelled' };
      case 'job_card_pending':
        return { bg: '#F3F4F6', text: '#374151', label: 'On Hold' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const getServiceModeText = (mode) => {
    switch (mode) {
      case 'workshop': return 'At Workshop';
      case 'doorstep': return 'Door Step';
      case 'pickup_drop': return 'Pickup & Drop';
      default: return mode;
    }
  };

  return (
    <Box sx={{ py: 1, px: 1 }}>
      {/* Top Breadcrumb and Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'flex', gap: 0.5, fontSize: '0.8rem' }}>
            Dashboard &gt; Bookings &gt; All Bookings
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mt: 0.5 }}>
            Booking Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewBookingOpen(true)}
            sx={{
              bgcolor: '#0D5BD7',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { bgcolor: '#0B4FB9' }
            }}
          >
            New Booking
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Bookings',
            val: stats?.totalBookings?.value || 0,
            pct: stats?.totalBookings?.changePercent || 0,
            icon: <AssignmentIcon sx={{ color: '#0D5BD7', fontSize: 24 }} />,
            bgIcon: '#EFF6FF'
          },
          {
            title: "Today's Bookings",
            val: stats?.todayBookings?.value || 0,
            pct: stats?.todayBookings?.changePercent || 0,
            icon: <CalendarTodayIcon sx={{ color: '#10B981', fontSize: 24 }} />,
            bgIcon: '#ECFDF5'
          },
          {
            title: 'In Progress',
            val: stats?.inProgress?.value || 0,
            pct: stats?.inProgress?.changePercent || 0,
            icon: <AutorenewIcon sx={{ color: '#F59E0B', fontSize: 24 }} />,
            bgIcon: '#FEF3C7'
          },
          {
            title: 'Completed (Today)',
            val: stats?.completedToday?.value || 0,
            pct: stats?.completedToday?.changePercent || 0,
            icon: <CheckCircleOutlineIcon sx={{ color: '#8B5CF6', fontSize: 24 }} />,
            bgIcon: '#F5F3FF'
          },
          {
            title: "Today's Revenue",
            val: `₹ ${(stats?.todayRevenue?.value || 0).toLocaleString()}`,
            pct: stats?.todayRevenue?.changePercent || 0,
            icon: <CurrencyRupeeIcon sx={{ color: '#10B981', fontSize: 24 }} />,
            bgIcon: '#ECFDF5'
          }
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card sx={{
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 120
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: card.bgIcon,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.8rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mt: 0.25 }}>
                    {card.val}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: card.pct >= 0 ? '#10B981' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {card.pct >= 0 ? `↑ ${card.pct}%` : `↓ ${Math.abs(card.pct)}%`}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  vs yesterday
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter and Table Container */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
        {/* Inline Filters */}
        <Box sx={{
          p: 2.5,
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search Box */}
          <TextField
            placeholder="Search by booking ID, customer, service..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: 20 }} />,
              style: { borderRadius: '10px' }
            }}
            sx={{ flexGrow: 1, minWidth: 260 }}
          />

          {/* Status Select */}
          <TextField
            select
            label="Status"
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 140 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="booked">Booked</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="job_card_pending">On Hold (Job Card Pending)</MenuItem>
          </TextField>

          {/* Service Type Select */}
          <TextField
            select
            label="Service Type"
            size="small"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            sx={{ minWidth: 160 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Services</MenuItem>
            {servicesList.map((srv, idx) => (
              <MenuItem key={idx} value={srv}>{srv}</MenuItem>
            ))}
          </TextField>

          {/* Franchise / Partner Select */}
          <TextField
            select
            label="Franchise / Partner"
            size="small"
            value={franchiseId}
            onChange={(e) => setFranchiseId(e.target.value)}
            sx={{ minWidth: 180 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Partners</MenuItem>
            {franchises.map((fran) => (
              <MenuItem key={fran._id} value={fran._id}>{fran.franchiseName}</MenuItem>
            ))}
          </TextField>

          {/* Date Range Popover Trigger */}
          <Button
            variant="outlined"
            onClick={(e) => setDateAnchorEl(e.currentTarget)}
            startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              height: 40,
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': { borderColor: '#D1D5DB' }
            }}
          >
            {fromDate && toDate ? `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}` : 'Date Range'}
          </Button>

          {/* Date Range Popover */}
          <Popover
            open={Boolean(dateAnchorEl)}
            anchorEl={dateAnchorEl}
            onClose={() => setDateAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { p: 2.5, minWidth: 280, borderRadius: '12px', mt: 1, border: '1px solid #E5E7EB', boxShadow: '0px 10px 30px rgba(0,0,0,0.05)' } }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Filter by Slot Date</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                type="date"
                label="From Date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <TextField
                type="date"
                label="To Date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                <Button size="small" onClick={() => { setFromDate(''); setToDate(''); setDateAnchorEl(null); }} sx={{ textTransform: 'none' }}>Clear</Button>
                <Button size="small" variant="contained" onClick={() => setDateAnchorEl(null)} sx={{ textTransform: 'none', bgcolor: '#0D5BD7' }}>Apply</Button>
              </Box>
            </Box>
          </Popover>
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Partner / Franchise</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#6B7280' }}>
                    Loading bookings data...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#6B7280' }}>
                    No bookings found matching selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((row) => {
                  const statusStyle = getStatusStyle(row.status);
                  const custName = row.customerId ? `${row.customerId.firstName} ${row.customerId.lastName || ''}` : 'Unknown';
                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Booking ID */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          onClick={() => setSelectedBooking(row)}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#0D5BD7',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {formatBookingId(row.bookingId)}
                        </Typography>
                      </TableCell>

                      {/* Customer Info */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            bgcolor: getAvatarColor(custName)
                          }}>
                            {getAvatarInitials(row.customerId)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                              {custName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {row.customerId?.phone || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Service */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E5E7EB'
                          }}>
                            {getServiceIcon(row.serviceName)}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                              {row.serviceName || 'Standard Clean'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {getServiceModeText(row.serviceMode)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Partner / Franchise */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                            {row.franchiseId ? row.franchiseId.franchiseName : 'Direct Partner'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {row.franchiseId ? `${row.franchiseId.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Franchise` : 'CSP Franchise'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                            {row.slotDate ? new Date(row.slotDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {row.slotTime || '-'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>
                          ₹ {(row.totalAmount || 0).toLocaleString()}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 2,
                          py: 0.5,
                          borderRadius: '50px',
                          bgcolor: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {statusStyle.label}
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setSelectedBooking(row)}>
                              <VisibilityIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setStatusMenuAnchor(e.currentTarget);
                              setActiveMenuRow(row);
                            }}
                          >
                            <MoreVertIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Custom Pagination Footer */}
        <Box sx={{
          p: 2.5,
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Showing {bookings.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} bookings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Limit Selector */}
            <TextField
              select
              size="small"
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
              }}
              sx={{ width: 110 }}
              InputProps={{ style: { borderRadius: '8px', fontSize: '0.85rem' } }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={20}>20 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
            </TextField>

            {/* Prev/Next buttons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                sx={{
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  p: 0,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  borderRadius: '8px',
                  '&:disabled': { borderColor: '#F3F4F6', color: '#D1D5DB' }
                }}
              >
                &lt;
              </Button>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#EFF6FF',
                color: '#0D5BD7',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                {pagination.page}
              </Box>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                sx={{
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  p: 0,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  borderRadius: '8px',
                  '&:disabled': { borderColor: '#F3F4F6', color: '#D1D5DB' }
                }}
              >
                &gt;
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Row Action Dropdown Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => {
          setStatusMenuAnchor(null);
          setActiveMenuRow(null);
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            minWidth: 160
          }
        }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#9CA3AF', fontWeight: 700 }}>
          ACTIONS
        </Typography>
        {activeMenuRow && activeMenuRow.status === 'booked' && (
          <MenuItem onClick={() => handleStatusChange('accepted')} sx={{ py: 1, fontSize: '0.875rem' }}>
            Accept Booking
          </MenuItem>
        )}
        {activeMenuRow && activeMenuRow.status === 'accepted' && (
          <>
            <MenuItem onClick={() => handleStatusChange('in_progress')} sx={{ py: 1, fontSize: '0.875rem' }}>
              Start Service
            </MenuItem>
            <MenuItem onClick={() => handleGenerateJobCard(activeMenuRow._id)} sx={{ py: 1, fontSize: '0.875rem' }}>
              Generate Job Card
            </MenuItem>
          </>
        )}
        {activeMenuRow && activeMenuRow.status === 'in_progress' && (
          <MenuItem onClick={() => handleStatusChange('completed')} sx={{ py: 1, fontSize: '0.875rem' }}>
            Complete Service
          </MenuItem>
        )}
        {activeMenuRow && !['completed', 'cancelled'].includes(activeMenuRow.status) && (
          <MenuItem onClick={() => handleStatusChange('cancelled')} sx={{ py: 1, fontSize: '0.875rem', color: '#EF4444' }}>
            Cancel Booking
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setSelectedBooking(activeMenuRow); setStatusMenuAnchor(null); }} sx={{ py: 1, fontSize: '0.875rem' }}>
          View Full Details
        </MenuItem>
      </Menu>

      {/* Booking Details Right Slide Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 460 },
            borderLeft: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {selectedBooking && (
          <>
            {/* Drawer Header */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>Booking Details</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0D5BD7', fontSize: '1rem' }}>
                    {formatBookingId(selectedBooking.bookingId)}
                  </Typography>
                  <Box sx={{
                    px: 1.5,
                    py: 0.25,
                    borderRadius: '50px',
                    bgcolor: getStatusStyle(selectedBooking.status).bg,
                    color: getStatusStyle(selectedBooking.status).text,
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}>
                    {getStatusStyle(selectedBooking.status).label}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5 }}>
                  Booked on {new Date(selectedBooking.createdAt || Date.now()).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedBooking(null)} sx={{ color: '#9CA3AF' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Drawer Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Customer Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  👤 Customer Details
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827' }}>
                    {selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName || ''}` : 'Unknown Customer'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', mt: 0.5 }}>
                    {selectedBooking.customerId?.phone || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', mt: 0.5 }}>
                    {selectedBooking.customerId?.email || '-'}
                  </Typography>
                  {selectedBooking.customerId?.defaultAddressId ? (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Default Address</Typography>
                      <Typography variant="body2" sx={{ color: '#374151', mt: 0.5, lineHeight: 1.4 }}>
                        {selectedBooking.customerId.defaultAddressId.apartment ? `${selectedBooking.customerId.defaultAddressId.apartment}, ` : ''}
                        {selectedBooking.customerId.defaultAddressId.building ? `${selectedBooking.customerId.defaultAddressId.building}, ` : ''}
                        {selectedBooking.customerId.defaultAddressId.street ? `${selectedBooking.customerId.defaultAddressId.street}, ` : ''}
                        {selectedBooking.customerId.defaultAddressId.area ? `${selectedBooking.customerId.defaultAddressId.area}, ` : ''}
                        {selectedBooking.customerId.defaultAddressId.city ? `${selectedBooking.customerId.defaultAddressId.city}, ` : ''}
                        {selectedBooking.customerId.defaultAddressId.state ? selectedBooking.customerId.defaultAddressId.state : ''}
                        {selectedBooking.customerId.defaultAddressId.pincode ? ` - ${selectedBooking.customerId.defaultAddressId.pincode}` : ''}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>No address provided</Typography>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Vehicle Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  🚗 Vehicle Details
                </Typography>
                {selectedBooking.vehicleId ? (
                  <Box sx={{ pl: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 850, color: '#111827', fontFamily: 'monospace' }}>
                      {selectedBooking.vehicleId.vehicleNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4B5563', mt: 0.5 }}>
                      {selectedBooking.vehicleId.make} {selectedBooking.vehicleId.model}
                      {selectedBooking.vehicleId.year ? ` (${selectedBooking.vehicleId.year})` : ''}
                      {selectedBooking.vehicleId.color ? ` • ${selectedBooking.vehicleId.color}` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, textTransform: 'capitalize', fontSize: '0.8rem' }}>
                      Fuel: {selectedBooking.vehicleId.fuelType || '-'} • Type: {selectedBooking.vehicleId.vehicleType || '-'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#9CA3AF', pl: 1 }}>No vehicle linked</Typography>
                )}
              </Box>

              <Divider />

              {/* Service Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  🔧 Service Details
                </Typography>
                <Box sx={{ pl: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Service</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{selectedBooking.serviceName || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Service Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{getServiceModeText(selectedBooking.serviceMode)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Partner / Franchise</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{selectedBooking.franchiseId?.franchiseName || 'Direct Partner'}</Typography>
                  </Box>
                  {selectedBooking.franchiseId?.address && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Workshop Address</Typography>
                      <Typography variant="body2" sx={{ color: '#374151', mt: 0.5, lineHeight: 1.4 }}>
                        {selectedBooking.franchiseId.address.street ? `${selectedBooking.franchiseId.address.street}, ` : ''}
                        {selectedBooking.franchiseId.address.city}, {selectedBooking.franchiseId.address.state}
                        {selectedBooking.franchiseId.address.pincode ? ` - ${selectedBooking.franchiseId.address.pincode}` : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Booking Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  📅 Booking Info
                </Typography>
                <Box sx={{ pl: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Date & Time</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                      {selectedBooking.slotDate ? new Date(selectedBooking.slotDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      {selectedBooking.slotTime ? `, ${selectedBooking.slotTime}` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Payment Mode</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>Online</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Payment Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: selectedBooking.paymentStatus === 'paid' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>
                      {selectedBooking.paymentStatus || 'Pending'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Amount Paid</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>₹ {(selectedBooking.totalAmount || 0).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Drawer Footer Actions */}
            <Box sx={{ p: 3, borderTop: '1px solid #F3F4F6', display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateJobCard(selectedBooking._id)}
                sx={{
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.25,
                  '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                }}
              >
                View Job Card
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  enqueueSnackbar(`Invoice opened for ${formatBookingId(selectedBooking.bookingId)}`, { variant: 'success' });
                }}
                sx={{
                  bgcolor: '#0D5BD7',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.25,
                  '&:hover': { bgcolor: '#0B4FB9' }
                }}
              >
                View Invoice
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* New Booking Dialog */}
      <Dialog
        open={newBookingOpen}
        onClose={() => setNewBookingOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#111827', pb: 1 }}>Create New Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            {/* Customer Select */}
            <TextField
              select
              label="Select Customer *"
              value={newBookingData.customerId}
              onChange={(e) => setNewBookingData(prev => ({ ...prev, customerId: e.target.value }))}
              fullWidth
              InputProps={{ style: { borderRadius: '10px' } }}
            >
              {customersList.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.firstName} {c.lastName || ''} ({c.phone})
                </MenuItem>
              ))}
            </TextField>

            {/* Vehicle Select */}
            <TextField
              select
              label="Select Vehicle *"
              value={newBookingData.vehicleId}
              onChange={(e) => setNewBookingData(prev => ({ ...prev, vehicleId: e.target.value }))}
              disabled={!newBookingData.customerId}
              helperText={!newBookingData.customerId ? 'Select a customer first to view vehicles' : ''}
              fullWidth
              InputProps={{ style: { borderRadius: '10px' } }}
            >
              {customerVehicles.map((v) => (
                <MenuItem key={v._id} value={v._id}>
                  {v.vehicleNumber} - {v.make} {v.model}
                </MenuItem>
              ))}
            </TextField>

            {/* Service Select */}
            <TextField
              select
              label="Select Service *"
              value={newBookingData.serviceName}
              onChange={(e) => setNewBookingData(prev => ({ ...prev, serviceName: e.target.value }))}
              fullWidth
              InputProps={{ style: { borderRadius: '10px' } }}
            >
              {servicesList.map((srv, idx) => (
                <MenuItem key={idx} value={srv}>{srv}</MenuItem>
              ))}
            </TextField>

            {/* Franchise / Partner Select */}
            <TextField
              select
              label="Select Franchise / Partner *"
              value={newBookingData.franchiseId}
              onChange={(e) => setNewBookingData(prev => ({ ...prev, franchiseId: e.target.value }))}
              fullWidth
              InputProps={{ style: { borderRadius: '10px' } }}
            >
              {franchises.map((fran) => (
                <MenuItem key={fran._id} value={fran._id}>{fran.franchiseName}</MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                {/* Slot Date */}
                <TextField
                  type="date"
                  label="Slot Date *"
                  value={newBookingData.slotDate}
                  onChange={(e) => setNewBookingData(prev => ({ ...prev, slotDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                {/* Slot Time */}
                <TextField
                  select
                  label="Slot Time *"
                  value={newBookingData.slotTime}
                  onChange={(e) => setNewBookingData(prev => ({ ...prev, slotTime: e.target.value }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="09:00 AM">09:00 AM</MenuItem>
                  <MenuItem value="10:00 AM">10:00 AM</MenuItem>
                  <MenuItem value="11:00 AM">11:00 AM</MenuItem>
                  <MenuItem value="12:00 PM">12:00 PM</MenuItem>
                  <MenuItem value="02:00 PM">02:00 PM</MenuItem>
                  <MenuItem value="04:00 PM">04:00 PM</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                {/* Service Mode */}
                <TextField
                  select
                  label="Service Mode *"
                  value={newBookingData.serviceMode}
                  onChange={(e) => setNewBookingData(prev => ({ ...prev, serviceMode: e.target.value }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="workshop">At Workshop</MenuItem>
                  <MenuItem value="doorstep">Doorstep</MenuItem>
                  <MenuItem value="pickup_drop">Pickup & Drop</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                {/* Base Price */}
                <TextField
                  type="number"
                  label="Base Price (₹) *"
                  value={newBookingData.basePrice}
                  onChange={(e) => setNewBookingData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setNewBookingOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBooking}
            variant="contained"
            sx={{
              bgcolor: '#0D5BD7',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#0B4FB9' }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingListPage;
