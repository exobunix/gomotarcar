import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
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
import { apartmentApi } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';

const labelOptions = ['Apartment', 'Villa', 'Society', 'Independent House', 'Other'];

const ApartmentListPage = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '' });
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', society: '', area: '', flatNumber: '', label: 'Apartment' });
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apartmentApi.list({ page, limit: 20, ...filters });
      setApartments(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (apt) => { setEditing(apt); setForm({ name: apt.name, city: apt.city, society: apt.society || '', area: apt.area || '', flatNumber: apt.flatNumber || '', label: apt.label || 'Apartment' }); setDialog(true); };
  const openCreate = () => { setEditing(null); setForm({ name: '', city: '', society: '', area: '', flatNumber: '', label: 'Apartment' }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) { await apartmentApi.update(editing._id, form); } else { await apartmentApi.create(form); }
      setDialog(false); fetchData();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apartmentApi.delete(deleteTarget._id); setDeleteTarget(null); fetchData(); } catch {}
  };

  const handleSetDefault = async (id) => { try { await apartmentApi.setDefault(id); fetchData(); } catch {} };

  const columns = [
    { key: 'name', label: 'Name', render: (v, r) => <><Box sx={{ fontWeight: 600 }}>{v}</Box>{r.flatNumber && <Box sx={{ fontSize: '0.75rem', color: '#6B7280' }}>#{r.flatNumber}</Box>}</> },
    { key: 'society', label: 'Society' },
    { key: 'area', label: 'Area' },
    { key: 'city', label: 'City' },
    { key: 'label', label: 'Type', render: (v) => <Chip label={v} size="small" variant="outlined" /> },
    { key: 'isDefault', label: 'Default', render: (v) => v ? <StatusChip status="yes" label="Default" /> : '-' },
  ];

  const actionCol = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
      {!row.isDefault && <Tooltip title="Set Default"><IconButton size="small" color="warning" onClick={() => handleSetDefault(row._id)}><StarIcon fontSize="small" /></IconButton></Tooltip>}
      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Apartment Management" subtitle="Manage customer apartments and addresses" actionLabel="Add Apartment" actionIcon={<AddIcon />} onAction={openCreate} />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <SearchBar value={filters.search} onChange={(v) => setFilters(f => ({ ...f, search: v }))} placeholder="Search by name, society, or area..." />
      </Box>

      <DataTable columns={columns} rows={apartments} loading={loading} pagination={pagination} onPageChange={fetchData} actionColumn={actionCol} emptyMessage="No apartments found" />

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Apartment' : 'Add Apartment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
            <TextField label="Flat / House Number" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} fullWidth />
            <TextField label="Society / Building" value={form.society} onChange={(e) => setForm({ ...form, society: e.target.value })} fullWidth />
            <TextField label="Area / Locality" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} fullWidth />
            <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth required />
            <TextField select label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth>
              {labelOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Apartment" message={`Delete ${deleteTarget?.name}? This cannot be undone.`} confirmLabel="Delete" />
    </Box>
  );
};

export default ApartmentListPage;
