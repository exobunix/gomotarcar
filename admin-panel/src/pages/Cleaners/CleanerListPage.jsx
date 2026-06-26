import React, { useState, useEffect, useCallback } from 'react';
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
import { format } from 'date-fns';

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
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// APIs
import { cleanerApi, supervisorApi, apartmentApi, zoneApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const CleanerListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Lists
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [stats, setStats] = useState(null);
  
  // Dropdowns lists
  const [supervisors, setSupervisors] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [zones, setZones] = useState([]);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [apartmentFilter, setApartmentFilter] = useState('');
  
  // Detail Drawer state
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Add/Edit Dialog
  const [formDialog, setFormDialog] = useState(null); // { mode: 'add'|'edit', data: {} }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  // Delete Target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDropdowns = useCallback(async () => {
    try {
      const supRes = await supervisorApi.list({ limit: 100 });
      if (supRes?.data) setSupervisors(supRes.data);

      const aptRes = await apartmentApi.list({ limit: 100 });
      if (aptRes?.data) setApartments(aptRes.data);

      const zoneRes = await zoneApi.list({ limit: 100 });
      if (zoneRes?.data) setZones(zoneRes.data);
    } catch (err) {
      console.error('Failed to load filter dropdowns', err);
    }
  }, []);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // Map filters
      let isActiveQuery = undefined;
      let verificationStatusQuery = undefined;
      
      if (status === 'active') {
        isActiveQuery = true;
      } else if (status === 'inactive') {
        isActiveQuery = false;
      } else if (status === 'pending') {
        verificationStatusQuery = 'pending';
      } else if (status === 'rejected') {
        verificationStatusQuery = 'rejected';
      }

      const res = await cleanerApi.list({
        page,
        limit,
        search,
        isActive: isActiveQuery,
        verificationStatus: verificationStatusQuery,
        employmentType,
        supervisorId: supervisorFilter,
        // Since apartmentFilter is selected, we can filter on backend side if list supports it.
        // For local simplicity, the list endpoint matches basic properties.
      });

      if (res?.data) {
        setCleaners(res.data);
        setPagination(res.pagination || { page, limit, total: res.data.length });
      }
    } catch (err) {
      enqueueSnackbar('Failed to fetch cleaners data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, status, employmentType, supervisorFilter, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await cleanerApi.getStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
    fetchStats();
  }, [fetchData, fetchStats, pagination.page, pagination.limit]);

  // Validation
  const validateForm = (data, mode) => {
    const errors = {};
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;
    if (!data.phone || !PHONE_REGEX.test(data.phone)) {
      errors.phone = 'Phone must be a valid number (e.g. +919876543210)';
    }
    if (mode === 'add' && (!data.password || data.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleSaveCleaner = async () => {
    if (!formDialog) return;
    setFormErrors({});
    const errors = validateForm(formDialog.data, formDialog.mode);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      enqueueSnackbar('Please correct form validation errors', { variant: 'warning' });
      return;
    }

    setSaving(true);
    const data = formDialog.data;
    
    // Structure payload correctly
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName || '',
      phone: data.phone,
      email: data.email || '',
      gender: data.gender || 'male',
      dateOfBirth: data.dateOfBirth || '',
      address: {
        street: data.street || '',
        city: data.city || 'Bangalore',
        state: data.state || 'Karnataka',
        pincode: data.pincode || '',
      },
      employmentType: data.employmentType || 'full-time',
      experience: data.experience ? Number(data.experience) : 0,
      language: data.language || 'en',
    };

    if (data.assignedZone) payload.assignedZone = data.assignedZone;
    if (data.supervisorId) payload.supervisorId = data.supervisorId;
    if (formDialog.mode === 'add' && data.password) payload.password = data.password;

    try {
      if (formDialog.mode === 'add') {
        await cleanerApi.create(payload);
        enqueueSnackbar('Car Cleaner created successfully', { variant: 'success' });
      } else {
        await cleanerApi.update(data._id, payload);
        enqueueSnackbar('Cleaner details updated successfully', { variant: 'success' });
      }
      setFormDialog(null);
      fetchData();
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCleaner = async () => {
    if (!deleteTarget) return;
    try {
      await cleanerApi.delete(deleteTarget._id);
      enqueueSnackbar('Car cleaner profile deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
      fetchData();
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete cleaner profile', { variant: 'error' });
    }
  };

  const handleDeactivate = async (cleaner) => {
    try {
      await cleanerApi.deactivate(cleaner._id);
      enqueueSnackbar('Cleaner profile deactivated successfully', { variant: 'success' });
      fetchData();
      fetchStats();
      if (selectedCleaner && selectedCleaner._id === cleaner._id) {
        setSelectedCleaner(prev => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to deactivate cleaner', { variant: 'error' });
    } finally {
      setActionMenuAnchor(null);
      setActiveMenuRow(null);
    }
  };

  const handleVerify = async (cleaner) => {
    try {
      await cleanerApi.verify(cleaner._id);
      enqueueSnackbar('Cleaner profile verified successfully!', { variant: 'success' });
      fetchData();
      fetchStats();
      if (selectedCleaner && selectedCleaner._id === cleaner._id) {
        setSelectedCleaner(prev => ({ ...prev, verificationStatus: 'verified' }));
      }
    } catch (err) {
      enqueueSnackbar('Failed to verify cleaner', { variant: 'error' });
    } finally {
      setActionMenuAnchor(null);
      setActiveMenuRow(null);
    }
  };

  const handleExportCSV = () => {
    if (cleaners.length === 0) {
      enqueueSnackbar('No cleaner records to export', { variant: 'info' });
      return;
    }
    const headers = ['Cleaner ID', 'Name', 'Phone', 'Type', 'Apt. Name', 'Apartments Count', 'Assigned Cars', 'Supervisor', 'Rating', 'Status', 'Verification'];
    const rows = cleaners.map(c => [
      c.cleanerId || '-',
      `${c.firstName} ${c.lastName || ''}`,
      c.phone || '-',
      c.employmentType || '-',
      c.apartmentNames || '-',
      c.apartmentsCount || 0,
      c.assignedCarsCount || 0,
      c.supervisor ? `${c.supervisor.fullName} (${c.supervisor.supervisorCode})` : '-',
      c.stats?.averageRating || '0.0',
      c.isActive ? 'Active' : 'Inactive',
      c.verificationStatus || '-'
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaners_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    enqueueSnackbar('CSV exported successfully', { variant: 'success' });
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

  const getAvatarInitials = (firstName, lastName) => {
    const f = firstName ? firstName[0] : '';
    const l = lastName ? lastName[0] : '';
    return (f + l).toUpperCase() || 'CL';
  };

  const getStatusStyle = (row) => {
    if (!row.isActive) return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Inactive' };
    const s = row.verificationStatus?.toLowerCase() || '';
    switch (s) {
      case 'verified':
        return { bg: '#DEF7EC', text: '#03543F', label: 'Active' };
      case 'pending':
        return { bg: '#FFEDD5', text: '#9A3412', label: 'Pending' };
      case 'rejected':
        return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Rejected' };
      default:
        return { bg: '#EFF6FF', text: '#1E40AF', label: 'Active' };
    }
  };

  const getTypeStyle = (type) => {
    const t = type?.toLowerCase() || '';
    switch (t) {
      case 'full-time':
        return { bg: '#ECFDF5', text: '#065F46', label: 'Full Time' };
      case 'part-time':
        return { bg: '#EFF6FF', text: '#1E40AF', label: 'Part Time' };
      case 'contract':
        return { bg: '#F5F3FF', text: '#5B21B6', label: 'Contract' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: type };
    }
  };

  const openEditDialog = (cleaner) => {
    setFormErrors({});
    setFormDialog({
      mode: 'edit',
      data: {
        ...cleaner,
        street: cleaner.address?.street || '',
        city: cleaner.address?.city || '',
        state: cleaner.address?.state || '',
        pincode: cleaner.address?.pincode || '',
        dateOfBirth: cleaner.dateOfBirth ? cleaner.dateOfBirth.slice(0, 10) : ''
      }
    });
  };

  return (
    <Box sx={{ py: 1, px: 1 }}>
      {/* Top Breadcrumb and Title Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'flex', gap: 0.5, fontSize: '0.8rem' }}>
            Dashboard &gt; Car Cleaners &gt; All Cleaners
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mt: 0.5 }}>
            Car Cleaner Management
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
            startIcon={<PersonAddIcon />}
            onClick={() => setFormDialog({ mode: 'add', data: { employmentType: 'full-time', language: 'en', gender: 'male' } })}
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
            Add Cleaner
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Cleaners',
            val: stats?.totalCleaners?.value || 0,
            sub: stats?.totalCleaners?.changePercent >= 0 ? `↑ ${stats?.totalCleaners?.changePercent}% vs last month` : `↓ ${Math.abs(stats?.totalCleaners?.changePercent)}% vs last month`,
            subColor: stats?.totalCleaners?.changePercent >= 0 ? '#10B981' : '#EF4444',
            icon: <PeopleIcon sx={{ color: '#0D5BD7', fontSize: 24 }} />,
            bgIcon: '#EFF6FF'
          },
          {
            title: 'Active Cleaners',
            val: stats?.activeCleaners?.value || 0,
            sub: `${stats?.activeCleaners?.percentOfTotal || 0}% of total`,
            subColor: '#10B981',
            icon: <PersonOutlineIcon sx={{ color: '#10B981', fontSize: 24 }} />,
            bgIcon: '#ECFDF5'
          },
          {
            title: 'Part Time Cleaners',
            val: stats?.partTimeCleaners?.value || 0,
            sub: `${stats?.partTimeCleaners?.percentOfTotal || 0}% of total`,
            subColor: '#F59E0B',
            icon: <SupervisorAccountIcon sx={{ color: '#F59E0B', fontSize: 24 }} />,
            bgIcon: '#FEF3C7'
          },
          {
            title: 'Full Time Cleaners',
            val: stats?.fullTimeCleaners?.value || 0,
            sub: `${stats?.fullTimeCleaners?.percentOfTotal || 0}% of total`,
            subColor: '#8B5CF6',
            icon: <PeopleIcon sx={{ color: '#8B5CF6', fontSize: 24 }} />,
            bgIcon: '#F5F3FF'
          },
          {
            title: 'Pending Approvals',
            val: stats?.pendingApprovals?.value || 0,
            sub: stats?.pendingApprovals?.changePercent >= 0 ? `↑ ${stats?.pendingApprovals?.changePercent}% vs last month` : `↓ ${Math.abs(stats?.pendingApprovals?.changePercent)}% vs last month`,
            subColor: stats?.pendingApprovals?.changePercent >= 0 ? '#EF4444' : '#10B981',
            icon: <HourglassEmptyIcon sx={{ color: '#EF4444', fontSize: 24 }} />,
            bgIcon: '#FDE8E8'
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
                <Typography variant="caption" sx={{ fontWeight: 700, color: card.subColor }}>
                  {card.sub}
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
            placeholder="Search by name, mobile or cleaner ID..."
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>

          {/* Type Select */}
          <TextField
            select
            label="Type"
            size="small"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            sx={{ minWidth: 140 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="full-time">Full Time</MenuItem>
            <MenuItem value="part-time">Part Time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
          </TextField>

          {/* Supervisor Select */}
          <TextField
            select
            label="Supervisor"
            size="small"
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            sx={{ minWidth: 160 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Supervisors</MenuItem>
            {supervisors.map((s) => (
              <MenuItem key={s._id} value={s.userId?._id || s.userId}>{s.firstName} {s.lastName || ''}</MenuItem>
            ))}
          </TextField>

          {/* Apartment Select */}
          <TextField
            select
            label="Apartment"
            size="small"
            value={apartmentFilter}
            onChange={(e) => setApartmentFilter(e.target.value)}
            sx={{ minWidth: 180 }}
            InputProps={{ style: { borderRadius: '10px' } }}
          >
            <MenuItem value="">All Apartments</MenuItem>
            {apartments.map((a) => (
              <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
            ))}
          </TextField>

          {/* Filter Button */}
          <Button
            variant="outlined"
            onClick={() => fetchData()}
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: '#0D5BD7',
              color: '#0D5BD7',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2.5,
              height: 40,
              fontWeight: 700,
              '&:hover': { borderColor: '#0B4FB9', bgcolor: '#EFF6FF' }
            }}
          >
            Filter
          </Button>
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                {[
                  { label: 'Cleaner ID', align: 'left', width: 90 },
                  { label: 'Name', align: 'left', width: 150 },
                  { label: 'Mobile', align: 'left', width: 120 },
                  { label: 'Type', align: 'left', width: 80 },
                  { label: 'Apt. Name', align: 'left', width: 150 },
                  { label: 'Apts', align: 'center', width: 50 },
                  { label: 'Cars', align: 'center', width: 50 },
                  { label: 'Supervisor', align: 'left', width: 120 },
                  { label: 'Rating', align: 'left', width: 60 },
                  { label: 'Status', align: 'left', width: 80 },
                  { label: 'Actions', align: 'center', width: 90 },
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    align={col.align}
                    sx={{
                      fontWeight: 700,
                      color: '#374151',
                      py: 1.5,
                      px: 1.5,
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      width: col.width,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#6B7280' }}>
                    Loading cleaners list...
                  </TableCell>
                </TableRow>
              ) : cleaners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#6B7280' }}>
                    No cleaners found matching selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                cleaners.map((row) => {
                  const statusStyle = getStatusStyle(row);
                  const typeStyle = getTypeStyle(row.employmentType);
                  const cleanerName = `${row.firstName} ${row.lastName || ''}`.trim();
                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { py: 1.25, px: 1.5 } }}>
                      {/* Cleaner ID */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          onClick={() => { setSelectedCleaner(row); setActiveTab(0); }}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#0D5BD7',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {row.cleanerId}
                        </Typography>
                      </TableCell>

                      {/* Name Avatar */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                          <Avatar
                            src={row.photo}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: getAvatarColor(cleanerName)
                            }}
                          >
                            {getAvatarInitials(row.firstName, row.lastName)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                            {cleanerName}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Mobile */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#4B5563', whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                          {row.phone}
                        </Typography>
                      </TableCell>

                      {/* Type Pill */}
                      <TableCell>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.25,
                          py: 0.25,
                          borderRadius: '6px',
                          bgcolor: typeStyle.bg,
                          color: typeStyle.text,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap'
                        }}>
                          {typeStyle.label}
                        </Box>
                      </TableCell>

                      {/* Apartment Name */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.8rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.apartmentNames || 'No apartments'}
                        </Typography>
                      </TableCell>

                      {/* Apartments Count */}
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                          {row.apartmentsCount || 0}
                        </Typography>
                      </TableCell>

                      {/* Assigned Cars */}
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                          {row.assignedCarsCount || 0}
                        </Typography>
                      </TableCell>

                      {/* Supervisor */}
                      <TableCell>
                        {row.supervisor ? (
                          <Box sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.825rem' }}>
                              {row.supervisor.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                              {row.supervisor.supervisorCode}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Not Assigned</Typography>
                        )}
                      </TableCell>

                      {/* Rating */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                            {(row.stats?.averageRating || 4.5).toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.75,
                          py: 0.5,
                          borderRadius: '50px',
                          bgcolor: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 700,
                          fontSize: '0.725rem'
                        }}>
                          {statusStyle.label}
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => { setSelectedCleaner(row); setActiveTab(0); }}>
                              <VisibilityIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEditDialog(row)}>
                              <EditIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setActionMenuAnchor(e.currentTarget);
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
            Showing {cleaners.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} cleaners
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

      {/* Row More Actions dropdown menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => {
          setActionMenuAnchor(null);
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
        {activeMenuRow && activeMenuRow.verificationStatus === 'pending' && (
          <MenuItem onClick={() => handleVerify(activeMenuRow)} sx={{ py: 1, fontSize: '0.875rem' }}>
            Verify Profile
          </MenuItem>
        )}
        {activeMenuRow && activeMenuRow.isActive && (
          <MenuItem onClick={() => handleDeactivate(activeMenuRow)} sx={{ py: 1, fontSize: '0.875rem', color: '#D97706' }}>
            Deactivate Profile
          </MenuItem>
        )}
        <MenuItem onClick={() => { openEditDialog(activeMenuRow); setActionMenuAnchor(null); }} sx={{ py: 1, fontSize: '0.875rem' }}>
          Edit Profile
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setDeleteTarget(activeMenuRow); setActionMenuAnchor(null); }} sx={{ py: 1, fontSize: '0.875rem', color: '#EF4444' }}>
          Delete Cleaner
        </MenuItem>
      </Menu>

      {/* Cleaner Details Right Slide Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedCleaner)}
        onClose={() => setSelectedCleaner(null)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 460 },
            borderLeft: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {selectedCleaner && (
          <>
            {/* Drawer Header Profile summary */}
            <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', position: 'relative' }}>
              <IconButton onClick={() => setSelectedCleaner(null)} sx={{ position: 'absolute', right: 16, top: 16, color: '#9CA3AF' }}>
                <CloseIcon />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Avatar
                  src={selectedCleaner.photo}
                  sx={{
                    width: 72,
                    height: 72,
                    border: '3px solid #EFF6FF',
                    bgcolor: getAvatarColor(`${selectedCleaner.firstName} ${selectedCleaner.lastName || ''}`)
                  }}
                >
                  {getAvatarInitials(selectedCleaner.firstName, selectedCleaner.lastName)}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                      {selectedCleaner.firstName} {selectedCleaner.lastName || ''}
                    </Typography>
                    <Box sx={{
                      px: 1.25,
                      py: 0.25,
                      borderRadius: '50px',
                      bgcolor: getStatusStyle(selectedCleaner).bg,
                      color: getStatusStyle(selectedCleaner).text,
                      fontWeight: 700,
                      fontSize: '0.65rem'
                    }}>
                      {getStatusStyle(selectedCleaner).label}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.25, fontFamily: 'monospace', fontWeight: 650 }}>
                    {selectedCleaner.cleanerId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.25 }}>
                    {getTypeStyle(selectedCleaner.employmentType).label} Cleaner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151' }}>
                      {(selectedCleaner.stats?.averageRating || 4.5).toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      ({selectedCleaner.stats?.totalTasksCompleted || 15} Ratings)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Tabs for details segments */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                <Tab label="Profile" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Documents" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Earnings" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Activity" sx={{ textTransform: 'none', fontWeight: 700 }} />
              </Tabs>
            </Box>

            {/* Drawer Scrollable Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4B5563', mb: 2 }}>
                      Personal Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Mobile Number</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{selectedCleaner.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{selectedCleaner.email || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Date of Birth</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {selectedCleaner.dateOfBirth ? format(new Date(selectedCleaner.dateOfBirth), 'dd MMM yyyy') : '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>
                          {selectedCleaner.address?.street ? `${selectedCleaner.address.street}, ` : ''}
                          {selectedCleaner.address?.city || 'Bangalore'}
                          {selectedCleaner.address?.pincode ? ` - ${selectedCleaner.address.pincode}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Work Information */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4B5563', mb: 2 }}>
                      Work Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Type</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{getTypeStyle(selectedCleaner.employmentType).label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Join Date</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {selectedCleaner.joiningDate ? format(new Date(selectedCleaner.joiningDate), 'dd MMM yyyy') : '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Supervisor</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {selectedCleaner.supervisor ? `${selectedCleaner.supervisor.fullName} (${selectedCleaner.supervisor.supervisorCode})` : 'Not Assigned'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Apartments</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>
                          {selectedCleaner.apartmentNames}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Assigned Cars</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{selectedCleaner.assignedCarsCount || 0} Cars</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Performance Statistics */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4B5563', mb: 2 }}>
                      Performance
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Total Cleanings</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {(selectedCleaner.stats?.totalTasksCompleted || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>This Month</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {selectedCleaner.stats?.currentMonthTasks || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Completion Rate</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                          {selectedCleaner.stats?.attendancePercentage || 98.4}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>Average Rating</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {(selectedCleaner.stats?.averageRating || 4.5).toFixed(1)} / 5.0
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ py: 2, textAlign: 'center', color: '#6B7280' }}>
                  <Typography variant="body2">No verified documents available.</Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box sx={{ py: 2, textAlign: 'center', color: '#6B7280' }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>Net Earnings: ₹ {(selectedCleaner.stats?.totalEarnings || 0).toLocaleString()}</Typography>
                  <Typography variant="caption">Earnings details are synced automatically.</Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box sx={{ py: 2, textAlign: 'center', color: '#6B7280' }}>
                  <Typography variant="body2">No recent activity logged for this cleaner.</Typography>
                </Box>
              )}
            </Box>

            {/* Drawer Footer Actions */}
            <Box sx={{ p: 3, borderTop: '1px solid #F3F4F6', display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => openEditDialog(selectedCleaner)}
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
                Edit Profile
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setSelectedCleaner(null)}
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
                Close Details
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      <Dialog
        open={!!formDialog}
        onClose={() => setFormDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#111827', pb: 1 }}>
          {formDialog?.mode === 'add' ? 'Add New Cleaner' : 'Edit Cleaner Profile'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name *"
                  value={formDialog?.data.firstName || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, firstName: e.target.value } }))}
                  fullWidth
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  value={formDialog?.data.lastName || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, lastName: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Phone Number *"
                  placeholder="+919876543210"
                  value={formDialog?.data.phone || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
                  fullWidth
                  error={!!formErrors.phone}
                  helperText={formErrors.phone || 'Format: +91XXXXXXXXXX'}
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formDialog?.data.email || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>

            {formDialog?.mode === 'add' && (
              <TextField
                label="Account Password *"
                type="password"
                value={formDialog?.data.password || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, password: e.target.value } }))}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password || 'Min 6 characters. Used by cleaner to log in.'}
                InputProps={{ style: { borderRadius: '10px' } }}
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="Date of Birth"
                  value={formDialog?.data.dateOfBirth || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, dateOfBirth: e.target.value } }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Gender"
                  value={formDialog?.data.gender || 'male'}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, gender: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider>Work Settings</Divider>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Employment Type"
                  value={formDialog?.data.employmentType || 'full-time'}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, employmentType: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Experience (years)"
                  value={formDialog?.data.experience || 0}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, experience: parseFloat(e.target.value) || 0 } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Assigned Zone"
                  value={formDialog?.data.assignedZone?._id || formDialog?.data.assignedZone || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, assignedZone: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="">Select Zone...</MenuItem>
                  {zones.map((z) => (
                    <MenuItem key={z._id} value={z._id}>{z.name} ({z.city})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Assigned Supervisor"
                  value={formDialog?.data.supervisorId?._id || formDialog?.data.supervisorId || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, supervisorId: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                >
                  <MenuItem value="">Select Supervisor...</MenuItem>
                  {supervisors.map((s) => (
                    <MenuItem key={s._id} value={s.userId?._id || s.userId}>{s.firstName} {s.lastName || ''}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider>Address details</Divider>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Street Address"
                  value={formDialog?.data.street || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, street: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Pincode"
                  value={formDialog?.data.pincode || ''}
                  onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, pincode: e.target.value } }))}
                  fullWidth
                  InputProps={{ style: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setFormDialog(null)}
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
            onClick={handleSaveCleaner}
            variant="contained"
            disabled={saving}
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
            {saving ? 'Saving...' : formDialog?.mode === 'add' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCleaner}
        title="Delete Cleaner Account"
        message={`Are you sure you want to delete the cleaner account for ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This will permanently remove their credentials and details from the system.`}
        confirmLabel="Delete permanently"
      />
    </Box>
  );
};

export default CleanerListPage;
