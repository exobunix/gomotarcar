import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const StatCard = ({ title, value, subtitle, icon, color = '#0D5BD7', loading }) => (
  <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontWeight: 500 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, color }}>
              {value ?? '-'}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ fontSize: '2rem', opacity: 0.2 }}>{icon}</Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
