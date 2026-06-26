import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InventoryIcon from '@mui/icons-material/Inventory';
import HouseIcon from '@mui/icons-material/House';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import WebIcon from '@mui/icons-material/Web';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { getAssetUrl } from '../services/api';

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Customers', icon: PeopleIcon, path: '/customers' },
  { text: 'Subscriptions', icon: SubscriptionsIcon, path: '/subscriptions' },
  { text: 'Bookings', icon: BookOnlineIcon, path: '/bookings' },
  { text: 'Car Cleaners', icon: BadgeIcon, path: '/cleaners' },
  {
    text: 'Supervisors',
    icon: SupervisorAccountIcon,
    path: '/supervisors',
    children: [
      { text: 'All Supervisors', path: '/supervisors' },
      { text: 'Add Supervisor', path: '/supervisors?action=add' },
      { text: 'Apartment Allocation', path: '/supervisors?tab=apartment-allocation' },
      { text: 'Cleaner Allocation', path: '/supervisors?tab=cleaner-allocation' },
      { text: 'QR Code Stock', path: '/supervisors?tab=qr-stock' },
      { text: 'Work Approvals', path: '/supervisors?tab=work-approvals' },
      { text: 'Performance', path: '/supervisors?tab=performance' },
    ]
  },
  {
    text: 'NCSP Partners',
    icon: HandshakeIcon,
    path: '/ncsp',
    children: [
      { text: 'All NCSP Partners', path: '/ncsp' },
      { text: 'Add Partner', path: '/ncsp?action=add' },
      { text: 'Partner Approvals', path: '/ncsp?tab=approvals' },
      { text: 'Performance', path: '/ncsp?tab=performance' },
      { text: 'Settlement', path: '/ncsp?tab=settlement' },
    ]
  },
  {
    text: 'Franchise Partners',
    icon: StorefrontIcon,
    path: '/franchises',
    children: [
      { text: 'All Franchises', path: '/franchises' },
      { text: 'Add Franchise', path: '/franchises?action=add' },
      { text: 'Franchise Approvals', path: '/franchises?tab=approvals' },
      { text: 'Performance', path: '/franchises?tab=performance' },
      { text: 'Settlements', path: '/franchises?tab=settlements' },
      { text: 'Documents', path: '/franchises?tab=documents' },
    ]
  },
  { text: 'Operations Team', icon: GroupsIcon, path: '/operations-team' },
  {
    text: 'QR Code Management',
    icon: QrCodeIcon,
    path: '/qr',
    children: [
      { text: 'All QR Codes', path: '/qr' },
      { text: 'Generate QR Code', path: '/qr?action=generate' },
      { text: 'Scan History', path: '/qr?tab=history' },
      { text: 'QR Code Settings', path: '/qr?tab=settings' },
    ]
  },
  {
    text: 'Payments & Invoices',
    icon: PaymentsIcon,
    path: '/payments',
    children: [
      { text: 'All Transactions', path: '/payments' },
      { text: 'Invoices', path: '/payments?tab=invoices' },
      { text: 'Payouts', path: '/payments?tab=payouts' },
      { text: 'Refunds', path: '/payments?tab=refunds' },
      { text: 'Payment Methods', path: '/payments?tab=methods' },
      { text: 'Tax Settings', path: '/payments?tab=tax' },
    ]
  },
  {
    text: 'Complaints',
    icon: ReportProblemIcon,
    path: '/complaints',
    children: [
      { text: 'All Complaints', path: '/complaints' },
      { text: 'Assign Complaints', path: '/complaints?tab=assign' },
      { text: 'Complaint Categories', path: '/complaints?tab=categories' },
      { text: 'Complaint Settings', path: '/complaints?tab=settings' },
    ]
  },
  { text: 'Inventory', icon: InventoryIcon, path: '/inventory' },
  { text: 'Apartments', icon: HouseIcon, path: '/apartments' },
  { text: 'Services Management', icon: BuildCircleIcon, path: '/marketplace' },
  {
    text: 'CMS Management',
    icon: WebIcon,
    path: '/cms',
    children: [
      { text: 'Banners',          path: '/cms?tab=banners' },
      { text: 'Blog Posts',       path: '/cms?tab=blogs' },
      { text: 'FAQs',             path: '/cms?tab=faqs' },
      { text: 'Policies',         path: '/cms?tab=policies' },
      { text: 'Contact Requests', path: '/cms?tab=contacts' },
      { text: 'Download Links',   path: '/cms?tab=downloads' },
    ]
  },
  { text: 'Reports', icon: AssessmentIcon, path: '/reports' },
  { text: 'Notifications', icon: NotificationsIcon, path: '/notifications' },
  { text: 'Settings', icon: SettingsIcon, path: '/settings' },
  { text: 'Admin Users', icon: AdminPanelSettingsIcon, path: '/admin-users' },
  { text: 'Audit Logs', icon: SecurityIcon, path: '/audit-logs' },
];

