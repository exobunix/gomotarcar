import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { settingsApi, uploadApi, getAssetUrl } from '../../services/api';
import PageHeader from '../../components/PageHeader';

const SETTINGS_GROUPS = [
  { key: 'general', label: 'General', icon: '⚙️' },
  { key: 'business', label: 'Business', icon: '🏢' },
  { key: 'payment', label: 'Payment', icon: '💳' },
  { key: 'notification', label: 'Notification', icon: '🔔' },
  { key: 'sms', label: 'SMS', icon: '📱' },
  { key: 'email', label: 'Email', icon: '📧' },
  { key: 'razorpay', label: 'Razorpay', icon: '💰' },
  { key: 'firebase', label: 'Firebase', icon: '🔥' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'roles', label: 'Roles & Permissions', icon: '👥' },
];

const SettingsPage = () => {
  const outletContext = useOutletContext() || {};
  const { setLogoUrl: syncLogoUrl } = outletContext;

  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localValues, setLocalValues] = useState({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const currentGroup = SETTINGS_GROUPS[tab]?.key;

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAll();
      setSettings(res.data || {});
      // Initialize local values
      const initial = {};
      Object.entries(res.data || {}).forEach(([group, values]) => {
        Object.entries(values).forEach(([key, value]) => {
          initial[`${group}.${key}`] = value;
        });
      });
      setLocalValues(initial);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateField = (fieldKey, value) => {
    setLocalValues(prev => ({ ...prev, [`${currentGroup}.${fieldKey}`]: value }));
  };

  const handleSaveGroup = async () => {
    setSaving(true);
    try {
      const groupSettings = {};
      Object.entries(localValues).forEach(([key, value]) => {
        const [group, ...rest] = key.split('.');
        if (group === currentGroup) {
          groupSettings[rest.join('.')] = value;
        }
      });
      await settingsApi.updateGroup(currentGroup, groupSettings);

      // Sync logo to sidebar if we just saved 'general' group
      if (currentGroup === 'general' && syncLogoUrl) {
        syncLogoUrl(groupSettings.logoUrl || '');
      }

      fetchSettings();
    } catch {} finally { setSaving(false); }
  };

  // --- Logo Upload Handlers ---
  const handleLogoUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res?.data?.url || '';
      if (url) {
        updateField('logoUrl', url);
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleLogoUpload(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    handleLogoUpload(file);
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    updateField('logoUrl', '');
  };

  const renderLogoUploader = () => {
    const currentLogoUrl = localValues['general.logoUrl'] || '';
    const resolvedUrl = currentLogoUrl ? getAssetUrl(currentLogoUrl) : '';

    return (
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
          Brand Logo
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1.5 }}>
          Upload your company logo. This will be displayed on the login page, sidebar, and QR code stickers.
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Preview */}
          {resolvedUrl && (
            <Box sx={{
              width: 120, height: 100, borderRadius: 2,
              border: '2px solid #E5E7EB', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              bgcolor: '#FFFFFF', position: 'relative', overflow: 'hidden',
            }}>
              <img src={resolvedUrl} alt="Current Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <IconButton
                size="small"
                onClick={handleRemoveLogo}
                sx={{
                  position: 'absolute', top: 2, right: 2,
                  bgcolor: 'rgba(239,68,68,0.9)', color: '#FFFFFF',
                  '&:hover': { bgcolor: '#EF4444' },
                  width: 24, height: 24,
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}

          {/* Drop zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              flex: 1, minHeight: 100, borderRadius: 2,
              border: `2px dashed ${dragOver ? '#2563EB' : '#D1D5DB'}`,
              bgcolor: dragOver ? '#EFF6FF' : '#F9FAFB',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' },
            }}
          >
            {uploading ? (
              <CircularProgress size={28} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Click or drag to upload
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  PNG, JPG, SVG • Max 5MB
                </Typography>
              </>
            )}
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </Box>
      </Box>
    );
  };

  const renderField = (key, value) => {
    const fullKey = `${currentGroup}.${key}`;
    const currentVal = localValues[fullKey] !== undefined ? localValues[fullKey] : '';

    // Skip logoUrl in the standard field rendering — we handle it separately
    if (currentGroup === 'general' && key === 'logoUrl') return null;

    if (typeof value === 'boolean') {
      return (
        <FormControlLabel
          control={<Switch checked={!!currentVal} onChange={(e) => updateField(key, e.target.checked)} />}
          label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          sx={{ mb: 1 }}
        />
      );
    }

    if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
      return (
        <TextField
          label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          type="number"
          value={currentVal}
          onChange={(e) => updateField(key, e.target.value)}
          fullWidth
          size="small"
        />
      );
    }

    return (
      <TextField
        label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        value={currentVal}
        onChange={(e) => updateField(key, e.target.value)}
        fullWidth
        size="small"
        multiline={key.includes('address') || key.includes('description')}
        rows={key.includes('address') || key.includes('description') ? 2 : 1}
      />
    );
  };

  const currentSettings = settings[currentGroup] || {};

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Configure application settings" />

      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', minHeight: 500 }}>
            {/* Sidebar tabs */}
            <Box sx={{ width: 220, borderRight: '1px solid #E5E7EB', p: 2, flexShrink: 0 }}>
              <Tabs orientation="vertical" value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { alignItems: 'flex-start', minHeight: 44, textTransform: 'none', fontSize: '0.85rem' } }}>
                {SETTINGS_GROUPS.map((g, i) => (
                  <Tab key={g.key} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><span>{g.icon}</span><span>{g.label}</span></Box>} />
                ))}
              </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {SETTINGS_GROUPS[tab]?.icon} {SETTINGS_GROUPS[tab]?.label} Settings
                </Typography>
                <Button variant="contained" onClick={handleSaveGroup} disabled={saving || loading}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />)}
                </Box>
              ) : Object.keys(currentSettings).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>🔧</Typography>
                  <Typography>No settings configured yet. Add settings via the API or directly in the database.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {/* Render logo uploader at the top for 'general' group */}
                  {currentGroup === 'general' && (
                    <Grid item xs={12}>
                      {renderLogoUploader()}
                    </Grid>
                  )}
                  {Object.entries(currentSettings).map(([key, value]) => {
                    const field = renderField(key, value);
                    if (!field) return null;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        {field}
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
