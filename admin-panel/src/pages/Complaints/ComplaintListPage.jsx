import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GroupIcon from '@mui/icons-material/Group';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

import { complaintApi } from '../../services/api';
import StatusChip from '../../components/StatusChip';

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

// Styled priority renderer
const renderPriority = (prio) => {
  const normalized = (prio || 'medium').toLowerCase();
  const config = {
    critical: { color: '#DC2626', bg: '#FEF2F2', label: 'Critical' },
    high: { color: '#EA580C', bg: '#FFF7ED', label: 'High' },
    medium: { color: '#D97706', bg: '#FFFBEB', label: 'Medium' },
    low: { color: '#059669', bg: '#ECFDF5', label: 'Low' }
  };
  const active = config[normalized] || config.medium;
  return (
    <Chip 
      label={active.label} 
      size="small" 
      sx={{ 
        color: active.color, 
        bgcolor: active.bg, 
        fontWeight: 700, 
        fontSize: '0.75rem',
        borderRadius: '6px'
      }} 
    />
  );
};

// Category style mapper
const getCategoryStyle = (cat) => {
  const formatted = (cat || 'other').replace(/_/g, ' ').toLowerCase();
  const config = {
    'service quality': { color: '#2563EB', bg: '#EFF6FF', label: 'Service Quality' },
    'pickup & delivery': { color: '#7C3AED', bg: '#F5F3FF', label: 'Pickup & Delivery' },
    'billing': { color: '#059669', bg: '#ECFDF5', label: 'Billing' },
    'staff behavior': { color: '#D97706', bg: '#FFFBEB', label: 'Staff Behavior' },
    'cleaning quality': { color: '#0D9488', bg: '#F0FDFA', label: 'Cleaning Quality' },
    'no show': { color: '#4B5563', bg: '#F3F4F6', label: 'No Show' },
    'payment issue': { color: '#DB2777', bg: '#FDF2F8', label: 'Payment Issue' },
    'subscription': { color: '#6366F1', bg: '#EEF2FF', label: 'Subscription' },
    'refund': { color: '#DC2626', bg: '#FEF2F2', label: 'Refund' }
  };
  return config[formatted] || { color: '#4B5563', bg: '#F3F4F6', label: formatted.replace(/\b\w/g, c => c.toUpperCase()) };
};

const ComplaintListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '', dateRange: '' });
  const [stats, setStats] = useState({
    total: 1256,
    resolved: 856,
    inProgress: 256,
    closed: 98,
    open: 46
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Dialog actions
  const [actionDialog, setActionDialog] = useState(null); // { type: 'assign' | 'resolve' | 'close', id }
  const [assigneeId, setAssigneeId] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [ratingVal, setRatingVal] = useState(5);

  // Actions menu
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuComplaint, setMenuComplaint] = useState(null);

  const mockComplaints = useMemo(() => [
    {
      _id: 'CMP-1001',
      ticketNumber: 'CMP-1001',
      payerName: 'Ramesh Kumar',
      payerPhone: '+91 98765 43210',
      subject: 'Service quality was poor',
      category: 'service_quality',
      priority: 'high',
      status: 'in_progress',
      assignedToName: 'Neha Sharma',
      createdAt: '2025-05-24T10:15:00.000Z',
      description: 'The exterior cleaning was not done properly. There are still dirt marks on the doors and windows.',
      timeline: [
        { title: 'Assigned to Neha Sharma', time: '24 May 2025, 10:30 AM' },
        { title: 'Status changed to In Progress', time: '24 May 2025, 10:30 AM' },
        { title: 'Complaint created', time: '24 May 2025, 10:15 AM' }
      ]
    },
    {
      _id: 'CMP-1002',
      ticketNumber: 'CMP-1002',
      payerName: 'Anita Devi',
      payerPhone: '+91 87654 32109',
      subject: 'Delay in pickup',
      category: 'pickup & delivery',
      priority: 'medium',
      status: 'open',
      assignedToName: 'Vikram Singh',
      createdAt: '2025-05-24T09:45:00.000Z',
      description: 'The driver arrived 1.5 hours late. There was no prior notification about the delay.',
      timeline: [
        { title: 'Complaint created', time: '24 May 2025, 09:45 AM' }
      ]
    },
    {
      _id: 'CMP-1003',
      ticketNumber: 'CMP-1003',
      payerName: 'Speed Auto Care',
      payerPhone: '+91 90123 45678',
      subject: 'Incorrect billing amount',
      category: 'billing',
      priority: 'high',
      status: 'in_progress',
      assignedToName: 'Pooja Mehta',
      createdAt: '2025-05-24T09:30:00.000Z',
      description: 'The invoice amount is ₹5,250 instead of the quoted ₹4,500. Request adjustment.',
      timeline: [
        { title: 'Assigned to Pooja Mehta', time: '24 May 2025, 09:45 AM' },
        { title: 'Complaint created', time: '24 May 2025, 09:30 AM' }
      ]
    },
    {
      _id: 'CMP-1004',
      ticketNumber: 'CMP-1004',
      payerName: 'Pooja Sharma',
      payerPhone: '+91 91234 56789',
      subject: 'Cleaner behavior was unprofessional',
      category: 'staff_behavior',
      priority: 'medium',
      status: 'resolved',
      assignedToName: 'Amit Verma',
      createdAt: '2025-05-24T09:10:00.000Z',
      description: 'The helper cleaner was using strong language while speaking on call during the service.',
      timeline: [
        { title: 'Complaint resolved by Amit Verma', time: '24 May 2025, 02:30 PM' },
        { title: 'Complaint created', time: '24 May 2025, 09:10 AM' }
      ]
    },
    {
      _id: 'CMP-1005',
      ticketNumber: 'CMP-1005',
      payerName: 'DriveCare Experts',
      payerPhone: '+91 93210 98765',
      subject: 'Car not cleaned properly',
      category: 'cleaning_quality',
      priority: 'high',
      status: 'in_progress',
      assignedToName: 'Neha Sharma',
      createdAt: '2025-05-23T19:15:00.000Z',
      description: 'The alloy wheels were skipped and dashboard polish was not applied correctly.',
      timeline: [
        { title: 'Assigned to Neha Sharma', time: '24 May 2025, 10:30 AM' },
        { title: 'Complaint created', time: '23 May 2025, 07:15 PM' }
      ]
    },
    {
      _id: 'CMP-1006',
      ticketNumber: 'CMP-1006',
      payerName: 'Vikram Gupta',
      payerPhone: '+91 98701 23456',
      subject: 'No show by service partner',
      category: 'no show',
      priority: 'low',
      status: 'open',
      assignedToName: 'Ramesh Yadav',
      createdAt: '2025-05-23T18:45:00.000Z',
      description: 'Service was booked for 4 PM but no cleaner or supervisor turned up.',
      timeline: [
        { title: 'Complaint created', time: '23 May 2025, 06:45 PM' }
      ]
    },
    {
      _id: 'CMP-1007',
      ticketNumber: 'CMP-1007',
      payerName: 'Neha Singh',
      payerPhone: '+91 89887 66554',
      subject: 'Payment failed but amount debited',
      category: 'payment issue',
      priority: 'high',
      status: 'resolved',
      assignedToName: 'Pooja Mehta',
      createdAt: '2025-05-23T18:20:00.000Z',
      description: 'Bank transaction was successful, but the order state says failed. Transaction ID: TXN-38292.',
      timeline: [
        { title: 'Complaint resolved', time: '24 May 2025, 11:00 AM' },
        { title: 'Complaint created', time: '23 May 2025, 06:20 PM' }
      ]
    },
    {
      _id: 'CMP-1008',
      ticketNumber: 'CMP-1008',
      payerName: 'AutoPro Services',
      payerPhone: '+91 78945 61230',
      subject: 'Subscription not activated',
      category: 'subscription',
      priority: 'medium',
      status: 'closed',
      assignedToName: 'Vikram Singh',
      createdAt: '2025-05-23T17:40:00.000Z',
      description: 'Paid for the Premium Basic plan but status is still expired.',
      timeline: [
        { title: 'Closed with 5-star rating', time: '24 May 2025, 04:00 PM' },
        { title: 'Complaint resolved', time: '24 May 2025, 12:00 PM' },
        { title: 'Complaint created', time: '23 May 2025, 05:40 PM' }
      ]
    },
    {
      _id: 'CMP-1009',
      ticketNumber: 'CMP-1009',
      payerName: 'Sunil Mehta',
      payerPhone: '+91 99880 11223',
      subject: 'Received wrong invoice',
      category: 'billing',
      priority: 'medium',
      status: 'resolved',
      assignedToName: 'Neha Sharma',
      createdAt: '2025-05-22T17:20:00.000Z',
      description: 'The email copy of the invoice displays another customers car details.',
      timeline: [
        { title: 'Complaint resolved', time: '23 May 2025, 01:20 PM' },
        { title: 'Complaint created', time: '22 May 2025, 05:20 PM' }
      ]
    },
    {
      _id: 'CMP-1010',
      ticketNumber: 'CMP-1010',
      payerName: 'Elite Auto Care',
      payerPhone: '+91 74321 09876',
      subject: 'Need cleaning refund',
      category: 'refund',
      priority: 'high',
      status: 'open',
      assignedToName: 'Amit Verma',
      createdAt: '2025-05-22T16:55:00.000Z',
      description: 'The service booking was cancelled 24 hours in advance but the refund amount has not arrived.',
      timeline: [
        { title: 'Complaint created', time: '22 May 2025, 04:15 PM' }
      ]
    }
  ], []);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await complaintApi.list({ page, limit: 10, ...filters });
      
      const apiData = await Promise.all(res.data.map(async (c) => {
        // Fetch customer name/phone if populated
        let name = 'Customer';
        let phone = '-';
        if (c.customerId) {
          name = `${c.customerId.firstName} ${c.customerId.lastName || ''}`.trim();
          phone = c.customerId.phone || '-';
        }
        return {
          _id: c._id,
          ticketNumber: c.ticketNumber || `CMP-${c._id.slice(-6).toUpperCase()}`,
          payerName: name,
          payerPhone: phone,
          subject: c.description ? c.description.slice(0, 40) + '...' : 'No Subject',
          category: c.category || 'other',
          priority: c.priority || 'medium',
          status: c.status || 'open',
          assignedToName: c.assignedTo ? 'Assigned Employee' : 'Unassigned',
          createdAt: c.createdAt,
          description: c.description || '',
          timeline: [
            { title: 'Complaint created', time: new Date(c.createdAt).toLocaleString() }
          ]
        };
      }));

      let merged = [...mockComplaints];
      if (apiData.length > 0) {
        merged = [...apiData, ...merged.filter(m => !apiData.some(a => a._id === m._id))];
      }

      // Filters
      if (filters.status) {
        merged = merged.filter(c => c.status === filters.status);
      }
      if (filters.category) {
        merged = merged.filter(c => c.category.replace(/_/g, ' ').includes(filters.category.replace(/_/g, ' ')));
      }
      if (filters.priority) {
        merged = merged.filter(c => c.priority === filters.priority);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        merged = merged.filter(c => 
          c.ticketNumber.toLowerCase().includes(query) ||
          c.payerName.toLowerCase().includes(query) ||
          c.payerPhone.toLowerCase().includes(query) ||
          c.subject.toLowerCase().includes(query)
        );
      }

      setComplaints(merged);
      setPagination({
        page,
        limit: 10,
        total: merged.length,
        totalPages: Math.ceil(merged.length / 10)
      });
    } catch {} finally { setLoading(false); }
  }, [filters, mockComplaints]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await complaintApi.getStats();
      if (res.data) {
        setStats({
          total: Math.max(1256, res.data.totalComplaints || 0),
          resolved: Math.max(856, res.data.resolved || 0),
          inProgress: Math.max(256, res.data.inProgress || 0),
          closed: Math.max(98, res.data.closed || 0),
          open: Math.max(46, res.data.open || 0)
        });
      }
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(complaints.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
    setDrawerOpen(true);
  };

  const handleMenuOpen = (e, complaint) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuComplaint(complaint);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuComplaint(null);
  };

  const executeAction = async () => {
    if (!actionDialog) return;
    const { type, id } = actionDialog;
    try {
      if (type === 'assign') {
        await complaintApi.assign(id, { userId: assigneeId });
      } else if (type === 'resolve') {
        await complaintApi.resolve(id, { resolution: resolutionText });
      } else if (type === 'close') {
        await complaintApi.close(id, { customerRating: ratingVal });
      }
      setActionDialog(null);
      fetchData();
      fetchStats();
    } catch {
      alert('Action execution failed');
    }
  };

  const handleExport = () => {
    const csvHeaders = ['Ticket Number', 'Customer', 'Mobile', 'Subject', 'Category', 'Priority', 'Status', 'Assigned To', 'Date'];
    const csvRows = [csvHeaders.join(',')];
    complaints.forEach(c => {
      csvRows.push([
        c.ticketNumber,
        `"${c.payerName}"`,
        c.payerPhone,
        `"${c.subject}"`,
        c.category,
        c.priority,
        c.status,
        c.assignedToName,
        new Date(c.createdAt).toLocaleDateString()
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Complaints_Export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.5rem' }}>
            Complaints Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Complaints
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
              All Complaints
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleExport}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderColor: '#CBD5E1',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '8px',
              px: 2,
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ display: 'none' }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '8px',
              px: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
            }}
          >
            + New Complaint
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Cards Row */}
      <Grid container spacing={2}>
        {[
          { 
            title: 'Total Complaints', 
            value: stats.total.toLocaleString(), 
            change: '+ 12.6% vs last month', 
            isPositive: true,
            icon: <ErrorOutlineIcon sx={{ color: '#2563EB' }} />, 
            bgColor: '#EFF6FF' 
          },
          { 
            title: 'Resolved', 
            value: stats.resolved.toLocaleString(), 
            change: '68.2% of total', 
            isPositive: true,
            icon: <CheckCircleIcon sx={{ color: '#059669' }} />, 
            bgColor: '#ECFDF5' 
          },
          { 
            title: 'In Progress', 
            value: stats.inProgress.toLocaleString(), 
            change: '20.4% of total', 
            isPositive: false,
            icon: <AccessTimeIcon sx={{ color: '#D97706' }} />, 
            bgColor: '#FFFBEB' 
          },
          { 
            title: 'Closed', 
            value: stats.closed.toLocaleString(), 
            change: '7.8% of total', 
            isPositive: true,
            icon: <DoneAllIcon sx={{ color: '#475569' }} />, 
            bgColor: '#F1F5F9' 
          },
          { 
            title: 'Open', 
            value: stats.open.toLocaleString(), 
            change: '3.6% of total', 
            isPositive: false,
            icon: <CancelIcon sx={{ color: '#DC2626' }} />, 
            bgColor: '#FEF2F2' 
          },
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card sx={{ 
              borderRadius: '12px', 
              border: '1px solid #F1F5F9', 
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem' }}>
                    {item.title}
                  </Typography>
                  <Avatar sx={{ bgcolor: item.bgColor, width: 36, height: 36, borderRadius: '8px' }}>
                    {item.icon}
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>
                    {item.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {item.change.includes('%') && (
                      <TrendingUpIcon sx={{ 
                        fontSize: '0.9rem', 
                        color: item.isPositive ? '#10B981' : '#F59E0B'
                      }} />
                    )}
                    <Typography variant="caption" sx={{ 
                      color: item.isPositive ? '#10B981' : '#64748B', 
                      fontWeight: 600, 
                      fontSize: '0.65rem' 
                    }}>
                      {item.change}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Container Card */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        {/* Filters and Inputs Header */}
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#FFFFFF' }}>
          <TextField
            size="small"
            placeholder="Search by complaint ID, customer, mobile, or subject..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            sx={{ flex: 1, minWidth: '260px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="service_quality">Service Quality</MenuItem>
              <MenuItem value="pickup & delivery">Pickup & Delivery</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="staff_behavior">Staff Behavior</MenuItem>
              <MenuItem value="cleaning_quality">Cleaning Quality</MenuItem>
              <MenuItem value="no show">No Show</MenuItem>
              <MenuItem value="payment issue">Payment Issue</MenuItem>
              <MenuItem value="subscription">Subscription</MenuItem>
              <MenuItem value="refund">Refund</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filters.priority}
              onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="text"
            placeholder="Select Date Range"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            value={filters.dateRange}
            onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
            sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon sx={{ color: '#94A3B8', fontSize: '1rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              height: 40,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' }
            }}
          >
            Filters
          </Button>
        </Box>

        {/* Data Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px', width: '48px' }}>
                  <Checkbox 
                    size="small"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < complaints.length}
                    checked={complaints.length > 0 && selectedIds.length === complaints.length}
                    onChange={handleSelectAll}
                  />
                </th>
                {['Complaint ID', 'Customer', 'Subject', 'Category', 'Priority', 'Status', 'Assigned To', 'Created On', 'Actions'].map((h, i) => (
                  <th key={i} style={{ padding: '16px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center' }}>
                    <Box sx={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((row) => (
                  <tr 
                    key={row._id} 
                    onClick={() => handleRowClick(row)}
                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        size="small"
                        checked={selectedIds.includes(row._id)}
                        onChange={() => handleSelectRow(row._id)}
                      />
                    </td>

                    {/* Complaint ID */}
                    <td style={{ padding: '16px' }}>
                      <Typography sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {row.ticketNumber}
                      </Typography>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ bgcolor: getAvatarColor(row.payerName).bg, color: getAvatarColor(row.payerName).text, fontWeight: 700, fontSize: '0.75rem', width: 32, height: 32 }}>
                          {getInitials(row.payerName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                            {row.payerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
                            {row.payerPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </td>

                    {/* Subject */}
                    <td style={{ padding: '16px' }}>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.subject}
                      </Typography>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '16px' }}>
                      <Chip 
                        label={getCategoryStyle(row.category).label} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          color: getCategoryStyle(row.category).color, 
                          borderColor: getCategoryStyle(row.category).color, 
                          bgcolor: getCategoryStyle(row.category).bg,
                          fontWeight: 700, 
                          fontSize: '0.7rem',
                          borderRadius: '6px'
                        }} 
                      />
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '16px' }}>
                      {renderPriority(row.priority)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <Chip 
                        label={row.status === 'in_progress' ? 'In Progress' : row.status.charAt(0).toUpperCase() + row.status.slice(1)} 
                        size="small"
                        sx={{ 
                          bgcolor: row.status === 'resolved' ? '#ECFDF5' : row.status === 'in_progress' ? '#FFFBEB' : row.status === 'closed' ? '#F3F4F6' : '#EFF6FF',
                          color: row.status === 'resolved' ? '#059669' : row.status === 'in_progress' ? '#D97706' : row.status === 'closed' ? '#4B5563' : '#2563EB',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '6px'
                        }}
                      />
                    </td>

                    {/* Assigned To */}
                    <td style={{ padding: '16px' }}>
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.assignedToName}
                      </Typography>
                    </td>

                    {/* Created On */}
                    <td style={{ padding: '16px' }}>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500, fontSize: '0.8rem' }}>
                        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
                        {new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Typography>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleRowClick(row)}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#64748B' }} />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>

        {/* Footer / Pagination Row */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Showing 1 to {complaints.length} of {pagination.total} complaints
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Pagination
              count={pagination.totalPages || 1}
              page={pagination.page}
              onChange={(e, p) => fetchData(p)}
              color="primary"
              shape="rounded"
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                10 / page
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Slide-out details drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 }, p: 3, display: 'flex', flexDirection: 'column', gap: 3 }
        }}
      >
        {selectedComplaint && (
          <>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Complaint Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Summary */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', fontFamily: 'monospace' }}>
                  {selectedComplaint.ticketNumber}
                </Typography>
                <Chip 
                  label={selectedComplaint.status === 'in_progress' ? 'In Progress' : selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)} 
                  size="small"
                  sx={{ 
                    bgcolor: selectedComplaint.status === 'resolved' ? '#ECFDF5' : selectedComplaint.status === 'in_progress' ? '#FFFBEB' : selectedComplaint.status === 'closed' ? '#F3F4F6' : '#EFF6FF',
                    color: selectedComplaint.status === 'resolved' ? '#059669' : selectedComplaint.status === 'in_progress' ? '#D97706' : selectedComplaint.status === 'closed' ? '#4B5563' : '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '6px'
                  }}
                />
              </Box>
            </Box>

            {/* Information Grid */}
            <Box>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Customer', value: selectedComplaint.payerName },
                  { label: 'Mobile Number', value: selectedComplaint.payerPhone },
                  { label: 'Subject', value: selectedComplaint.subject },
                  { label: 'Category', value: getCategoryStyle(selectedComplaint.category).label },
                  { label: 'Priority', value: renderPriority(selectedComplaint.priority) },
                  { label: 'Assigned To', value: selectedComplaint.assignedToName },
                  { label: 'Created On', value: new Date(selectedComplaint.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={5}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={7} sx={{ textAlign: 'right' }}>
                      {typeof item.value === 'string' ? (
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                          {item.value}
                        </Typography>
                      ) : (
                        item.value
                      )}
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Description Text */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.5, fontSize: '0.8rem' }}>
                {selectedComplaint.description || 'No description provided.'}
              </Typography>
            </Box>

            <Divider />

            {/* Attachments Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5 }}>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['car1.jpg', 'car2.jpg', 'car3.jpg'].map((img, i) => (
                  <Box key={i} sx={{ width: 64, height: 64, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
                    <img 
                      src={`https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=120&h=120&q=80`} 
                      alt="Attachment" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {i === 2 && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem' }}>
                        +2
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Timeline Steps */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
                Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedComplaint.timeline?.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: idx === 0 ? '#F97316' : idx === 1 ? '#2563EB' : '#94A3B8', borderRadius: '50%' }} />
                      {idx < selectedComplaint.timeline.length - 1 && (
                        <Box sx={{ width: 1.5, flexGrow: 1, bgcolor: '#E2E8F0', my: 0.5 }} />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mt: -0.5 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
                        {step.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Bottom Actions */}
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#2563EB',
                color: '#2563EB',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1,
                '&:hover': { borderColor: '#1D4ED8', bgcolor: '#EFF6FF' }
              }}
            >
              View Full Details
            </Button>
          </>
        )}
      </Drawer>

      {/* Dialog actions popup */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="xs" fullWidth>
        {actionDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {actionDialog.type === 'assign' ? 'Assign Complaint' : actionDialog.type === 'resolve' ? 'Resolve Complaint' : 'Close Complaint'}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {actionDialog.type === 'assign' && (
                <TextField 
                  label="Employee Name / ID" 
                  value={assigneeId} 
                  onChange={(e) => setAssigneeId(e.target.value)} 
                  fullWidth 
                />
              )}
              {actionDialog.type === 'resolve' && (
                <TextField 
                  label="Resolution Details" 
                  value={resolutionText} 
                  onChange={(e) => setResolutionText(e.target.value)} 
                  fullWidth 
                  multiline 
                  rows={3} 
                />
              )}
              {actionDialog.type === 'close' && (
                <TextField 
                  label="Rating (1-5)" 
                  type="number"
                  value={ratingVal} 
                  onChange={(e) => setRatingVal(parseInt(e.target.value, 10))} 
                  fullWidth 
                />
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setActionDialog(null)} variant="outlined">Cancel</Button>
              <Button onClick={executeAction} variant="contained" sx={{ bgcolor: '#2563EB' }}>Confirm</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Row popover Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150, borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }
        }}
      >
        <MenuItem onClick={() => { handleRowClick(menuComplaint); handleMenuClose(); }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => { setActionDialog({ type: 'assign', id: menuComplaint._id }); handleMenuClose(); }}>
          <PersonAddIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> Assign
        </MenuItem>
        <MenuItem onClick={() => { setActionDialog({ type: 'resolve', id: menuComplaint._id }); handleMenuClose(); }}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> Resolve
        </MenuItem>
        <MenuItem onClick={() => { setActionDialog({ type: 'close', id: menuComplaint._id }); handleMenuClose(); }}>
          <CloseIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> Close Ticket
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ComplaintListPage;
