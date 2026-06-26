import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import Header from './Header';
import { settingsApi } from '../services/api';

const DRAWER_WIDTH = 270;
const DRAWER_COLLAPSED = 72;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [logoUrl, setLogoUrl] = useState('');

  const effectiveWidth = sidebarCollapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  // Fetch public logo on mount
  useEffect(() => {
    settingsApi.getPublicSettings()
      .then(res => {
        const url = res?.data?.logoUrl || '';
        setLogoUrl(url);
      })
      .catch(() => {}); // Silently ignore errors
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', next);
      return next;
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header
        drawerWidth={DRAWER_WIDTH}
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setMobileOpen(!mobileOpen)}
      />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        onClose={() => setMobileOpen(false)}
        logoUrl={logoUrl}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: '64px',
          ml: { lg: `${effectiveWidth}px` },
          width: { lg: `calc(100% - ${effectiveWidth}px)` },
          transition: 'margin-left 0.2s ease, width 0.2s ease',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet context={{ logoUrl, setLogoUrl }} />
      </Box>
    </Box>
  );
};

export default AdminLayout;
