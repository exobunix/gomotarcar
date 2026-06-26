import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { analyticsApi, subscriptionApi, bookingApi, cleanerApi, paymentApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const COLORS = ['#0D5BD7', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const AnalyticsPage = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [data, setData] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cleanerStats, bookingStats, paymentStats, subStats, cleanerData] = await Promise.allSettled([
        cleanerApi.getStats(),
        bookingApi.getStats(),
        paymentApi.getStats(),
        subscriptionApi.getStats(),
        cleanerApi.list({ limit: 100 }),
      ]);

      setData({
        cleaners: cleanerStats.value?.data,
        bookings: bookingStats.value?.data,
        payments: paymentStats.value?.data,
        subscriptions: subStats.value?.data,
        cleanerList: cleanerData.value?.data || [],
      });
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Chart data derived from stats
  const revenueChartData = [
    { name: 'Subscriptions', value: data.payments?.totalRevenue || 0 },
    { name: 'Bookings', value: (data.bookings?.completed || 0) * 500 },
    { name: 'Refunds', value: data.payments?.totalRefunded || 0 },
  ];

  const taskStatusData = [
    { name: 'Active Cleaners', value: data.cleaners?.activeCleaners || 0 },
    { name: 'Total Cleaners', value: data.cleaners?.totalCleaners || 0 },
    { name: 'Verified', value: data.cleaners?.verified || 0 },
  ];

  const bookingStatusData = [
    { name: 'Active', value: data.bookings?.active || 0 },
    { name: 'Completed', value: data.bookings?.completed || 0 },
    { name: 'Cancelled', value: data.bookings?.cancelled || 0 },
  ];

  const paymentChartData = [
    { month: 'Pending', revenue: data.payments?.totalRevenue || 0 },
    { month: 'Refunded', revenue: -(data.payments?.totalRefunded || 0) },
  ];

  return (
    <Box>
      <PageHeader title="Reports & Analytics" subtitle="Track business performance and key metrics" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid #E5E7EB' }}>
        <Tab label="Overview" />
        <Tab label="Revenue" />
        <Tab label="Cleaners" />
        <Tab label="Bookings" />
      </Tabs>

      {tab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}><StatCard title="Active Cleaners" value={data.cleaners?.activeCleaners} icon="👤" color="#0D5BD7" loading={loading} /></Grid>
            <Grid item xs={12} md={3}><StatCard title="Total Bookings" value={data.bookings?.totalBookings} icon="📋" color="#059669" loading={loading} /></Grid>
            <Grid item xs={12} md={3}><StatCard title="Revenue" value={data.payments?.totalRevenue ? `₹${(data.payments.totalRevenue).toLocaleString()}` : '₹0'} icon="💰" color="#059669" loading={loading} /></Grid>
            <Grid item xs={12} md={3}><StatCard title="Active Subscriptions" value={data.subscriptions?.active} icon="📦" color="#D97706" loading={loading} /></Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Revenue Overview</Typography>
                  {loading ? <Skeleton variant="rectangular" height={250} /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={revenueChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {revenueChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Booking Status</Typography>
                  {loading ? <Skeleton variant="rectangular" height={250} /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={bookingStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0D5BD7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard title="Total Revenue" value={data.payments?.totalRevenue ? `₹${(data.payments.totalRevenue).toLocaleString()}` : '₹0'} icon="💰" color="#059669" loading={loading} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Total Refunded" value={data.payments?.totalRefunded ? `₹${(data.payments.totalRefunded).toLocaleString()}` : '₹0'} icon="↩️" color="#DC2626" loading={loading} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Net Revenue" value={((data.payments?.totalRevenue || 0) - (data.payments?.totalRefunded || 0)) > 0 ? `₹${((data.payments?.totalRevenue || 0) - (data.payments?.totalRefunded || 0)).toLocaleString()}` : '₹0'} icon="📊" color="#0D5BD7" loading={loading} />
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Revenue vs Refunds</Typography>
                {loading ? <Skeleton variant="rectangular" height={300} /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#0D5BD7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}><StatCard title="Total Cleaners" value={data.cleaners?.totalCleaners} icon="👤" color="#0D5BD7" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Active" value={data.cleaners?.activeCleaners} icon="✅" color="#059669" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Verified" value={data.cleaners?.verified} icon="🪪" color="#0D5BD7" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Pending Verification" value={data.cleaners?.pending} icon="⏳" color="#D97706" loading={loading} /></Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Cleaner Distribution</Typography>
                {loading ? <Skeleton variant="rectangular" height={250} /> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {taskStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}><StatCard title="Total Bookings" value={data.bookings?.totalBookings} icon="📋" color="#0D5BD7" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Active" value={data.bookings?.active} icon="🔄" color="#D97706" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Completed" value={data.bookings?.completed} icon="✅" color="#059669" loading={loading} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Cancelled" value={data.bookings?.cancelled} icon="🚫" color="#DC2626" loading={loading} /></Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Booking Distribution</Typography>
                {loading ? <Skeleton variant="rectangular" height={250} /> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={bookingStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0D5BD7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsPage;
