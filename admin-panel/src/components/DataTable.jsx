import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';

const DataTable = ({ columns, rows, loading, pagination, onPageChange, onRowsPerPageChange, emptyMessage = 'No data found', emptyIcon = '📭', actionColumn, onExportCSV }) => {
  return (
    <Paper sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      {onExportCSV && rows.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportCSV}
            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
          >
            Export CSV
          </Button>
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem', whiteSpace: 'nowrap', bgcolor: '#F9FAFB' }}
                >
                  {col.label}
                </TableCell>
              ))}
              {actionColumn && (
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem', bgcolor: '#F9FAFB' }} align="right">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton variant="text" width={col.width || 100} height={24} />
                    </TableCell>
                  ))}
                  {actionColumn && <TableCell><Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} /></TableCell>}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionColumn ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>{emptyIcon}</Typography>
                    <Typography variant="body1" color="textSecondary">{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row._id || index} hover sx={{ '&:last-child td': { border: 0 } }}>
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ fontSize: '0.875rem', color: '#374151' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </TableCell>
                  ))}
                  {actionColumn && (
                    <TableCell align="right">
                      {actionColumn(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={(pagination.page || 1) - 1}
          onPageChange={(_, page) => onPageChange?.(page + 1)}
          rowsPerPage={pagination.limit || 20}
          onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ borderTop: '1px solid #E5E7EB' }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
