import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api, { settingsApi, getAssetUrl } from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('+919000000000');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Fetch public logo on mount
  useEffect(() => {
    settingsApi.getPublicSettings()
      .then(res => {
        const url = res?.data?.logoUrl || '';
        setLogoUrl(url);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { phone, password });
      // response is already unwrapped by api interceptor: { success, data: { user, tokens: { accessToken, refreshToken } } }
      const result = response?.data || response;
      const accessToken = result?.tokens?.accessToken || result?.accessToken;
      const refreshToken = result?.tokens?.refreshToken || result?.refreshToken || '';
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(result.user || result.admin || {}));
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid response from server. Expected tokens not found.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const resolvedLogoUrl = logoUrl ? getAssetUrl(logoUrl) : '';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#F8FAFC',
      p: 2,
    }}>
      <Card sx={{
        maxWidth: 420,
        width: '100%',
        borderRadius: 4,
        border: '1px solid #E5E7EB',
        boxShadow: '0px 20px 60px rgba(0,0,0,0.08)',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, width: 64, height: 56 }}>
              {resolvedLogoUrl ? (
                <img src={resolvedLogoUrl} alt="Logo" style={{ maxWidth: 64, maxHeight: 56, objectFit: 'contain' }} />
              ) : (
                <svg width="64" height="52" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
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
              )}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
              GoMotarCar Admin
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Sign in to your admin account
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919000000000"
              size="medium"
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: '#FFFFFF' },
              }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              size="medium"
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: '#FFFFFF' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                height: 48,
                borderRadius: 2,
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                '&:hover': { bgcolor: '#1D4ED8' },
                '&.Mui-disabled': { bgcolor: '#93C5FD', color: '#FFFFFF' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Sign In'}
            </Button>
          </Box>

          {/* Demo credentials hint */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #DBEAFE' }}>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
              Phone: +919000000000
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
              Password: admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
