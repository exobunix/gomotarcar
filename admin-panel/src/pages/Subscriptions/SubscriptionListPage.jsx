import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Avatar, IconButton, InputAdornment,
  Pagination, CircularProgress, Chip, Grid, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Divider
} from '@mui/material';
import api, { subscriptionApi, apartmentApi, supervisorApi, customerApi, vehicleApi } from '../../services/api';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#FCE4EC', '#F3E5F5', '#E0F7FA'];
  const textColors = ['#1565C0', '#2E7D32', '#EF6C00', '#C2185B', '#6A1B9A', '#00838F'];
  let sum = 0;
  for (let i = 0; i < (name || '').length; i++) {
    sum += name.charCodeAt(i);
  }
  const index = sum % colors.length;
  return { bg: colors[index], text: textColors[index] };
};

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  const diffTime = Math.abs(new Date(endDate) - new Date());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const SubscriptionListPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: 'All Status', search: '', packageId: 'All Packages', apartmentId: 'All Apartments', supervisorId: 'All Supervisors' });
  const [stats, setStats] = useState(null);

  const [apartments, setApartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedSub, setSelectedSub] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', remainingCleanings: 0, autoRenew: false });
  const [addForm, setAddForm] = useState({ customerId: '', vehicleId: '', packageId: '', frequency: 'monthly', autoRenew: false });
  const [saving, setSaving] = useState(false);

  const handleExport = () => {
    if (subscriptions.length === 0) return alert('No data to export');
    const headers = ['Subscription ID', 'Customer Name', 'Phone', 'Package', 'Vehicle Number', 'Start Date', 'End Date', 'Status', 'Remaining Cleanings'];
    const csvData = subscriptions.map(row => [
      row.subscriptionId,
      `"${row.customerId?.firstName} ${row.customerId?.lastName || ''}"`,
      row.customerId?.phone || '',
      `"${row.packageName}"`,
      row.vehicleId?.vehicleNumber || '',
      new Date(row.startDate).toLocaleDateString('en-GB'),
      new Date(row.endDate).toLocaleDateString('en-GB'),
      row.status,
      row.remainingCleanings
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions_export_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenAdd = () => {
    setAddForm({ customerId: '', vehicleId: '', packageId: '', frequency: 'monthly', autoRenew: false });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!addForm.customerId || !addForm.vehicleId || !addForm.packageId) {
      return alert('Please fill all required fields');
    }
    setSaving(true);
    try {
      await subscriptionApi.subscribe({ ...addForm, startDate: new Date().toISOString() });
      fetchSubscriptions(1);
      fetchStats();
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error?.message || 'Failed to add subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenView = (sub) => {
    setSelectedSub(sub);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSub(sub);
    setEditForm({
      status: sub.status || 'active',
      remainingCleanings: sub.remainingCleanings || 0,
      autoRenew: sub.autoRenew || false,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await subscriptionApi.update(selectedSub._id, editForm);
      fetchSubscriptions(pagination.page);
      fetchStats();
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const fetchSubscriptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await subscriptionApi.list({ page, limit: 10, ...filters });
      setSubscriptions(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await subscriptionApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [fetchSubscriptions, fetchStats]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [aptRes, supRes, cusRes, vehRes, pkgRes] = await Promise.all([
          apartmentApi.list({ limit: 100 }),
          supervisorApi.list({ limit: 100 }),
          customerApi.list({ limit: 100 }),
          vehicleApi.list({ limit: 100 }),
          subscriptionApi.listPackages({ limit: 50 })
        ]);
        setApartments(aptRes?.data || []);
        setSupervisors(supRes?.data || []);
        setCustomers(cusRes?.data || []);
        setVehicles(vehRes?.data || []);
        setPackages(pkgRes?.data || []);
      } catch (err) {
        console.error('Failed to fetch filter options', err);
      }
    };
    fetchFilterOptions();
  }, []);

  const handlePageChange = (event, value) => {
    fetchSubscriptions(value);
  };

  const statCards = [
    { title: 'Total Subscriptions', value: stats?.totalSubscriptions?.toLocaleString() || '0', icon: <DescriptionOutlinedIcon color="primary" />, iconBg: '#E3F2FD', change: '↑ 8.4% vs last month', changeColor: '#059669' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions?.toLocaleString() || '0', icon: <CheckCircleOutlineIcon color="success" />, iconBg: '#E8F5E9', change: '84.3% of total', changeColor: '#059669' },
    { title: 'Expiring This Month', value: stats?.expiringThisMonth?.toLocaleString() || '0', icon: <HourglassEmptyIcon sx={{ color: '#F59E0B' }} />, iconBg: '#FEF3C7', change: '14.0% of total', changeColor: '#D97706' },
    { title: 'Expired Subscriptions', value: stats?.expiredSubscriptions?.toLocaleString() || '0', icon: <HighlightOffIcon color="error" />, iconBg: '#FEE2E2', change: '1.6% of total', changeColor: '#DC2626' },
    { title: 'Monthly Revenue', value: `₹ ${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: <CurrencyRupeeIcon sx={{ color: '#8B5CF6' }} />, iconBg: '#EDE9FE', change: '↑ 15.6% vs last month', changeColor: '#059669' },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>Subscription Management</Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem', color: '#6B7280' }}>
            <Link underline="hover" color="inherit" href="#">Dashboard</Link>
            <Link underline="hover" color="inherit" href="#">Subscriptions</Link>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>All Subscriptions</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleExport} variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#374151', fontWeight: 600, '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F3F4F6' } }}>
            Export
          </Button>
          <Button onClick={handleOpenAdd} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none', bgcolor: '#0D5BD7', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#0b4eb8', boxShadow: 'none' } }}>
            Add Subscription
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'flex-start', gap: 2, height: '100%' }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500, mb: 0.5 }}>{card.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>{card.value}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: card.changeColor, fontWeight: 500 }}>{card.change}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'nowrap', overflowX: 'auto', pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1, minWidth: 200 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Search</Typography>
          <TextField
            size="small"
            placeholder="Search customer, mobile, ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#FFFFFF' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Status</Typography>
           <TextField select size="small" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Status">All Status</MenuItem>
             <MenuItem value="active">Active</MenuItem>
             <MenuItem value="expired">Expired</MenuItem>
             <MenuItem value="cancelled">Cancelled</MenuItem>
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Package</Typography>
           <TextField select size="small" value={filters.packageId} onChange={(e) => setFilters({ ...filters, packageId: e.target.value })} sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Packages">All Packages</MenuItem>
             <MenuItem value="Basic Monthly">Basic Monthly</MenuItem>
             <MenuItem value="Standard Monthly">Standard Monthly</MenuItem>
             <MenuItem value="Premium Monthly">Premium Monthly</MenuItem>
             <MenuItem value="Premium Quarterly">Premium Quarterly</MenuItem>
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Apartment</Typography>
           <TextField select size="small" value={filters.apartmentId} onChange={(e) => setFilters({ ...filters, apartmentId: e.target.value })} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Apartments">All Apartments</MenuItem>
             {apartments.map(apt => (
               <MenuItem key={apt._id} value={apt._id}>{apt.society}</MenuItem>
             ))}
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Supervisor</Typography>
           <TextField select size="small" value={filters.supervisorId} onChange={(e) => setFilters({ ...filters, supervisorId: e.target.value })} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Supervisors">All Supervisors</MenuItem>
             {supervisors.map(sup => (
               <MenuItem key={sup._id} value={sup._id}>{sup.firstName} {sup.lastName}</MenuItem>
             ))}
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Button variant="outlined" startIcon={<FilterAltOutlinedIcon />} onClick={() => fetchSubscriptions()} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#0D5BD7', fontWeight: 600, height: 40, borderRadius: 1.5, minWidth: 100 }}>
             Filter
           </Button>
        </Box>
      </Paper>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }} aria-label="subscription table">
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Subscription ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Package</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Apartment</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>End Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Status</TableCell>
              <TableCell sx={{ borderBottom: '1px solid #E5E7EB', p: 0 }}>
                <Box sx={{ borderBottom: '1px solid #E5E7EB', textAlign: 'center', p: 1, fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>
                  Assigned
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ flex: 1, p: 1, textAlign: 'center', fontWeight: 600, color: '#6B7280', fontSize: '0.75rem', borderRight: '1px solid #E5E7EB' }}>Cleaner</Box>
                  <Box sx={{ flex: 1, p: 1, textAlign: 'center', fontWeight: 600, color: '#6B7280', fontSize: '0.75rem' }}>Supervisor</Box>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 10, color: '#6B7280' }}>
                  No subscriptions found matching the criteria.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((row) => {
                const customerName = `${row.customerId?.firstName} ${row.customerId?.lastName || ''}`.trim();
                const avatarColors = getAvatarColor(customerName);
                const endDateObj = new Date(row.endDate);
                const isExpired = row.status === 'expired' || new Date() > endDateObj;
                const daysLeft = getDaysLeft(row.endDate);
                
                return (
                  <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <TableCell sx={{ color: '#111827', fontWeight: 500 }}>{row.subscriptionId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: avatarColors.bg, color: avatarColors.text, width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600 }}>
                          {getInitials(customerName)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{customerName}</Typography>
                          <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{row.customerId?.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{row.packageName}</Typography>
                      <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>({row.packageId?.cleaningsPerMonth || row.totalCleanings} Cleanings)</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{row.vehicleId?.vehicleNumber}</Typography>
                      <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{row.vehicleId?.make} {row.vehicleId?.model}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{row.apartmentId?.society || 'N/A'}</Typography>
                      <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{row.apartmentId?.city}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#111827', fontSize: '0.875rem' }}>
                      {new Date(row.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#111827', fontSize: '0.875rem' }}>
                        {endDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ color: isExpired ? '#DC2626' : '#D97706', fontSize: '0.75rem', fontWeight: 500 }}>
                        {isExpired ? '(Expired)' : `(${daysLeft} days left)`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#0D5BD7', fontWeight: 600, fontSize: '0.875rem' }}>{row.remainingCleanings}</Typography>
                      <Typography sx={{ color: '#0D5BD7', fontWeight: 500, fontSize: '0.75rem' }}>Cleanings</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status.charAt(0).toUpperCase() + row.status.slice(1)} 
                        size="small" 
                        sx={{ 
                          bgcolor: row.status === 'active' ? '#DEF7EC' : row.status === 'expired' ? '#FDE8E8' : '#F3F4F6', 
                          color: row.status === 'active' ? '#03543F' : row.status === 'expired' ? '#9B1C1C' : '#374151',
                          fontWeight: 600,
                          borderRadius: 1
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', height: '100%' }}>
                        <Box sx={{ flex: 1, p: 1, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {row.cleanerId ? (
                            <>
                              <Typography sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{`${row.cleanerId.firstName} ${row.cleanerId.lastName || ''}`}</Typography>
                              <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center' }}>{row.cleanerId.cleanerId || 'CL-NA'}</Typography>
                            </>
                          ) : <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center' }}>—</Typography>}
                        </Box>
                        <Box sx={{ flex: 1, p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {row.supervisorId ? (
                            <>
                              <Typography sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{`${row.supervisorId.firstName} ${row.supervisorId.lastName || ''}`}</Typography>
                              <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center' }}>{row.supervisorId.code || 'SU-NA'}</Typography>
                            </>
                          ) : <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center' }}>—</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: '#6B7280' }} onClick={() => handleOpenView(row)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#6B7280' }} onClick={() => handleOpenEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#6B7280' }}><MoreVertOutlinedIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        {!loading && subscriptions.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField select size="small" value={pagination.limit} sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
                  <MenuItem value={10}>10 / page</MenuItem>
                  <MenuItem value={20}>20 / page</MenuItem>
                  <MenuItem value={50}>50 / page</MenuItem>
                </TextField>
              </Box>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.page} 
                onChange={handlePageChange} 
                shape="rounded" 
                color="primary"
                sx={{ '& .MuiPaginationItem-root': { borderRadius: 1.5 } }}
              />
            </Box>
          </Box>
        )}
      </TableContainer>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Subscription Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedSub && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Subscription ID</Typography><Typography fontWeight="600">{selectedSub.subscriptionId}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Status</Typography><Chip size="small" label={selectedSub.status} sx={{ textTransform: 'capitalize' }} color={selectedSub.status === 'active' ? 'success' : selectedSub.status === 'expired' ? 'error' : 'default'} /></Grid>
              
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Customer Name</Typography><Typography>{selectedSub.customerId?.firstName} {selectedSub.customerId?.lastName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Phone</Typography><Typography>{selectedSub.customerId?.phone}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Package</Typography><Typography>{selectedSub.packageName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Auto Renew</Typography><Typography>{selectedSub.autoRenew ? 'Yes' : 'No'}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Vehicle</Typography><Typography>{selectedSub.vehicleId?.vehicleNumber} ({selectedSub.vehicleId?.make})</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Apartment</Typography><Typography>{selectedSub.apartmentId?.society}, {selectedSub.apartmentId?.city}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Start Date</Typography><Typography>{new Date(selectedSub.startDate).toLocaleDateString()}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">End Date</Typography><Typography>{new Date(selectedSub.endDate).toLocaleDateString()}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Remaining Cleanings</Typography><Typography fontWeight="bold" color="primary">{selectedSub.remainingCleanings}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Net Amount Paid</Typography><Typography>₹{selectedSub.netAmount}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setViewModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Edit Subscription</DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Status"
            fullWidth
            size="small"
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
          </TextField>
          
          <TextField
            type="number"
            label="Remaining Cleanings"
            fullWidth
            size="small"
            value={editForm.remainingCleanings}
            onChange={(e) => setEditForm({ ...editForm, remainingCleanings: parseInt(e.target.value, 10) || 0 })}
          />

          <FormControlLabel
            control={<Switch checked={editForm.autoRenew} onChange={(e) => setEditForm({ ...editForm, autoRenew: e.target.checked })} color="primary" />}
            label="Auto Renew"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#0D5BD7', boxShadow: 'none' }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Subscription Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Add New Subscription</DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Customer *"
            fullWidth
            size="small"
            value={addForm.customerId}
            onChange={(e) => setAddForm({ ...addForm, customerId: e.target.value })}
          >
            {customers.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phone})</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Vehicle *"
            fullWidth
            size="small"
            value={addForm.vehicleId}
            onChange={(e) => setAddForm({ ...addForm, vehicleId: e.target.value })}
          >
            {vehicles.filter(v => v.customerId?._id === addForm.customerId || v.customerId === addForm.customerId || !addForm.customerId).map(v => (
              <MenuItem key={v._id} value={v._id}>{v.vehicleNumber} - {v.make} {v.model}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Package *"
            fullWidth
            size="small"
            value={addForm.packageId}
            onChange={(e) => setAddForm({ ...addForm, packageId: e.target.value })}
          >
            {packages.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.name} (₹{p.price})</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Frequency"
            fullWidth
            size="small"
            value={addForm.frequency}
            onChange={(e) => setAddForm({ ...addForm, frequency: e.target.value })}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="biweekly">Bi-weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>

          <FormControlLabel
            control={<Switch checked={addForm.autoRenew} onChange={(e) => setAddForm({ ...addForm, autoRenew: e.target.checked })} color="primary" />}
            label="Auto Renew"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained" disabled={saving || !addForm.customerId || !addForm.vehicleId || !addForm.packageId} sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#0D5BD7', boxShadow: 'none' }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Create Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionListPage;
