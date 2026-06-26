import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CircleIcon from '@mui/icons-material/Circle';

import { format } from 'date-fns';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket.service';
import notificationApi from '../services/notification.service';
import api from '../services/api';

const HEADER_HEIGHT = 64;

const Header = ({ drawerWidth, onMenuClick, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [quickActionAnchor, setQuickActionAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@gomotarcar.com', role: 'super_admin' });

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, MMMM d, yyyy');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name || user.email) {
      setAdminUser({ name: user.name || 'Admin', email: user.email || 'admin@gomotarcar.com', role: user.role || 'super_admin' });
    }
  }, []);

  // Socket connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const socket = connectSocket(token);
      
      socket.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.off('notification:new');
      };
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationApi.list({ limit: 10 });
        if (res?.data) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        }
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await Promise.all(notifications.filter(n => !n.isRead).map(n => 
        notificationApi.markAsRead(n._id)
      ));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark as read');
    }
  }, [notifications]);

  const handleDeleteNotification = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    disconnectSocket();
    window.location.href = '/login';
  };

  const quickActions = [
    { label: 'Add Customer', icon: '👤', path: '/customers', action: 'create-customer' },
    { label: 'Add Cleaner', icon: '🧹', path: '/cleaners', action: 'create-cleaner' },
    { label: 'Add Supervisor', icon: '👔', path: '/supervisors', action: 'create-supervisor' },
    { label: 'Generate QR', icon: '📱', path: '/qr', action: 'generate-qr' },
    { label: 'Create Booking', icon: '📋', path: '/bookings', action: 'create-booking' },
    { label: 'Create Subscription', icon: '📦', path: '/subscriptions', action: 'create-subscription' },
    { label: 'Create Complaint', icon: '⚠️', path: '/complaints', action: 'create-complaint' },
    { label: 'Send Notification', icon: '🔔', path: '/notifications', action: 'send-notification' },
  ];

  const initials = adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${sidebarCollapsed ? 72 : drawerWidth}px)` },
          ml: { lg: `${sidebarCollapsed ? 72 : drawerWidth}px` },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          transition: 'width 0.2s ease, margin-left 0.2s ease',
          height: HEADER_HEIGHT,
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: { xs: 2, md: 3 } }}>
          {/* Menu button for mobile */}
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { lg: 'none' }, mr: 1, color: '#111827' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Left side - Greeting */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
              Welcome back, {adminUser.name.split(' ')[0]}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <CalendarTodayIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                {formattedDate}
              </Typography>
            </Box>
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Quick Action Button */}
            <Tooltip title="Quick Actions">
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => setQuickActionAnchor(e.currentTarget)}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  height: 36,
                  borderRadius: '10px',
                  px: 2,
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Quick Action
              </Button>
            </Tooltip>

            {/* Date selector chip */}
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
              label={format(currentDate, 'MMM d, yyyy')}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: '8px',
                borderColor: '#E5E7EB',
                color: '#374151',
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 32,
                display: { xs: 'none', sm: 'flex' },
              }}
            />

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: '#374151', position: 'relative' }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Admin Profile */}
            <Tooltip title="Admin Profile">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0.5, ml: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#2563EB',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {initials || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Admin Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
            minWidth: 220,
            p: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: '#2563EB', fontSize: '1.2rem', fontWeight: 700, mx: 'auto', mb: 1 }}>
            {initials || 'A'}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{adminUser.name}</Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>{adminUser.email}</Typography>
          <Chip
            label={adminUser.role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            size="small"
            sx={{ mt: 1, bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: '0.65rem', borderRadius: '6px' }}
          />
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }} sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); }} sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, py: 1, color: '#EF4444' }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
      </Menu>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '100vw',
            borderLeft: '1px solid #E5E7EB',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {unreadCount} unread
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllRead} sx={{ color: '#2563EB' }}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setNotifAnchor(null)} sx={{ color: '#9CA3AF' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#6B7280' }}>No notifications yet</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box
                key={notif._id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #F3F4F6',
                  bgcolor: notif.isRead ? 'transparent' : '#EFF6FF',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#F9FAFB' },
                }}
                onClick={async () => {
                  if (!notif.isRead) {
                    try {
                      await notificationApi.markAsRead(notif._id);
                      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                      setUnreadCount(prev => Math.max(0, prev - 1));
                    } catch (err) {}
                  }
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  {!notif.isRead && (
                    <CircleIcon sx={{ fontSize: 8, color: '#2563EB', mt: 1, flexShrink: 0 }} />
                  )}
                  <Box sx={{ flex: 1, ml: !notif.isRead ? 0 : '16px' }}>
                    <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 400 : 600, color: '#111827', fontSize: '0.8125rem' }}>
                      {notif.title || notif.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', mt: 0.25, display: 'block' }}>
                      {notif.body || notif.description || ''}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                      {notif.createdAt ? format(new Date(notif.createdAt), 'MMM d, h:mm a') : ''}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                    sx={{ color: '#D1D5DB', '&:hover': { color: '#EF4444' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => { setNotifAnchor(null); navigate('/notifications'); }}
            sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8rem' }}
          >
            View All Notifications
          </Button>
        </Box>
      </Drawer>

      {/* Quick Action Menu */}
      <Menu
        anchorEl={quickActionAnchor}
        open={Boolean(quickActionAnchor)}
        onClose={() => setQuickActionAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
            minWidth: 240,
            p: 1,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#6B7280', fontWeight: 600, fontSize: '0.75rem' }}>
          QUICK ACTIONS
        </Typography>
        {quickActions.map((action) => (
          <MenuItem
            key={action.action}
            onClick={() => {
              setQuickActionAnchor(null);
              navigate(action.path);
            }}
            sx={{ borderRadius: 2, py: 1.25, gap: 1.5 }}
          >
            <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{action.icon}</Typography>
            <ListItemText primary={action.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Header;
