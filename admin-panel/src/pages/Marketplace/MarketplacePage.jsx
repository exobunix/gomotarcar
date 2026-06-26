import React, { useState, useEffect, useCallback } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { marketplaceApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';

const MarketplacePage = () => {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [formDialog, setFormDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await marketplaceApi.listCategories({ page, limit: 20, search });
      setCategories(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [search]);

  const fetchProviders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await marketplaceApi.listProviders({ page, limit: 20, search });
      setProviders(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [search]);

  const fetchStats = useCallback(async () => {
    try { const res = await marketplaceApi.getStats(); setStats(res.data); } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (tab === 0) fetchCategories(); else fetchProviders(); }, [tab, fetchCategories, fetchProviders]);

  const handleSave = async () => {
    if (!formDialog) return;
    setSaving(true);
    try {
      if (formDialog.type === 'category') {
        if (formDialog.mode === 'add') await marketplaceApi.createCategory(formDialog.data);
        else await marketplaceApi.updateCategory(formDialog.data._id, formDialog.data);
      } else {
        if (formDialog.mode === 'add') await marketplaceApi.createProvider(formDialog.data);
        else await marketplaceApi.updateProvider(formDialog.data._id, formDialog.data);
      }
      setFormDialog(null);
      if (formDialog.type === 'category') fetchCategories(); else fetchProviders();
      fetchStats();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget._type === 'category') await marketplaceApi.deleteCategory(deleteTarget._id);
      else await marketplaceApi.deleteProvider(deleteTarget._id);
      setDeleteTarget(null);
      if (deleteTarget._type === 'category') fetchCategories(); else fetchProviders();
      fetchStats();
    } catch {}
  };

  const categoryColumns = [
    { key: 'name', label: 'Category', render: (v) => <Box sx={{ fontWeight: 600 }}>{v}</Box> },
    { key: 'slug', label: 'Slug', render: (v) => <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v}</Box> },
    { key: 'isPopular', label: 'Popular', render: (v) => <StatusChip status={v ? 'yes' : 'no'} /> },
    { key: 'sortOrder', label: 'Order', render: (v) => v || 0 },
    { key: 'isActive', label: 'Status', render: (v) => <StatusChip status={v ? 'active' : 'inactive'} /> },
  ];

  const providerColumns = [
    { key: 'name', label: 'Provider', render: (v) => <Box sx={{ fontWeight: 600 }}>{v}</Box> },
    { key: 'ownerName', label: 'Owner', render: (v) => v || '-' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'City', render: (v) => v?.city || '-' },
    { key: 'averageRating', label: 'Rating', render: (v) => v ? `${v.toFixed(1)} ⭐` : '-' },
    { key: 'totalBookings', label: 'Bookings', render: (v) => v || 0 },
    { key: 'verified', label: 'Verified', render: (v) => <StatusChip status={v ? 'verified' : 'pending'} /> },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', type: tab === 0 ? 'category' : 'provider', data: { ...row } })}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget({ ...row, _type: tab === 0 ? 'category' : 'provider' })}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Marketplace" subtitle="Manage service categories and providers" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Categories', value: stats?.totalCategories, icon: '📂', color: '#0D5BD7' },
          { title: 'Providers', value: stats?.totalProviders, icon: '🏪', color: '#059669' },
          { title: 'Active Providers', value: stats?.activeProviders, icon: '✅', color: '#059669' },
          { title: 'Total Bookings', value: stats?.totalBookings, icon: '📋', color: '#D97706' },
        ].map((s) => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} loading={!stats} /></Grid>)}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<CategoryIcon />} label="Categories" iconPosition="start" />
          <Tab icon={<StoreIcon />} label="Providers" iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${tab === 0 ? 'categories' : 'providers'}...`} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormDialog({ mode: 'add', type: tab === 0 ? 'category' : 'provider', data: {} })}>
          Add {tab === 0 ? 'Category' : 'Provider'}
        </Button>
      </Box>

      {tab === 0 ? (
        <DataTable columns={categoryColumns} rows={categories} loading={loading} pagination={pagination} onPageChange={fetchCategories} actionColumn={actionCol} emptyMessage="No categories found" emptyIcon="📂" />
      ) : (
        <DataTable columns={providerColumns} rows={providers} loading={loading} pagination={pagination} onPageChange={fetchProviders} actionColumn={actionCol} emptyMessage="No providers found" emptyIcon="🏪" />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        {formDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{formDialog.mode === 'add' ? 'Add' : 'Edit'} {formDialog.type === 'category' ? 'Category' : 'Provider'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {formDialog.type === 'category' ? (
                  <>
                    <TextField label="Name" value={formDialog.data.name || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, name: e.target.value } }))} fullWidth required />
                    <TextField label="Slug" value={formDialog.data.slug || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, slug: e.target.value } }))} fullWidth />
                    <TextField label="Description" value={formDialog.data.description || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, description: e.target.value } }))} fullWidth multiline rows={2} />
                    <TextField label="Sort Order" type="number" value={formDialog.data.sortOrder || 0} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, sortOrder: parseInt(e.target.value) } }))} fullWidth />
                  </>
                ) : (
                  <>
                    <TextField label="Provider Name" value={formDialog.data.name || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, name: e.target.value } }))} fullWidth required />
                    <TextField label="Owner Name" value={formDialog.data.ownerName || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, ownerName: e.target.value } }))} fullWidth />
                    <TextField label="Phone" value={formDialog.data.phone || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, phone: e.target.value } }))} fullWidth />
                    <TextField label="Email" type="email" value={formDialog.data.email || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, email: e.target.value } }))} fullWidth />
                    <TextField label="City" value={formDialog.data.address?.city || ''} onChange={(e) => setFormDialog(f => ({ ...f, data: { ...f.data, address: { ...formDialog.data.address, city: e.target.value } } }))} fullWidth />
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormDialog(null)} variant="outlined">Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving...' : formDialog.mode === 'add' ? 'Add' : 'Save Changes'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={`Delete ${deleteTarget?._type === 'category' ? 'Category' : 'Provider'}`} message={`Are you sure?`} confirmLabel="Delete" />
    </Box>
  );
};

export default MarketplacePage;
