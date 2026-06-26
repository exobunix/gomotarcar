import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PolicyIcon from '@mui/icons-material/Policy';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import LinkIcon from '@mui/icons-material/Link';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AppleIcon from '@mui/icons-material/Apple';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { cmsApi, getAssetUrl } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';

// ────────────── Helpers ──────────────
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusConfig = {
  pending:   { color: '#D97706', bg: '#FFFBEB', label: 'Pending' },
  open:      { color: '#2563EB', bg: '#EFF6FF', label: 'Open' },
  resolved:  { color: '#059669', bg: '#ECFDF5', label: 'Resolved' },
  closed:    { color: '#6B7280', bg: '#F3F4F6', label: 'Closed' },
  published: { color: '#059669', bg: '#ECFDF5', label: 'Published' },
  draft:     { color: '#D97706', bg: '#FFFBEB', label: 'Draft' },
  active:    { color: '#059669', bg: '#ECFDF5', label: 'Active' },
  inactive:  { color: '#DC2626', bg: '#FEF2F2', label: 'Inactive' },
  new:       { color: '#D97706', bg: '#FFFBEB', label: 'New' },
  read:      { color: '#2563EB', bg: '#EFF6FF', label: 'Read' },
  replied:   { color: '#059669', bg: '#ECFDF5', label: 'Replied' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.72rem', border: `1px solid ${cfg.color}20` }}
    />
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

// ────────────── Tab Panels ──────────────

// ─── Banners ───
const BannersTab = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', linkUrl: '', linkText: '', position: 0, isActive: true, page: 'home' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const fileRef = useRef();

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await cmsApi.getBanners({ page: p });
      const data = res.data || {};
      setBanners(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch { setBanners([]); } finally { setLoading(false); }
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ title: '', subtitle: '', description: '', linkUrl: '', linkText: '', position: 0, isActive: true, page: 'home' }); setImageFile(null); setImagePreview(''); setDialogOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ title: b.title || '', subtitle: b.subtitle || '', description: b.description || '', linkUrl: b.linkUrl || '', linkText: b.linkText || '', position: b.position || 0, isActive: !!b.isActive, page: b.page || 'home' }); setImagePreview(b.imageUrl ? getAssetUrl(b.imageUrl) : ''); setImageFile(null); setDialogOpen(true); };

  const handleImageSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editing) await cmsApi.updateBanner(editing._id, fd);
      else await cmsApi.createBanner(fd);
      setDialogOpen(false);
      setSnack({ open: true, msg: `Banner ${editing ? 'updated' : 'created'} successfully!`, severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, msg: err.message || 'Failed to save banner', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await cmsApi.deleteBanner(id);
      setSnack({ open: true, msg: 'Banner deleted', severity: 'success' });
      setConfirmDialog({ open: false, id: null });
      load();
    } catch { setSnack({ open: true, msg: 'Failed to delete', severity: 'error' }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          🖼️ Banners ({banners.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4395 100%)' } }}>
          Add Banner
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3].map(i => <Grid item xs={12} md={4} key={i}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /></Grid>)}
        </Grid>
      ) : banners.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
          <ImageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">No banners yet</Typography>
          <Typography variant="body2">Create your first banner to display on the app</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {banners.map(b => (
            <Grid item xs={12} sm={6} lg={4} key={b._id}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' } }}>
                {b.imageUrl ? (
                  <CardMedia component="img" height="140" image={getAssetUrl(b.imageUrl)} alt={b.title} sx={{ objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ height: 140, bgcolor: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                    <ImageIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                  </Box>
                )}
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{b.title}</Typography>
                    <StatusBadge status={b.isActive ? 'active' : 'inactive'} />
                  </Box>
                  {b.subtitle && <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>{b.subtitle}</Typography>}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={b.page || 'home'} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#EFF6FF', color: '#2563EB' }} />
                    <Chip label={`Position: ${b.position}`} size="small" sx={{ fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(b)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setConfirmDialog({ open: true, id: b._id })} sx={{ color: '#DC2626', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3, mb: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
          >
            ← Prev
          </Button>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Page {page} of {totalPages} ({total} total)
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
          >
            Next →
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Banner' : 'Create Banner'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Image Upload */}
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{ height: 150, borderRadius: 2, border: '2px dashed #D1D5DB', bgcolor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' } }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>Click to upload banner image</Typography>
                </>
              )}
            </Box>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

            <TextField label="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} fullWidth size="small" />
            <TextField label="Subtitle" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} fullWidth size="small" />
            <TextField label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} fullWidth size="small" multiline rows={2} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Link URL" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={6}><TextField label="Link Text" value={form.linkText} onChange={e => setForm(p => ({ ...p, linkText: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Page</InputLabel>
                  <Select value={form.page} label="Page" onChange={e => setForm(p => ({ ...p, page: e.target.value }))}>
                    {['home', 'booking', 'subscription', 'profile', 'other'].map(pg => <MenuItem key={pg} value={pg}>{pg}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}><TextField label="Position" type="number" value={form.position} onChange={e => setForm(p => ({ ...p, position: Number(e.target.value) }))} fullWidth size="small" /></Grid>
            </Grid>
            <FormControlLabel control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ─── Blogs ───
const BlogsTab = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', author: 'GoMotarCar', category: '', tags: '', isPublished: false, seoTitle: '', seoDescription: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const fileRef = useRef();

  const load = useCallback(async (p = page, cat = categoryFilter) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (cat) params.category = cat;
      const res = await cmsApi.getBlogs(params);
      const data = res.data || {};
      setBlogs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch { setBlogs([]); } finally { setLoading(false); }
  }, [page, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', author: 'GoMotarCar', category: '', tags: '', isPublished: false, seoTitle: '', seoDescription: '' });
    setImageFile(null); setImagePreview(''); setDialogOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ title: b.title || '', slug: b.slug || '', excerpt: b.excerpt || '', content: b.content || '', author: b.author || 'GoMotarCar', category: b.category || '', tags: (b.tags || []).join(', '), isPublished: !!b.isPublished, seoTitle: b.seoTitle || '', seoDescription: b.seoDescription || '' });
    setImagePreview(b.coverImage ? getAssetUrl(b.coverImage) : '');
    setImageFile(null); setDialogOpen(true);
  };

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v));
      if (imageFile) fd.append('image', imageFile);
      if (editing) await cmsApi.updateBlog(editing._id, fd);
      else await cmsApi.createBlog(fd);
      setDialogOpen(false);
      setSnack({ open: true, msg: `Blog ${editing ? 'updated' : 'published'} successfully!`, severity: 'success' });
      load(1, categoryFilter);
    } catch (err) {
      setSnack({ open: true, msg: err.message || 'Failed to save', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await cmsApi.deleteBlog(id);
      setSnack({ open: true, msg: 'Blog deleted', severity: 'success' });
      setConfirmDialog({ open: false, id: null });
      load(1, categoryFilter);
    } catch { setSnack({ open: true, msg: 'Failed to delete', severity: 'error' }); }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  useEffect(() => { load(page, categoryFilter); }, [page]);

  const filtered = blogs.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>📝 Blog Posts ({total})</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={handleSearchChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} /></InputAdornment> }}
            sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={handleCategoryChange}>
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="news">News</MenuItem>
              <MenuItem value="tips">Tips</MenuItem>
              <MenuItem value="updates">Updates</MenuItem>
              <MenuItem value="guide">Guide</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none', whiteSpace: 'nowrap' }}>
            New Post
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
          <ArticleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">{search || categoryFilter ? 'No blogs match your filters' : 'No blog posts yet'}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(b => (
              <Card key={b._id} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {b.coverImage ? (
                    <Box sx={{ width: 80, height: 60, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={getAssetUrl(b.coverImage)} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ) : (
                    <Box sx={{ width: 80, height: 60, borderRadius: 1.5, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArticleIcon sx={{ color: '#9CA3AF' }} />
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {b.category && <Chip label={b.category} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#EFF6FF', color: '#2563EB' }} />}
                      <StatusBadge status={b.isPublished ? 'published' : 'draft'} />
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{fmtDate(b.publishedAt || b.createdAt)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(b)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setConfirmDialog({ open: true, id: b._id })} sx={{ color: '#DC2626', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
              <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => handlePageChange(page - 1)} sx={{ borderRadius: 2, minWidth: 0, px: 2 }}>← Prev</Button>
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>Page {page} of {totalPages} ({total} total)</Typography>
              <Button size="small" variant="outlined" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} sx={{ borderRadius: 2, minWidth: 0, px: 2 }}>Next →</Button>
            </Box>
          )}
        </>
      )}

      {/* Blog Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Blog Post' : 'New Blog Post'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box onClick={() => fileRef.current?.click()} sx={{ height: 160, borderRadius: 2, border: '2px dashed #D1D5DB', bgcolor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' } }}>
              {imagePreview ? <img src={imagePreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.5 }} /><Typography variant="body2" sx={{ color: '#6B7280' }}>Click to upload cover image</Typography></>}
            </Box>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
            <TextField label="Title *" value={form.title} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, title: v, slug: p.slug || autoSlug(v) })); }} fullWidth size="small" />
            <TextField label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} fullWidth size="small" helperText="URL-friendly identifier" />
            <TextField label="Excerpt" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} fullWidth size="small" multiline rows={2} />
            <TextField label="Content *" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} fullWidth size="small" multiline rows={6} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Author" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={6}><TextField label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={12}><TextField label="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={6}><TextField label="SEO Title" value={form.seoTitle} onChange={e => setForm(p => ({ ...p, seoTitle: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={6}><TextField label="SEO Description" value={form.seoDescription} onChange={e => setForm(p => ({ ...p, seoDescription: e.target.value }))} fullWidth size="small" /></Grid>
            </Grid>
            <FormControlLabel control={<Switch checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />} label="Publish immediately" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Update' : 'Publish')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDialog.id)}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ─── FAQs ───
const FAQsTab = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', position: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getFAQs();
      setFaqs(res.data || []);
    } catch { setFaqs([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ question: '', answer: '', category: 'general', position: 0, isActive: true }); setDialogOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category || 'general', position: f.position || 0, isActive: !!f.isActive }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await cmsApi.updateFAQ(editing._id, form);
      else await cmsApi.createFAQ(form);
      setDialogOpen(false);
      setSnack({ open: true, msg: `FAQ ${editing ? 'updated' : 'created'}!`, severity: 'success' });
      load();
    } catch (err) { setSnack({ open: true, msg: err.message || 'Failed', severity: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await cmsApi.deleteFAQ(id);
      setSnack({ open: true, msg: 'FAQ deleted', severity: 'success' });
      setConfirmDialog({ open: false, id: null });
      load();
    } catch { setSnack({ open: true, msg: 'Failed to delete', severity: 'error' }); }
  };

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>❓ FAQs ({faqs.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none' }}>
          Add FAQ
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : faqs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
          <HelpOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">No FAQs yet</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {faqs.map(faq => (
            <Card key={faq._id} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, cursor: 'pointer' }} onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>{faq.question}</Typography>
                      <Chip label={faq.category} size="small" sx={{ fontSize: '0.68rem', bgcolor: '#F3F4F6', height: 20 }} />
                      {!faq.isActive && <StatusBadge status="inactive" />}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); openEdit(faq); }} sx={{ color: '#2563EB' }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setConfirmDialog({ open: true, id: faq._id }); }} sx={{ color: '#DC2626' }}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <IconButton size="small">{expandedFaq === faq._id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}</IconButton>
                  </Box>
                </Box>
                {expandedFaq === faq._id && (
                  <Box sx={{ px: 2, pb: 2, borderTop: '1px solid #F3F4F6' }}>
                    <Typography variant="body2" sx={{ color: '#4B5563', pt: 1.5, lineHeight: 1.7 }}>{faq.answer}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit FAQ' : 'Add FAQ'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Question *" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} fullWidth size="small" />
            <TextField label="Answer *" value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} fullWidth size="small" multiline rows={4} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={form.category} label="Category" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {['general', 'subscription', 'booking', 'payment', 'cleaner', 'app', 'other'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}><TextField label="Position" type="number" value={form.position} onChange={e => setForm(p => ({ ...p, position: Number(e.target.value) }))} fullWidth size="small" /></Grid>
            </Grid>
            <FormControlLabel control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.question || !form.answer}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDialog.id)}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ─── Policies ───
const PoliciesTab = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', type: 'privacy', content: '', summary: '', version: '1.0', isPublished: false });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getPolicies();
      const data = res.data || [];
      setPolicies(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch { setPolicies([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const typeLabel = { privacy: 'Privacy Policy', terms: 'Terms & Conditions', refund: 'Refund Policy', shipping: 'Shipping Policy', cookies: 'Cookie Policy', other: 'Other' };
  const typeColors = { privacy: '#2563EB', terms: '#7C3AED', refund: '#D97706', shipping: '#059669', cookies: '#6B7280', other: '#374151' };

  const openAdd = () => { setEditing(null); setForm({ title: '', slug: '', type: 'privacy', content: '', summary: '', version: '1.0', isPublished: false }); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title, slug: p.slug || '', type: p.type, content: p.content || '', summary: p.summary || '', version: p.version || '1.0', isPublished: !!p.isPublished }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await cmsApi.updatePolicy(editing._id, form);
      else await cmsApi.createPolicy(form);
      setDialogOpen(false);
      setSnack({ open: true, msg: `Policy ${editing ? 'updated' : 'created'}!`, severity: 'success' });
      load();
    } catch (err) { setSnack({ open: true, msg: err.message || 'Failed', severity: 'error' }); }
    finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>📋 Policies ({policies.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none' }}>
          Add Policy
        </Button>
      </Box>

      {loading ? <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /> : policies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
          <PolicyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">No policies yet</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Policy List */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {policies.map(p => (
                <Card key={p._id} onClick={() => setSelected(p)}
                  sx={{ borderRadius: 2, border: `2px solid ${selected?._id === p._id ? typeColors[p.type] || '#6B7280' : '#E5E7EB'}`, boxShadow: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={typeLabel[p.type] || p.type} size="small" sx={{ fontSize: '0.7rem', bgcolor: `${typeColors[p.type]}15`, color: typeColors[p.type] || '#374151', fontWeight: 600 }} />
                      <StatusBadge status={p.isPublished ? 'published' : 'draft'} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{p.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>v{p.version} · Updated {fmtDate(p.updatedAt)}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); openEdit(p); }} sx={{ color: '#2563EB' }}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
          {/* Policy Preview */}
          <Grid item xs={12} md={8}>
            {selected ? (
              <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={typeLabel[selected.type] || selected.type} size="small" sx={{ fontSize: '0.7rem', bgcolor: `${typeColors[selected.type]}15`, color: typeColors[selected.type] || '#374151', fontWeight: 700 }} />
                    <StatusBadge status={selected.isPublished ? 'published' : 'draft'} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>{selected.title}</Typography>
                  {selected.summary && <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontStyle: 'italic' }}>{selected.summary}</Typography>}
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
                    {selected.content || 'No content yet.'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <Typography>Select a policy to preview</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Policy' : 'New Policy'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}><TextField label="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={form.type} label="Type" onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {Object.entries(typeLabel).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}><TextField label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} fullWidth size="small" /></Grid>
              <Grid item xs={4}><TextField label="Version" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} fullWidth size="small" /></Grid>
            </Grid>
            <TextField label="Summary" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} fullWidth size="small" multiline rows={2} />
            <TextField label="Content *" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} fullWidth size="small" multiline rows={8} />
            <FormControlLabel control={<Switch checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />} label="Publish" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title || !form.content}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ─── Contact Requests ───
const statusIcon = { new: <AccessTimeIcon sx={{ fontSize: 16 }} />, read: <VisibilityIcon sx={{ fontSize: 16 }} />, replied: <CheckCircleIcon sx={{ fontSize: 16 }} />, closed: <CancelIcon sx={{ fontSize: 16 }} /> };

const ContactRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const load = useCallback(async (p = page, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (status !== 'all') params.status = status;
      const res = await cmsApi.getContactRequests(params);
      const data = res.data || {};
      setRequests(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch { setRequests([]); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await cmsApi.updateContactRequestStatus(id, status);
      setSnack({ open: true, msg: `Status updated to ${status}`, severity: 'success' });
      if (selected?._id === id) setSelected(p => ({ ...p, status }));
      load();
    } catch { setSnack({ open: true, msg: 'Failed to update status', severity: 'error' }); }
    finally { setUpdating(false); }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>📬 Contact Requests ({total})</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={handleFilterChange}>
              <MenuItem value="all">All Statuses</MenuItem>
              {['new', 'read', 'replied', 'closed'].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          <IconButton onClick={() => load(page, statusFilter)} size="small" sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}><RefreshIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={selected ? 5 : 12}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />)}
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
              <ContactMailIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6">No contact requests</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {requests.map(r => (
                  <Card key={r._id} onClick={() => setSelected(r)} sx={{ borderRadius: 2, border: `2px solid ${selected?._id === r._id ? '#667eea' : '#E5E7EB'}`, boxShadow: 'none', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: '#A5B4FC' } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{r.name || 'Anonymous'}</Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>{r.email}</Typography>
                          <Typography variant="caption" sx={{ color: '#374151', display: 'block', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{r.subject || r.message?.substring(0, 60) + '...'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <StatusBadge status={r.status || 'new'} />
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{fmtDate(r.createdAt)}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => handlePageChange(page - 1)} sx={{ borderRadius: 2, minWidth: 0, px: 2 }}>← Prev</Button>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>Page {page} of {totalPages}</Typography>
                  <Button size="small" variant="outlined" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} sx={{ borderRadius: 2, minWidth: 0, px: 2 }}>Next →</Button>
                </Box>
              )}
            </>
          )}
        </Grid>

        {selected && (
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>{selected.name || 'Anonymous'}</Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>{selected.email}</Typography>
                    {selected.phone && <Typography variant="body2" sx={{ color: '#6B7280' }}>{selected.phone}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <StatusBadge status={selected.status || 'new'} />
                    <IconButton size="small" onClick={() => setSelected(null)}><CloseIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>

                {selected.subject && (
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>{selected.subject}</Typography>
                )}
                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.7, mb: 3, whiteSpace: 'pre-wrap' }}>{selected.message}</Typography>

                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 2 }}>Received: {fmtDate(selected.createdAt)}</Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#374151' }}>Update Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['read', 'replied', 'closed'].map(s => (
                    <Button key={s} size="small" variant={selected.status === s ? 'contained' : 'outlined'} disabled={updating || selected.status === s}
                      onClick={() => handleStatusUpdate(selected._id, s)}
                      startIcon={statusIcon[s]}
                      sx={{ borderRadius: 2, textTransform: 'capitalize', fontSize: '0.78rem',
                        ...(selected.status === s ? { bgcolor: statusConfig[s]?.color, border: 'none' } : {}) }}>
                      {s}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ─── Download Links ───
const DownloadLinksTab = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ platform: 'android', url: '', version: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getDownloadLinks();
      setLinks(res.data || []);
    } catch { setLinks([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ platform: 'android', url: '', version: '', isActive: true }); setDialogOpen(true); };
  const openEdit = (l) => { setEditing(l); setForm({ platform: l.platform, url: l.url || '', version: l.version || '', isActive: !!l.isActive }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await cmsApi.updateDownloadLink(editing._id, form);
      else await cmsApi.createDownloadLink(form);
      setDialogOpen(false);
      setSnack({ open: true, msg: `Download link ${editing ? 'updated' : 'created'}!`, severity: 'success' });
      load();
    } catch (err) { setSnack({ open: true, msg: err.message || 'Failed', severity: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await cmsApi.deleteDownloadLink(id);
      setSnack({ open: true, msg: 'Link deleted', severity: 'success' });
      setConfirmDialog({ open: false, id: null });
      load();
    } catch { setSnack({ open: true, msg: 'Failed to delete', severity: 'error' }); }
  };

  const platformIcon = { android: <PhoneAndroidIcon />, ios: <AppleIcon />, web: <LinkIcon /> };
  const platformColor = { android: '#34A853', ios: '#555', web: '#2563EB' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>📱 Download Links ({links.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none' }}>
          Add Link
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={2}>{[1,2,3].map(i => <Grid item xs={12} md={4} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} /></Grid>)}</Grid>
      ) : links.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
          <GetAppIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">No download links configured</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {links.map(l => (
            <Grid item xs={12} sm={6} md={4} key={l._id}>
              <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${platformColor[l.platform] || '#6B7280'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {React.cloneElement(platformIcon[l.platform] || <GetAppIcon />, { sx: { color: platformColor[l.platform] || '#6B7280', fontSize: 26 } })}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{l.platform}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>v{l.version || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <StatusBadge status={l.isActive ? 'active' : 'inactive'} />
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2, wordBreak: 'break-all', fontSize: '0.72rem' }}>{l.url || 'No URL set'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {l.url && <Tooltip title="Open Link"><IconButton size="small" component="a" href={l.url} target="_blank" sx={{ color: '#6B7280', bgcolor: '#F3F4F6' }}><LinkIcon fontSize="small" /></IconButton></Tooltip>}
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(l)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmDialog({ open: true, id: l._id })} sx={{ color: '#DC2626', bgcolor: '#FEF2F2' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Download Link' : 'Add Download Link'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select value={form.platform} label="Platform" onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                <MenuItem value="android">Android (Play Store)</MenuItem>
                <MenuItem value="ios">iOS (App Store)</MenuItem>
                <MenuItem value="web">Web App</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Store URL *" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} fullWidth size="small" placeholder="https://play.google.com/..." />
            <TextField label="Version" value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} fullWidth size="small" placeholder="e.g. 1.2.3" />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.url}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Download Link"
        message="Are you sure you want to delete this download link? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDialog.id)}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ────────────── Main CMS Page ──────────────
const CMS_TABS = [
  { key: 'banners',  label: 'Banners',          icon: <ImageIcon /> },
  { key: 'blogs',    label: 'Blog Posts',        icon: <ArticleIcon /> },
  { key: 'faqs',     label: 'FAQs',              icon: <HelpOutlineIcon /> },
  { key: 'policies', label: 'Policies',          icon: <PolicyIcon /> },
  { key: 'contacts', label: 'Contact Requests',  icon: <ContactMailIcon /> },
  { key: 'downloads',label: 'Download Links',    icon: <GetAppIcon /> },
];

const CMSPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const TAB_KEYS = ['banners', 'blogs', 'faqs', 'policies', 'contacts', 'downloads'];

  // Read ?tab= from URL and derive index
  const getTabFromSearch = (search) => {
    const q = new URLSearchParams(search);
    const t = q.get('tab');
    const idx = TAB_KEYS.indexOf(t);
    return idx >= 0 ? idx : 0;
  };

  const [tab, setTab] = useState(() => getTabFromSearch(location.search));
  const [stats, setStats] = useState({ banners: 0, blogs: 0, faqs: 0, policies: 0, contacts: 0, downloads: 0 });

  // Sync tab when URL changes (e.g. sidebar child link)
  useEffect(() => {
    setTab(getTabFromSearch(location.search));
  }, [location.search]);

  // Update URL when tab changes via tab-bar click
  const handleTabChange = (_, v) => {
    setTab(v);
    navigate(`/cms?tab=${TAB_KEYS[v]}`, { replace: true });
  };

  // Load overview counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [b, bl, f, p, c, d] = await Promise.allSettled([
          cmsApi.getBanners(),
          cmsApi.getBlogs(),
          cmsApi.getFAQs(),
          cmsApi.getPolicies(),
          cmsApi.getContactRequests(),
          cmsApi.getDownloadLinks(),
        ]);
        setStats({
          banners:   (b.value?.data?.items || b.value?.data || []).length || 0,
          blogs:     (bl.value?.data?.items || bl.value?.data || []).length || 0,
          faqs:      (f.value?.data || []).length || 0,
          policies:  (p.value?.data || []).length || 0,
          contacts:  (c.value?.data?.items || c.value?.data || []).length || 0,
          downloads: (d.value?.data || []).length || 0,
        });
      } catch {}
    };
    fetchStats();
  }, []);


  return (
    <Box>
      <PageHeader
        title="CMS Management"
        subtitle="Manage website content: banners, blogs, FAQs, policies, and more"
      />

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <ImageIcon />,       label: 'Banners',        value: stats.banners,   color: '#7C3AED', bg: '#F5F3FF' },
          { icon: <ArticleIcon />,     label: 'Blog Posts',     value: stats.blogs,     color: '#2563EB', bg: '#EFF6FF' },
          { icon: <HelpOutlineIcon />, label: 'FAQs',           value: stats.faqs,      color: '#D97706', bg: '#FFFBEB' },
          { icon: <PolicyIcon />,      label: 'Policies',       value: stats.policies,  color: '#059669', bg: '#ECFDF5' },
          { icon: <ContactMailIcon />, label: 'Contact Reqs',   value: stats.contacts,  color: '#DC2626', bg: '#FEF2F2' },
          { icon: <GetAppIcon />,      label: 'Download Links', value: stats.downloads, color: '#6B7280', bg: '#F3F4F6' },
        ].map((s, i) => (
          <Grid item xs={6} sm={4} md={2} key={i} onClick={() => handleTabChange(null, i)} sx={{ cursor: 'pointer' }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Main Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        {/* Tab Bar */}
        <Box sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB', px: 2 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#6B7280',
                minHeight: 52,
                gap: 0.5,
                '&.Mui-selected': { color: '#7C3AED' }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#7C3AED',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {CMS_TABS.map((t, i) => (
              <Tab
                key={t.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    {React.cloneElement(t.icon, { sx: { fontSize: 17 } })}
                    <span>{t.label}</span>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tab === 0 && <BannersTab />}
          {tab === 1 && <BlogsTab />}
          {tab === 2 && <FAQsTab />}
          {tab === 3 && <PoliciesTab />}
          {tab === 4 && <ContactRequestsTab />}
          {tab === 5 && <DownloadLinksTab />}
        </Box>
      </Card>
    </Box>
  );
};

export default CMSPage;
