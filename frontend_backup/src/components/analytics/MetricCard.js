import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';

const MetricCard = ({
  title,
  value,
  trend,
  trendPercentage,
  icon,
  color = 'primary',
  subtitle,
  prefix = '',
  suffix = ''
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp fontSize="small" />;
    if (trend === 'down') return <TrendingDown fontSize="small" />;
    return <TrendingFlat fontSize="small" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'default';
  };

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" color="textPrimary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Typography variant="h4" component="div" color={`${color}.main`} sx={{ mb: 1 }}>
          {prefix}{value}{suffix}
        </Typography>

        {trendPercentage && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={getTrendIcon()}
              label={`${trendPercentage}%`}
              size="small"
              color={getTrendColor()}
              variant="outlined"
            />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;