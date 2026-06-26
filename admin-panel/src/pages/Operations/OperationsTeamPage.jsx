import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { format } from 'date-fns';

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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// API
import { adminApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const AVAILABLE_PERMISSIONS = [
  { id: 'cleaners_manage', label: 'Manage Cleaners', desc: 'Add, edit, verify or deactivate car cleaners' },
  { id: 'customers_manage', label: 'Manage Customers', desc: 'View and manage customer profiles and stats' },
  { id: 'tasks_manage', label: 'Manage Tasks', desc: 'Create, assign, complete or skip service tasks' },
  { id: 'payments_manage', label: 'Manage Payments', desc: 'Process payment orders, refunds, and view payouts' },
  { id: 'training_manage', label: 'Manage Training', desc: 'Add training videos and track progress of cleaners' },
  { id: 'zones_manage', label: 'Manage Zones', desc: 'Define service zones and active clean zones' },
  { id: 'analytics_view', label: 'View Analytics', desc: 'Access financial, revenue, and product reports' },
  { id: 'settings_manage', label: 'Manage Settings', desc: 'Configure default booking settings and configs' },
  { id: 'support_manage', label: 'Manage Support', desc: 'Handle client complaints, issues, and chat requests' }
];

const OperationsTeamPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Lists & Stats
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filters State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Active filters applied
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    roleFilter: '',
    statusFilter: '',
  });

  // Selected details drawer
  const [selectedStaff, setSelectedStaff] = useState(null);
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

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      let isActiveQuery = undefined;
      if (appliedFilters.statusFilter === 'active') {
        isActiveQuery = 'true';
      } else if (appliedFilters.statusFilter === 'inactive') {
        isActiveQuery = 'false';
      }

      const res = await adminApi.list({
        page,
        limit,
        search: appliedFilters.search,
        role: appliedFilters.roleFilter || undefined,
        isActive: isActiveQuery,
      });

      if (res?.success) {
        let sortedData = [...(res.data || [])];

        // Apply frontend sorting
        sortedData.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (sortField === 'name') {
            valA = `${a.firstName} ${a.lastName || ''}`.trim();
            valB = `${b.firstName} ${b.lastName || ''}`.trim();
          }

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setStaffList(sortedData);
        setPagination({
          page: res.pagination?.page || page,
          limit: res.pagination?.limit || limit,
          total: res.pagination?.total || sortedData.length,
          totalPages: res.pagination?.totalPages || Math.ceil(sortedData.length / limit),
        });
      }
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to fetch operations team staff', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortField, sortOrder, enqueueSnackbar]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
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
      roleFilter,
      statusFilter,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setAppliedFilters({
      search: '',
      roleFilter: '',
      statusFilter: '',
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
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        role: 'operations',
        permissions: ['cleaners_manage', 'customers_manage', 'tasks_manage']
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
        role: row.role || 'operations',
        permissions: row.permissions || []
      },
    });
    setFormErrors({});
  };

  const handleSaveStaff = async () => {
    const errors = {};
    if (!formDialog.data.firstName?.trim()) errors.firstName = 'First Name is required';
    if (!formDialog.data.phone?.trim()) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (formDialog.mode === 'add') {
        await adminApi.create(formDialog.data);
        enqueueSnackbar('Operations team staff added successfully', { variant: 'success' });
      } else {
        await adminApi.update(formDialog.data._id, formDialog.data);
        enqueueSnackbar('Staff details updated successfully', { variant: 'success' });
      }
      setFormDialog(null);
      fetchData(pagination.page, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to save staff details', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDeactivate = async (row) => {
    try {
      if (row.isActive) {
        await adminApi.deactivate(row._id);
        enqueueSnackbar('Staff suspended and deactivated', { variant: 'warning' });
      } else {
        // Activate by updating isActive to true
        await adminApi.update(row._id, { isActive: true });
        enqueueSnackbar('Staff reactivated successfully', { variant: 'success' });
      }
      fetchData(pagination.page, pagination.limit);
      fetchStats();
      if (selectedStaff && selectedStaff._id === row._id) {
        setSelectedStaff(prev => ({ ...prev, isActive: !row.isActive }));
      }
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to update status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(deleteTarget._id);
      enqueueSnackbar('Staff member deleted permanently', { variant: 'success' });
      setDeleteTarget(null);
      if (selectedStaff && selectedStaff._id === deleteTarget._id) {
        setSelectedStaff(null);
      }
      fetchData(1, pagination.limit);
      fetchStats();
    } catch (err) {
      enqueueSnackbar('Failed to delete staff member', { variant: 'error' });
    }
  };

  const handleUpdatePermissionToggle = async (permissionId, isChecked) => {
    if (!selectedStaff) return;
    try {
      let updatedPermissions = [...(selectedStaff.permissions || [])];
      if (isChecked) {
        if (!updatedPermissions.includes(permissionId)) updatedPermissions.push(permissionId);
      } else {
        updatedPermissions = updatedPermissions.filter(p => p !== permissionId);
      }

      await adminApi.updatePermissions(selectedStaff._id, updatedPermissions);
      setSelectedStaff(prev => ({ ...prev, permissions: updatedPermissions }));
      
      // Update staff list locally
      setStaffList(prevList => prevList.map(item => {
        if (item._id === selectedStaff._id) {
          return { ...item, permissions: updatedPermissions };
        }
        return item;
      }));

      enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to update permissions', { variant: 'error' });
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

  const kpis = useMemo(() => {
    return {
      total: stats?.totalAdmins || 0,
      active: stats?.activeAdmins || 0,
      inactive: stats?.inactiveAdmins || 0,
      operations: stats?.operationsCount || 0,
      managers: stats?.managersCount || 0,
    };
  }, [stats]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Operations Team Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>Operations Team</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
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
            Add Staff Member
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Staff */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Staff
              </Typography>
              <Avatar sx={{ bgcolor: '#EFF6FF', width: 36, height: 36 }}>
                <SupervisorAccountIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              System Administrators & Operations
            </Typography>
          </Card>
        </Grid>

        {/* Active Staff */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Staff
              </Typography>
              <Avatar sx={{ bgcolor: '#ECFDF5', width: 36, height: 36 }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.active}
            </Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
              {kpis.total ? Math.round((kpis.active / kpis.total) * 100) : 0}% <Box component="span" sx={{ color: '#64748B', fontWeight: 400 }}>of total online</Box>
            </Typography>
          </Card>
        </Grid>

        {/* Operations Team Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Operations Team
              </Typography>
              <Avatar sx={{ bgcolor: '#FFFBEB', width: 36, height: 36 }}>
                <BadgeIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.operations}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              On-field coordinators & ops staff
            </Typography>
          </Card>
        </Grid>

        {/* Managers Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Managers & Admins
              </Typography>
              <Avatar sx={{ bgcolor: '#F5F3FF', width: 36, height: 36 }}>
                <AdminPanelSettingsIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {kpis.managers}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Privileged system managers
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
        <TextField
          size="small"
          placeholder="Search by name, email or phone..."
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
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="operations">Operations Staff</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="super_admin">Super Admin</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
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
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading operations staff...</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 1100, tableLayout: 'auto' }}>
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Staff Name <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }}>Contact Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5, cursor: 'pointer' }} onClick={() => handleSort('role')}>
                    System Role <SwapVertIcon fontSize="inherit" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }}>Granted Permissions</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.825rem', py: 1.5 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((row) => {
                  const nameStr = `${row.firstName} ${row.lastName || ''}`.trim();
                  const logoChar = row.firstName ? row.firstName[0].toUpperCase() : 'O';
                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
                            {logoChar}
                          </Avatar>
                          <Typography
                            onClick={() => {
                              setSelectedStaff(row);
                              setDrawerTab(0);
                            }}
                            sx={{
                              fontWeight: 600,
                              color: '#1E293B',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              '&:hover': { color: '#2563EB', textDecoration: 'underline' }
                            }}
                          >
                            {nameStr}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#1E293B' }}>{row.phone}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>{row.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={row.role === 'super_admin' ? 'Super Admin' : row.role === 'manager' ? 'Manager' : 'Operations'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ...(row.role === 'super_admin'
                              ? { bgcolor: '#FCE7F3', color: '#9D174D' }
                              : row.role === 'manager'
                              ? { bgcolor: '#F3E8FF', color: '#6B21A8' }
                              : { bgcolor: '#E0F2FE', color: '#075985' }
                            )
                          }}
                        />
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
                            ...(row.isActive
                              ? { bgcolor: '#ECFDF5', color: '#065F46' }
                              : { bgcolor: '#FEF2F2', color: '#991B1B' }
                            ),
                          }}
                        >
                          {row.isActive ? 'Active' : 'Suspended'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, maxWidth: 300 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {row.permissions && row.permissions.slice(0, 3).map((p) => {
                            const found = AVAILABLE_PERMISSIONS.find(item => item.id === p);
                            return (
                              <Chip
                                key={p}
                                label={found ? found.label : p}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            );
                          })}
                          {row.permissions && row.permissions.length > 3 && (
                            <Chip
                              label={`+${row.permissions.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20, bgcolor: '#F8FAFC' }}
                            />
                          )}
                          {(!row.permissions || row.permissions.length === 0) && (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>No permissions granted</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Permissions">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedStaff(row);
                                setDrawerTab(1); // Open directly to permissions tab
                              }}
                              sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                            >
                              <SecurityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Details">
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
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff members
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
            handleToggleDeactivate(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, color: activeMenuRow?.isActive ? '#EF4444' : '#10B981', fontSize: '0.875rem' }}
        >
          <BlockIcon fontSize="small" /> {activeMenuRow?.isActive ? 'Suspend Staff' : 'Reactivate Staff'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteTarget(activeMenuRow);
            handleCloseActionMenu();
          }}
          sx={{ gap: 1, color: '#EF4444', fontSize: '0.875rem' }}
        >
          <DeleteIcon fontSize="small" /> Delete Permanently
        </MenuItem>
      </Menu>

      {/* Details & Permissions Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 520 }, borderLeft: 'none' } }}
      >
        {selectedStaff && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 700, fontSize: '1.25rem' }}>
                  {selectedStaff.firstName ? selectedStaff.firstName[0].toUpperCase() : 'O'}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                      {selectedStaff.firstName} {selectedStaff.lastName || ''}
                    </Typography>
                    <Chip
                      label={selectedStaff.isActive ? 'Active' : 'Suspended'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                        ...(selectedStaff.isActive
                          ? { bgcolor: '#ECFDF5', color: '#065F46' }
                          : { bgcolor: '#FEF2F2', color: '#991B1B' }
                        )
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'capitalize' }}>
                    {selectedStaff.role === 'super_admin' ? 'Super Admin' : selectedStaff.role === 'manager' ? 'Manager' : 'Operations Staff'}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedStaff(null)} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
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
              <Tab label="Staff Profile" />
              <Tab label="Granted Permissions" />
            </Tabs>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {drawerTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Contact Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Primary Phone</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedStaff.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Email Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedStaff.email}</Typography>
                    </Box>
                  </Box>

                  <Divider />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>System Account Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>System Role</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase', color: '#2563EB' }}>{selectedStaff.role}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Onboarded On</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedStaff.createdAt ? format(new Date(selectedStaff.createdAt), 'dd MMM yyyy') : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Last Logged In</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedStaff.userId?.lastLogin ? format(new Date(selectedStaff.userId.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {drawerTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                    Role Access Control list (ACL)
                  </Typography>
                  <FormGroup>
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = selectedStaff.permissions?.includes(perm.id) || false;
                      return (
                        <Card key={perm.id} sx={{ p: 2, mb: 1.5, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) => handleUpdatePermissionToggle(perm.id, e.target.checked)}
                            disabled={selectedStaff.role === 'super_admin'}
                            sx={{ mt: -0.5 }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>{perm.label}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>{perm.desc}</Typography>
                          </Box>
                        </Card>
                      );
                    })}
                  </FormGroup>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      <Dialog open={Boolean(formDialog)} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {formDialog?.mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Details'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5, pb: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="First Name"
                value={formDialog?.data.firstName || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, firstName: e.target.value } }))}
                error={Boolean(formErrors.firstName)}
                helperText={formErrors.firstName}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="Last Name"
                value={formDialog?.data.lastName || ''}
                onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, lastName: e.target.value } }))}
                fullWidth
              />
            </Grid>
          </Grid>

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

          <TextField
            size="small"
            label="Email Address"
            type="email"
            value={formDialog?.data.email || ''}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
            fullWidth
          />

          <TextField
            select
            size="small"
            label="System Role"
            value={formDialog?.data.role || 'operations'}
            onChange={(e) => setFormDialog(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
            fullWidth
          >
            <MenuItem value="operations">Operations Staff</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </TextField>

          {formDialog?.mode === 'add' && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 1 }}>Default Permissions</Typography>
              <Grid container spacing={1}>
                {AVAILABLE_PERMISSIONS.slice(0, 4).map((perm) => (
                  <Grid item xs={6} key={perm.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={formDialog?.data.permissions?.includes(perm.id)}
                          onChange={(e) => {
                            const current = [...(formDialog.data.permissions || [])];
                            let updated = [];
                            if (e.target.checked) {
                              updated = [...current, perm.id];
                            } else {
                              updated = current.filter(id => id !== perm.id);
                            }
                            setFormDialog(prev => ({ ...prev, data: { ...prev.data, permissions: updated } }));
                          }}
                        />
                      }
                      label={<span style={{ fontSize: '0.75rem' }}>{perm.label}</span>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFormDialog(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {saving ? 'Saving...' : formDialog?.mode === 'add' ? 'Add Staff' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Staff Member"
        message={`Are you sure you want to permanently remove ${deleteTarget?.firstName} ${deleteTarget?.lastName || ''}? This will delete their administrator credentials.`}
        confirmLabel="Remove"
      />
    </Box>
  );
};

export default OperationsTeamPage;
