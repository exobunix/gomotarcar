import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

const PageHeader = ({ title, subtitle, actionLabel, onAction, actionIcon, actionProps = {} }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
      )}
    </Box>
    {actionLabel && (
      <Button
        variant="contained"
        startIcon={actionIcon || <AddIcon />}
        onClick={onAction}
        sx={{ height: 44, whiteSpace: 'nowrap' }}
        {...actionProps}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default PageHeader;
