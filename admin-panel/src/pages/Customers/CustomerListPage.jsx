import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Avatar, IconButton, InputAdornment,
  Pagination, CircularProgress, Chip, Grid, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Divider
} from '@mui/material';
import { customerApi, apartmentApi } from '../../services/api';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';

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

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', subscriptionStatus: 'All', isActive: 'All Status', city: 'All Cities', apartmentId: 'All Apartments' });
  const [stats, setStats] = useState(null);

  const [apartments, setApartments] = useState([]);

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', isActive: true });
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await customerApi.list({ page, limit: pagination.limit, ...filters });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await customerApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [fetchCustomers, fetchStats]);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const aptRes = await apartmentApi.list({ limit: 100 });
        setApartments(aptRes?.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchApts();
  }, []);

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
    fetchCustomers(value);
  };
  
  const handleLimitChange = (event) => {
    setPagination(prev => ({ ...prev, limit: event.target.value, page: 1 }));
  };

  const handleExport = () => {
    if (customers.length === 0) return alert('No data to export');
    const headers = ['Customer ID', 'Name', 'Mobile', 'Email', 'Apartment', 'Vehicles', 'Subscription', 'Cleaner', 'Supervisor', 'Status'];
    const csvData = customers.map(row => [
      row.customerIdDisplay,
      `"${row.firstName} ${row.lastName || ''}"`,
      row.phone,
      row.email || '',
      `"${row.assignedApartment?.society || '-'}"`,
      row.vehiclesCount || 0,
      row.subscriptionStatus,
      `"${row.assignedCleaner ? `${row.assignedCleaner.firstName} ${row.assignedCleaner.lastName || ''}` : '-'}"`,
      `"${row.assignedSupervisor ? `${row.assignedSupervisor.name}` : '-'}"`,
      row.isActive ? 'Active' : 'Inactive'
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenAdd = () => {
    setAddForm({ firstName: '', lastName: '', email: '', phone: '' });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    setSaving(true);
    try {
      await customerApi.create(addForm);
      fetchCustomers(1);
      fetchStats();
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenView = (c) => {
    setSelectedCust(c);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedCust(c);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      isActive: c.isActive,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await customerApi.update(selectedCust._id, editForm);
      fetchCustomers(pagination.page);
      fetchStats();
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { title: 'Total Customers', value: stats?.totalCustomers?.toLocaleString() || '0', icon: <PersonIcon sx={{ color: '#0D5BD7' }} />, iconBg: '#E3F2FD', change: '100% of total' },
    { title: 'Active Customers', value: stats?.activeCustomers?.toLocaleString() || '0', icon: <CheckCircleOutlineIcon sx={{ color: '#059669' }} />, iconBg: '#E8F5E9', change: `${stats?.totalCustomers ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(2) : 0}% of total` },
    { title: 'Inactive Customers', value: stats?.inactiveCustomers?.toLocaleString() || '0', icon: <PauseCircleOutlineIcon sx={{ color: '#D97706' }} />, iconBg: '#FEF3C7', change: `${stats?.totalCustomers ? ((stats.inactiveCustomers / stats.totalCustomers) * 100).toFixed(2) : 0}% of total` },
    { title: 'New This Month', value: stats?.newCustomersThisMonth?.toLocaleString() || '0', icon: <AccessTimeIcon sx={{ color: '#8B5CF6' }} />, iconBg: '#EDE9FE', change: `${stats?.totalCustomers ? ((stats.newCustomersThisMonth / stats.totalCustomers) * 100).toFixed(2) : 0}% of total` },
    { title: 'Total Vehicles', value: stats?.totalVehicles?.toLocaleString() || '0', icon: <DirectionsCarOutlinedIcon sx={{ color: '#00838F' }} />, iconBg: '#E0F7FA', change: 'Across all customers' },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>Customer Management</Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem', color: '#6B7280' }}>
            <Link underline="hover" color="inherit" href="#">Dashboard</Link>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>Customers</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleExport} variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#374151', fontWeight: 600, '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F3F4F6' } }}>
            Export
          </Button>
          <Button onClick={handleOpenAdd} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none', bgcolor: '#0D5BD7', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#0b4eb8', boxShadow: 'none' } }}>
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'flex-start', gap: 2, height: '100%' }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500, mb: 0.5 }}>{card.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>{card.value}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{card.change}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'nowrap', overflowX: 'auto', pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1, minWidth: 200 }}>
          <TextField
            size="small"
            placeholder="Search by name, mobile, email or customer ID..."
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
           <TextField select size="small" value={filters.isActive} onChange={(e) => setFilters({ ...filters, isActive: e.target.value })} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Status">All Status</MenuItem>
             <MenuItem value="active">Active</MenuItem>
             <MenuItem value="inactive">Inactive</MenuItem>
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Subscription</Typography>
           <TextField select size="small" value={filters.subscriptionStatus} onChange={(e) => setFilters({ ...filters, subscriptionStatus: e.target.value })} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All">All</MenuItem>
             <MenuItem value="active">Active</MenuItem>
             <MenuItem value="expired">Expired</MenuItem>
             <MenuItem value="cancelled">Cancelled</MenuItem>
             <MenuItem value="none">None</MenuItem>
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>City</Typography>
           <TextField select size="small" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Cities">All Cities</MenuItem>
             {Array.from(new Set(apartments.map(a => a.city))).filter(Boolean).map(city => (
               <MenuItem key={city} value={city}>{city}</MenuItem>
             ))}
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>Apartment</Typography>
           <TextField select size="small" value={filters.apartmentId} onChange={(e) => setFilters({ ...filters, apartmentId: e.target.value })} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
             <MenuItem value="All Apartments">All Apartments</MenuItem>
             {apartments.filter(a => filters.city === 'All Cities' || a.city === filters.city).map(apt => (
               <MenuItem key={apt._id} value={apt._id}>{apt.society}</MenuItem>
             ))}
           </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Button variant="outlined" startIcon={<FilterAltOutlinedIcon />} onClick={() => fetchCustomers(1)} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#0D5BD7', fontWeight: 600, height: 40, borderRadius: 1.5, minWidth: 100 }}>
             Filter
           </Button>
        </Box>
      </Paper>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }} aria-label="customer table">
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Customer ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Apartment</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Vehicles</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Subscription</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Assigned Cleaner</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Assigned Supervisor</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 10, color: '#6B7280' }}>No customers found matching the criteria.</TableCell></TableRow>
            ) : (
              customers.map((row) => {
                const customerName = `${row.firstName} ${row.lastName || ''}`.trim();
                const avatarColors = getAvatarColor(customerName);
                
                const subStatusColors = {
                  'active': { bg: '#DEF7EC', text: '#03543F' },
                  'expired': { bg: '#FDE8E8', text: '#9B1C1C' },
                  'expiring soon': { bg: '#FEF3C7', text: '#D97706' },
                  'cancelled': { bg: '#FDE8E8', text: '#9B1C1C' },
                  'none': { bg: '#F3F4F6', text: '#374151' },
                };
                let displaySubStatus = row.subscriptionStatus || 'none';
                if (displaySubStatus === 'active' && row.cleaningBalance < 2 && row.cleaningBalance > 0) {
                    displaySubStatus = 'expiring soon';
                }
                const subColor = subStatusColors[displaySubStatus] || subStatusColors['none'];

                return (
                  <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <TableCell sx={{ color: '#111827', fontWeight: 500 }}>{row.customerIdDisplay}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: avatarColors.bg, color: avatarColors.text, width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600 }}>
                          {getInitials(customerName)}
                        </Avatar>
                        <Typography sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{customerName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#4B5563', fontSize: '0.875rem' }}>{row.phone}</TableCell>
                    <TableCell sx={{ color: '#4B5563', fontSize: '0.875rem' }}>{row.email || '-'}</TableCell>
                    <TableCell sx={{ color: '#4B5563', fontSize: '0.875rem' }}>{row.assignedApartment?.society || '-'}</TableCell>
                    <TableCell align="center" sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>{row.vehiclesCount}</TableCell>
                    <TableCell>
                      <Chip label={displaySubStatus.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} size="small" sx={{ bgcolor: subColor.bg, color: subColor.text, fontWeight: 600, borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      {row.assignedCleaner ? (
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500 }}>{`${row.assignedCleaner.firstName} ${row.assignedCleaner.lastName || ''}`}</Typography>
                          <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{row.assignedCleaner.cleanerId || 'CL-NA'}</Typography>
                        </Box>
                      ) : <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>—</Typography>}
                    </TableCell>
                    <TableCell>
                      {row.assignedSupervisor ? (
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500 }}>{row.assignedSupervisor.name}</Typography>
                          <Typography sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{row.assignedSupervisor.code || 'SU-NA'}</Typography>
                        </Box>
                      ) : <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>—</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip label={row.isActive ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: row.isActive ? '#DEF7EC' : '#FDE8E8', color: row.isActive ? '#03543F' : '#9B1C1C', fontWeight: 600, borderRadius: 1 }} />
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
        {!loading && customers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField select size="small" value={pagination.limit} onChange={handleLimitChange} sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
                  <MenuItem value={10}>10 / page</MenuItem>
                  <MenuItem value={20}>20 / page</MenuItem>
                  <MenuItem value={50}>50 / page</MenuItem>
                </TextField>
              </Box>
              <Pagination count={pagination.totalPages} page={pagination.page} onChange={handlePageChange} shape="rounded" color="primary" sx={{ '& .MuiPaginationItem-root': { borderRadius: 1.5 } }} />
            </Box>
          </Box>
        )}
      </TableContainer>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Customer Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedCust && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Customer ID</Typography><Typography fontWeight="600">{selectedCust.customerIdDisplay}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Status</Typography><Chip size="small" label={selectedCust.isActive ? 'Active' : 'Inactive'} color={selectedCust.isActive ? 'success' : 'error'} /></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Name</Typography><Typography>{selectedCust.firstName} {selectedCust.lastName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Phone</Typography><Typography>{selectedCust.phone}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Email</Typography><Typography>{selectedCust.email || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Apartment</Typography><Typography>{selectedCust.assignedApartment?.society || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Vehicles</Typography><Typography>{selectedCust.vehiclesCount}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Subscription</Typography><Typography sx={{ textTransform: 'capitalize' }}>{selectedCust.subscriptionStatus}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Total Bookings</Typography><Typography>{selectedCust.totalBookings}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="textSecondary">Total Spent</Typography><Typography>₹{selectedCust.totalSpent}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setViewModalOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Add Customer</DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField label="First Name" fullWidth size="small" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} />
          <TextField label="Last Name" fullWidth size="small" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} />
          <TextField label="Phone" fullWidth size="small" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
          <TextField label="Email" type="email" fullWidth size="small" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained" disabled={saving || !addForm.firstName || !addForm.phone} sx={{ bgcolor: '#0D5BD7' }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Create Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>Edit Customer</DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField label="First Name" fullWidth size="small" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
          <TextField label="Last Name" fullWidth size="small" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
          <TextField label="Email" type="email" fullWidth size="small" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <TextField label="Phone" fullWidth size="small" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <FormControlLabel control={<Switch checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} color="primary" />} label="Active Account" />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving} sx={{ bgcolor: '#0D5BD7' }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerListPage;