const Sidebar = ({ drawerWidth, mobileOpen, onClose, collapsed, onToggle, logoUrl }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    // Auto expand active parent menus on mount / location change
    const newOpenMenus = { ...openMenus };
    menuItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => {
          if (child.path.includes('?')) {
            const [base, query] = child.path.split('?');
            return location.pathname === base && location.search.includes(query);
          }
          return location.pathname === child.path && !location.search;
        });
        if (isChildActive || location.pathname.startsWith(item.path)) {
          newOpenMenus[item.text] = true;
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location]);

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus(prev => ({ ...prev, [item.text]: !prev[item.text] }));
    } else {
      navigate(item.path);
      onClose?.();
    }
  };

  const isSelected = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const isChildSelected = (childPath) => {
    if (childPath.includes('?')) {
      const [base, query] = childPath.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    return location.pathname === childPath && !location.search;
  };

  // Determine which logo to render
  const resolvedLogoUrl = logoUrl ? getAssetUrl(logoUrl) : '';

  const renderLogo = () => {
    if (resolvedLogoUrl) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0, width: 140, height: 40 }}>
          <img src={resolvedLogoUrl} alt="Logo" style={{ maxWidth: 140, maxHeight: 40, objectFit: 'contain' }} />
        </Box>
      );
    }
    // Default SVG logo
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 42, height: 36 }}>
        <svg width="42" height="34" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
          <g transform="skewX(-12)">
            <path d="M 82,8 C 60,8 40,8 30,8 C 16,8 8,18 8,36 C 8,54 16,64 30,64 L 82,64 C 88,64 92,60 92,52 C 92,44 88,40 82,40 L 44,40" 
                  fill="none" stroke="#2563EB" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 18,47 L 22,38 C 23,36 25,35 27,35 L 45,35 C 47,35 49,36 50,38 L 54,47 L 57,47 C 58,47 59,48 59,49 L 59,54 C 59,55 58,56 57,56 L 15,56 C 14,56 13,55 13,54 L 13,49 C 13,48 14,47 15,47 Z" fill="#ffffff" />
            <circle cx="24" cy="56" r="4.5" fill="#2563EB" />
            <circle cx="48" cy="56" r="4.5" fill="#2563EB" />
            <circle cx="24" cy="56" r="1.5" fill="#ffffff" />
            <circle cx="48" cy="56" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </Box>
    );
  };

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo / Header */}
      <Toolbar sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: collapsed ? 0 : 2,
        minHeight: '64px !important',
      }}>
        {collapsed ? (
          resolvedLogoUrl ? (
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <img src={resolvedLogoUrl} alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </Box>
          ) : (
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: '#2563EB', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 700, fontSize: '1.2rem',
              flexShrink: 0,
            }}>
              G
            </Box>
          )
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {renderLogo()}
              {!resolvedLogoUrl ? (
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 800, color: '#2563EB',
                    fontSize: '1.1rem', lineHeight: 1.2,
                  }}>
                    GoMotarCar
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.65rem' }}>
                    Admin Panel
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.65rem', fontWeight: 600 }}>
                    Admin Panel
                  </Typography>
                </Box>
              )}
            </Box>
            {onToggle && (
              <IconButton onClick={onToggle} size="small" sx={{ color: '#9CA3AF' }}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}
      </Toolbar>

      <Divider />

      {/* Navigation */}
      <List sx={{
        px: 1, py: 1, flex: 1, overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: '4px' },
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = isSelected(item.path) && !item.children;
          const hasChildren = Boolean(item.children);
          const isOpen = Boolean(openMenus[item.text]);

          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => handleMenuClick(item)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: collapsed ? 1.5 : 2,
                    justifyContent: collapsed ? 'center' : 'space-between',
                    '&.Mui-selected': {
                      bgcolor: '#EFF6FF',
                      '&:hover': { bgcolor: '#DBEAFE' },
                      '& .MuiListItemIcon-root': { color: '#2563EB' },
                      '& .MuiListItemText-primary': { color: '#2563EB', fontWeight: 600 },
                    },
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon sx={{
                      minWidth: collapsed ? 0 : 40,
                      color: (selected || (hasChildren && location.pathname.startsWith(item.path))) ? '#2563EB' : '#64748B',
                    }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: (selected || (hasChildren && location.pathname.startsWith(item.path))) ? 600 : 400,
                          color: (selected || (hasChildren && location.pathname.startsWith(item.path))) ? '#2563EB' : '#374151',
                          noWrap: true,
                        }}
                      />
                    )}
                  </Box>
                  {!collapsed && hasChildren && (isOpen ? <ExpandLess sx={{ color: '#64748B' }} fontSize="small" /> : <ExpandMore sx={{ color: '#64748B' }} fontSize="small" />)}
                </ListItemButton>
              </ListItem>

              {hasChildren && !collapsed && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.children.map((child) => {
                      const childSelected = isChildSelected(child.path);
                      return (
                        <ListItemButton
                          key={child.text}
                          selected={childSelected}
                          onClick={() => { navigate(child.path); onClose?.(); }}
                          sx={{
                            borderRadius: 2,
                            minHeight: 36,
                            mb: 0.25,
                            pl: 2,
                            '&.Mui-selected': {
                              bgcolor: 'transparent',
                              '& .MuiListItemText-primary': { color: '#2563EB', fontWeight: 600 },
                            },
                            '&:hover': { bgcolor: '#F8FAFC' },
                          }}
                        >
                          <ListItemText
                            primary={child.text}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                              fontWeight: childSelected ? 600 : 400,
                              color: childSelected ? '#2563EB' : '#475569',
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Bottom branding */}
      {!collapsed && (
        <>
          <Divider />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
              v1.0.0 • GoMotarCar
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s ease',
          },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E5E7EB',
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {content}
      </Drawer>
    </>
  );
};

export default Sidebar;
