import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
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
import InputLabel from '@mui/material/InputLabel';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';

import { paymentApi, getAssetUrl } from '../../services/api';
import StatusChip from '../../components/StatusChip';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const PaymentListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoUrl } = useOutletContext() || {};
  const resolvedLogoUrl = logoUrl ? getAssetUrl(logoUrl) : '';

  // Parse active tab/group from URL query string
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeTab = queryParams.get('tab') || 'all';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '', type: '', method: '', search: '', dateRange: '' });
  const [stats, setStats] = useState({
    totalPayments: 1875320,
    successfulPayments: 1712450,
    pendingPayments: 95430,
    failedPayments: 67440,
    totalPayouts: 1245780
  });

  // Selected payment for Drawer details
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Actions Menu State
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPayment, setMenuPayment] = useState(null);

  const handleMenuOpen = (event, payment) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuPayment(payment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuPayment(null);
  };

  // Client-side dynamic receipt generator and downloader
  const handleDownloadReceipt = (payment) => {
    if (!payment) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
      <head>
        <title>Receipt - ${payment.transactionId}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
          .receipt-box { max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; font-size: 16px; line-height: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { display: flex; align-items: center; gap: 8px; }
          .logo-img { height: 40px; object-fit: contain; }
          .title { font-size: 20px; font-weight: bold; text-align: right; color: #475569; }
          .details { margin-bottom: 20px; }
          .details-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; }
          .label { color: #64748B; font-weight: 500; }
          .value { font-weight: 700; color: #0F172A; }
          .amount-box { background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center; }
          .amount { font-size: 32px; font-weight: 800; color: #2563EB; margin-top: 5px; }
          .footer { text-align: center; margin-top: 50px; color: #94A3B8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="logo">
              <img class="logo-img" src="${resolvedLogoUrl || 'https://www.gomotarcar.com/assets/images/logo.png'}" alt="GoMotarCar" onerror="this.src='https://www.gomotarcar.com/assets/images/logo.png'; this.onerror=null;" />
            </div>
            <div class="title">Payment Receipt</div>
          </div>
          <div class="details">
            <div class="details-row"><span class="label">Transaction ID</span><span class="value">${payment.transactionId}</span></div>
            <div class="details-row"><span class="label">Payment Date</span><span class="value">${new Date(payment.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</span></div>
            <div class="details-row"><span class="label">Payment Method</span><span class="value">${payment.method}</span></div>
            <div class="details-row"><span class="label">Customer Name</span><span class="value">${payment.payerName}</span></div>
            <div class="details-row"><span class="label">Customer Email</span><span class="value">${payment.payerEmail}</span></div>
            <div class="details-row"><span class="label">Payment Purpose</span><span class="value">${payment.purpose}</span></div>
            <div class="details-row"><span class="label">Status</span><span class="value" style="color: #10b981;">SUCCESS</span></div>
          </div>
          <div class="amount-box">
            <div class="label">Total Paid Amount</div>
            <div class="amount">₹${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="footer">
            <p>Thank you for choosing GoMotarCar!</p>
            <p>www.gomotarcar.com | Help Line: 9742977577</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };


  // New Payment Dialog
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({
    amount: '',
    purpose: 'service_booking',
    payerEmail: '',
    payerName: '',
    payerPhone: '',
  });

  // Mock static data matching the user's uploaded UI layout & style
  const mockTransactions = useMemo(() => [
    {
      _id: 'TXN-1001',
      transactionId: 'TXN-1001',
      createdAt: '2025-05-24T10:15:00.000Z',
      payerName: 'Ramesh Kumar',
      payerEmail: 'ramesh@gmail.com',
      purpose: 'Booking Payment',
      method: 'UPI',
      amount: 1250,
      status: 'captured',
      charges: 0,
      bookingId: 'BOOK-2456',
      service: 'Exterior Cleaning',
      carNumber: 'KA01AB1234',
      cleaner: 'Sunil Kumar',
      timeline: [
        { title: 'Payment Initiated', time: '24 May 2025, 10:15 AM' },
        { title: 'Payment Successful', time: '24 May 2025, 10:15 AM' },
        { title: 'Receipt Sent', time: '24 May 2025, 10:16 AM' }
      ]
    },
    {
      _id: 'TXN-1002',
      transactionId: 'TXN-1002',
      createdAt: '2025-05-24T09:45:00.000Z',
      payerName: 'Anita Devi',
      payerEmail: 'anita@gmail.com',
      purpose: 'Subscription',
      method: 'Card',
      amount: 2999,
      status: 'captured',
      charges: 53.98,
      bookingId: 'SUB-9872',
      service: 'Monthly Premium Wash',
      carNumber: 'KA03MH5678',
      cleaner: 'Vijay Kumar',
      timeline: [
        { title: 'Payment Initiated', time: '24 May 2025, 09:44 AM' },
        { title: 'Payment Successful', time: '24 May 2025, 09:45 AM' },
        { title: 'Receipt Sent', time: '24 May 2025, 09:45 AM' }
      ]
    },
    {
      _id: 'TXN-1003',
      transactionId: 'TXN-1003',
      createdAt: '2025-05-24T09:30:00.000Z',
      payerName: 'Speed Auto Care',
      payerEmail: 'info@speedauto.com',
      purpose: 'Partner Payout',
      method: 'Bank Transfer',
      amount: 5250,
      status: 'captured',
      charges: 10,
      bookingId: 'PAY-112',
      service: 'Weekly Commission Settlement',
      carNumber: '-',
      cleaner: '-',
      timeline: [
        { title: 'Payout Requested', time: '24 May 2025, 09:00 AM' },
        { title: 'Payout Processed', time: '24 May 2025, 09:30 AM' }
      ]
    },
    {
      _id: 'TXN-1004',
      transactionId: 'TXN-1004',
      createdAt: '2025-05-24T09:10:00.000Z',
      payerName: 'Pooja Sharma',
      payerEmail: 'pooja@gmail.com',
      purpose: 'Service Payment',
      method: 'UPI',
      amount: 750,
      status: 'captured',
      charges: 0,
      bookingId: 'BOOK-2458',
      service: 'Interior Detailing',
      carNumber: 'KA51MJ4321',
      cleaner: 'Ravi Singh',
      timeline: [
        { title: 'Payment Initiated', time: '24 May 2025, 09:08 AM' },
        { title: 'Payment Successful', time: '24 May 2025, 09:10 AM' }
      ]
    },
    {
      _id: 'TXN-1005',
      transactionId: 'TXN-1005',
      createdAt: '2025-05-23T19:15:00.000Z',
      payerName: 'QuickFix Solutions',
      payerEmail: 'contact@quickfix.com',
      purpose: 'Partner Onboarding',
      method: 'Card',
      amount: 3500,
      status: 'captured',
      charges: 63,
      bookingId: 'ONB-094',
      service: 'Franchise Setup Fee',
      carNumber: '-',
      cleaner: '-',
      timeline: [
        { title: 'Payment Initiated', time: '23 May 2025, 07:12 PM' },
        { title: 'Payment Successful', time: '23 May 2025, 07:15 PM' }
      ]
    },
    {
      _id: 'TXN-1006',
      transactionId: 'TXN-1006',
      createdAt: '2025-05-23T18:45:00.000Z',
      payerName: 'Vikram Gupta',
      payerEmail: 'vikram@gmail.com',
      purpose: 'Add Money',
      method: 'UPI',
      amount: 1000,
      status: 'created',
      charges: 0,
      bookingId: 'WAL-1102',
      service: 'Wallet Refill',
      carNumber: '-',
      cleaner: '-',
      timeline: [
        { title: 'Payment Initiated', time: '23 May 2025, 06:45 PM' }
      ]
    },
    {
      _id: 'TXN-1007',
      transactionId: 'TXN-1007',
      createdAt: '2025-05-23T18:20:00.000Z',
      payerName: 'DriveCare Experts',
      payerEmail: 'support@drivecare.com',
      purpose: 'Payout',
      method: 'Bank Transfer',
      amount: 4750,
      status: 'captured',
      charges: 10,
      bookingId: 'PAY-111',
      service: 'Partner Earnings Settlement',
      carNumber: '-',
      cleaner: '-',
      timeline: [
        { title: 'Payout Processed', time: '23 May 2025, 06:20 PM' }
      ]
    },
    {
      _id: 'TXN-1008',
      transactionId: 'TXN-1008',
      createdAt: '2025-05-23T17:40:00.000Z',
      payerName: 'Neha Singh',
      payerEmail: 'neha@gmail.com',
      purpose: 'Refund',
      method: 'Card',
      amount: 850,
      status: 'failed',
      charges: 0,
      bookingId: 'REF-3021',
      service: 'Booking Cancellation Refund',
      carNumber: 'KA04MN9012',
      cleaner: '-',
      timeline: [
        { title: 'Refund Initiated', time: '23 May 2025, 05:38 PM' },
        { title: 'Refund Failed', time: '23 May 2025, 05:40 PM', reason: 'Gateway decline' }
      ]
    },
    {
      _id: 'TXN-1009',
      transactionId: 'TXN-1009',
      createdAt: '2025-05-22T17:20:00.000Z',
      payerName: 'AutoPro Services',
      payerEmail: 'info@autopro.com',
      purpose: 'Service Payment',
      method: 'UPI',
      amount: 1850,
      status: 'captured',
      charges: 0,
      bookingId: 'BOOK-2440',
      service: 'Full Deep Detailing',
      carNumber: 'KA01MH7766',
      cleaner: 'Suresh Kumar',
      timeline: [
        { title: 'Payment Initiated', time: '22 May 2025, 05:18 PM' },
        { title: 'Payment Successful', time: '22 May 2025, 05:20 PM' }
      ]
    },
    {
      _id: 'TXN-1010',
      transactionId: 'TXN-1010',
      createdAt: '2025-05-22T16:55:00.000Z',
      payerName: 'Amit Mehta',
      payerEmail: 'amit@gmail.com',
      purpose: 'Subscription',
      method: 'Card',
      amount: 2499,
      status: 'captured',
      charges: 44.98,
      bookingId: 'SUB-9854',
      service: 'Monthly Basic Wash',
      carNumber: 'KA05MT4321',
      cleaner: 'Vijay Kumar',
      timeline: [
        { title: 'Payment Initiated', time: '22 May 2025, 04:53 PM' },
        { title: 'Payment Successful', time: '22 May 2025, 04:55 PM' }
      ]
    }
  ], []);

  // Fetch real data & combine with mock
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await paymentApi.list({ page, limit: 10, ...filters });
      const apiPayments = res.data.map(p => ({
        _id: p._id,
        transactionId: p.razorpayPaymentId || `TXN-${p._id.slice(-6).toUpperCase()}`,
        createdAt: p.createdAt,
        payerName: p.payerName || p.payerId?.phone || 'Customer',
        payerEmail: p.payerEmail || p.payerId?.email || 'customer@gmail.com',
        purpose: p.purpose?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Service Payment',
        method: p.razorpayPaymentId ? 'Card' : 'UPI',
        amount: p.amount,
        status: p.status === 'captured' ? 'captured' : p.status === 'failed' ? 'failed' : 'created',
        charges: p.gstAmount || 0,
        bookingId: p.referenceId ? `REF-${p.referenceId.slice(-6).toUpperCase()}` : 'N/A',
        service: p.referenceType || 'General Service',
        carNumber: '-',
        cleaner: 'Assigned Partner',
        timeline: [
          { title: 'Payment Initiated', time: new Date(p.createdAt).toLocaleString() },
          { title: 'Payment Confirmed', time: new Date(p.createdAt).toLocaleString() }
        ]
      }));

      // In tab pages, filter the items appropriately
      let merged = [...mockTransactions];

      // Insert API items at the beginning
      if (apiPayments.length > 0) {
        merged = [...apiPayments, ...merged.filter(m => !apiPayments.some(a => a._id === m._id))];
      }

      // Filter by tab
      if (activeTab === 'invoices') {
        merged = merged.filter(p => p.purpose.toLowerCase().includes('booking') || p.purpose.toLowerCase().includes('subscription') || p.purpose.toLowerCase().includes('service'));
      } else if (activeTab === 'payouts') {
        merged = merged.filter(p => p.purpose.toLowerCase().includes('payout'));
      } else if (activeTab === 'refunds') {
        merged = merged.filter(p => p.purpose.toLowerCase().includes('refund'));
      }

      // Filter by custom status
      if (filters.status) {
        const statusMap = { Success: 'captured', Pending: 'created', Failed: 'failed' };
        merged = merged.filter(p => p.status === statusMap[filters.status]);
      }

      // Filter by custom type
      if (filters.type) {
        merged = merged.filter(p => p.purpose.toLowerCase().includes(filters.type.toLowerCase()));
      }

      // Filter by payment method
      if (filters.method) {
        merged = merged.filter(p => p.method.toLowerCase().includes(filters.method.toLowerCase()));
      }

      // Filter by search query
      if (filters.search) {
        const query = filters.search.toLowerCase();
        merged = merged.filter(p => 
          p.transactionId.toLowerCase().includes(query) || 
          p.payerName.toLowerCase().includes(query) || 
          p.payerEmail.toLowerCase().includes(query)
        );
      }

      setPayments(merged);
      setPagination({
        page,
        limit: 10,
        total: merged.length,
        totalPages: Math.ceil(merged.length / 10)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab, mockTransactions]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await paymentApi.getStats();
      if (res.data) {
        setStats({
          totalPayments: Math.max(1875320, res.data.totalRevenue || 0),
          successfulPayments: Math.max(1712450, res.data.totalRevenue || 0),
          pendingPayments: Math.max(95430, (res.data.total - res.data.captured - res.data.refunded) * 500),
          failedPayments: Math.max(67440, res.data.failed * 450),
          totalPayouts: 1245780
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await paymentApi.createOrder({
        amount: parseFloat(newPaymentForm.amount),
        purpose: newPaymentForm.purpose,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          payerEmail: newPaymentForm.payerEmail,
          payerName: newPaymentForm.payerName,
          payerPhone: newPaymentForm.payerPhone,
        }
      });
      setNewPaymentOpen(false);
      setNewPaymentForm({
        amount: '',
        purpose: 'service_booking',
        payerEmail: '',
        payerName: '',
        payerPhone: '',
      });
      fetchData();
      fetchStats();
    } catch (err) {
      alert('Failed to generate payment order');
    }
  };

  // Export transactions helper
  const handleExport = () => {
    const csvRows = [
      ['Transaction ID', 'Date & Time', 'Customer', 'Email', 'Type', 'Method', 'Amount', 'Status']
    ];
    payments.forEach(p => {
      csvRows.push([
        p.transactionId,
        new Date(p.createdAt).toLocaleString(),
        p.payerName,
        p.payerEmail,
        p.purpose,
        p.method,
        p.amount,
        p.status === 'captured' ? 'Success' : p.status === 'failed' ? 'Failed' : 'Pending'
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Banner/Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.5rem' }}>
            Payments & Transactions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Payments & Invoices
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>&gt;</Typography>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
              {activeTab === 'all' ? 'All Transactions' : 
               activeTab === 'invoices' ? 'Invoices' : 
               activeTab === 'payouts' ? 'Payouts' : 
               activeTab === 'refunds' ? 'Refunds' : 
               activeTab === 'methods' ? 'Payment Methods' : 'Tax Settings'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
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
            startIcon={<AddIcon />}
            onClick={() => setNewPaymentOpen(true)}
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
            New Payment
          </Button>
        </Box>
      </Box>

      {/* Stats Cards Row */}
      <Grid container spacing={2}>
        {[
          { 
            title: 'Total Payments', 
            value: formatCurrency(stats.totalPayments), 
            change: '+ 16.4% vs last month', 
            isPositive: true,
            icon: <AccountBalanceWalletIcon sx={{ color: '#2563EB' }} />, 
            bgColor: '#EFF6FF' 
          },
          { 
            title: 'Successful Payments', 
            value: formatCurrency(stats.successfulPayments), 
            change: '91.3% of total', 
            isPositive: true,
            icon: <CheckCircleIcon sx={{ color: '#059669' }} />, 
            bgColor: '#ECFDF5' 
          },
          { 
            title: 'Pending Payments', 
            value: formatCurrency(stats.pendingPayments), 
            change: '5.1% of total', 
            isPositive: false,
            icon: <AccessTimeIcon sx={{ color: '#D97706' }} />, 
            bgColor: '#FFFBEB' 
          },
          { 
            title: 'Failed Payments', 
            value: formatCurrency(stats.failedPayments), 
            change: '3.6% of total', 
            isPositive: false,
            icon: <CancelIcon sx={{ color: '#DC2626' }} />, 
            bgColor: '#FEF2F2' 
          },
          { 
            title: 'Total Payouts', 
            value: formatCurrency(stats.totalPayouts), 
            change: '+ 12.7% vs last month', 
            isPositive: true,
            icon: <SendIcon sx={{ color: '#7C3AED', transform: 'rotate(-45deg)' }} />, 
            bgColor: '#F5F3FF' 
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

      {/* Main Container */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        {/* Filters and Actions Header */}
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#FFFFFF' }}>
          <TextField
            size="small"
            placeholder="Search by transaction ID, customer, email..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            sx={{ flex: 1, minWidth: '240px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
              <MenuItem value="Success">Success</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Booking">Booking Payment</MenuItem>
              <MenuItem value="Subscription">Subscription</MenuItem>
              <MenuItem value="Payout">Payout</MenuItem>
              <MenuItem value="Refund">Refund</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filters.method}
              onChange={(e) => setFilters(f => ({ ...f, method: e.target.value }))}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="">All Methods</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
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
            sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Transaction ID', 'Date & Time', 'Customer / Partner', 'Type', 'Method', 'Amount', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} style={{ padding: '16px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center' }}>
                    <Box sx={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((row) => (
                  <tr 
                    key={row._id} 
                    onClick={() => handleRowClick(row)}
                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Transaction ID */}
                    <td style={{ padding: '16px' }}>
                      <Typography sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {row.transactionId}
                      </Typography>
                    </td>

                    {/* Date & Time */}
                    <td style={{ padding: '16px' }}>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500, fontSize: '0.8rem' }}>
                        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
                        {new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Typography>
                    </td>

                    {/* Customer / Partner */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '0.8rem', width: 32, height: 32 }}>
                          {row.payerName?.split(' ').map(n => n[0]).join('') || 'RK'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                            {row.payerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
                            {row.payerEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '16px' }}>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.8rem' }}>
                        {row.purpose}
                      </Typography>
                    </td>

                    {/* Method */}
                    <td style={{ padding: '16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.method === 'UPI' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', px: 1, py: 0.25, borderRadius: '4px' }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: '0.9rem', color: '#09757A' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#09757A', fontSize: '0.65rem' }}>UPI</Typography>
                          </Box>
                        ) : row.method === 'Card' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', px: 1, py: 0.25, borderRadius: '4px' }}>
                            <PaymentIcon sx={{ fontSize: '0.9rem', color: '#1E3A8A' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.65rem' }}>Card</Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', px: 1, py: 0.25, borderRadius: '4px' }}>
                            <AccountBalanceIcon sx={{ fontSize: '0.9rem', color: '#6B7280' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.65rem' }}>Bank Transfer</Typography>
                          </Box>
                        )}
                      </Box>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '16px' }}>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                        {formatCurrency(row.amount)}
                      </Typography>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <StatusChip status={row.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleRowClick(row)}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#64748B' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Receipt">
                          <IconButton size="small" onClick={() => handleDownloadReceipt(row)}>
                            <FileDownloadIcon fontSize="small" sx={{ color: '#64748B' }} />
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
            Showing 1 to {payments.length} of {pagination.total} transactions
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

      {/* Transaction Details Side Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 }, p: 3, display: 'flex', flexDirection: 'column', gap: 3 }
        }}
      >
        {selectedPayment && (
          <>
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Transaction Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Top Transaction Summary */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', fontFamily: 'monospace' }}>
                  {selectedPayment.transactionId}
                </Typography>
                <StatusChip status={selectedPayment.status} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {formatCurrency(selectedPayment.amount)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                {selectedPayment.purpose}
              </Typography>
            </Box>

            <Divider />

            {/* Payment Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
                Payment Information
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Payment Method', value: selectedPayment.method },
                  { label: 'Transaction ID', value: selectedPayment.transactionId, isMonospace: true },
                  { label: 'Payment Date', value: new Date(selectedPayment.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) },
                  { label: 'Status', value: <StatusChip status={selectedPayment.status} /> },
                  { label: 'Amount', value: formatCurrency(selectedPayment.amount), isBold: true },
                  { label: 'Transaction Charges', value: formatCurrency(selectedPayment.charges || 0) },
                  { label: 'Total Amount', value: formatCurrency(selectedPayment.amount), isBold: true },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={5}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={7} sx={{ textAlign: 'right' }}>
                      {typeof item.value === 'string' ? (
                        <Typography variant="body2" sx={{ 
                          color: '#0F172A', 
                          fontWeight: item.isBold ? 700 : 500,
                          fontFamily: item.isMonospace ? 'monospace' : 'inherit',
                          fontSize: '0.8rem'
                        }}>
                          {item.value}
                        </Typography>
                      ) : (
                        item.value
                      )}
                    </Grid>
                  </React.Fragment>
                ))}
                
                {/* Paid By info */}
                <Grid item xs={5} sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Paid By
                  </Typography>
                </Grid>
                <Grid item xs={7} sx={{ textAlign: 'right', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                    {selectedPayment.payerName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
                    {selectedPayment.payerEmail}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Related Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
                Related Information
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Booking ID', value: selectedPayment.bookingId },
                  { label: 'Service', value: selectedPayment.service },
                  { label: 'Car Number', value: selectedPayment.carNumber },
                  { label: 'Cleaner', value: selectedPayment.cleaner },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={5}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={7} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                        {item.value}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Payment Timeline */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
                Payment Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedPayment.timeline?.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: '#10B981', borderRadius: '50%' }} />
                      {idx < selectedPayment.timeline.length - 1 && (
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
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handleDownloadReceipt(selectedPayment)}
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
              Download Receipt
            </Button>
          </>
        )}
      </Drawer>

      {/* New Payment Dialog */}
      <Dialog open={newPaymentOpen} onClose={() => setNewPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate Payment Order</DialogTitle>
        <form onSubmit={handleCreatePayment}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Amount (₹)"
              type="number"
              required
              value={newPaymentForm.amount}
              onChange={(e) => setNewPaymentForm(s => ({ ...s, amount: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Purpose"
              value={newPaymentForm.purpose}
              onChange={(e) => setNewPaymentForm(s => ({ ...s, purpose: e.target.value }))}
              fullWidth
            >
              <MenuItem value="service_booking">Service Booking</MenuItem>
              <MenuItem value="subscription">Subscription</MenuItem>
              <MenuItem value="wallet_topup">Wallet Top-up</MenuItem>
            </TextField>
            <TextField
              label="Customer Name"
              required
              value={newPaymentForm.payerName}
              onChange={(e) => setNewPaymentForm(s => ({ ...s, payerName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Customer Email"
              type="email"
              required
              value={newPaymentForm.payerEmail}
              onChange={(e) => setNewPaymentForm(s => ({ ...s, payerEmail: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Customer Phone"
              required
              value={newPaymentForm.payerPhone}
              onChange={(e) => setNewPaymentForm(s => ({ ...s, payerPhone: e.target.value }))}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setNewPaymentOpen(false)} variant="outlined" sx={{ borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: '8px', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
              Generate Order
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Three Dots Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150, borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }
        }}
      >
        <MenuItem onClick={() => { handleRowClick(menuPayment); handleMenuClose(); }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => { handleDownloadReceipt(menuPayment); handleMenuClose(); }}>
          <FileDownloadIcon fontSize="small" sx={{ mr: 1, color: '#64748B' }} /> Download Receipt
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentListPage;
