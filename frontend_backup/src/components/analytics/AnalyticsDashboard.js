import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Fab
} from '@mui/material';
import {
  People,
  Policy,
  AttachMoney,
  Assignment,
  MoreVert,
  Refresh,
  GetApp
} from '@mui/icons-material';
import MetricCard from './MetricCard';
import RevenueChart from './RevenueChart';
import PolicyDistributionChart from './PolicyDistributionChart';
import ClaimAnalyticsChart from './ClaimAnalyticsChart';
import ActivityTimeline from './ActivityTimeline';

const AnalyticsDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In a real app, this would trigger data refresh
  };

  const handleExport = () => {
    // In a real app, this would export dashboard data
    console.log('Exporting dashboard data...');
    handleMenuClose();
  };

  // Sample KPI data - in real app, this would come from API
  const kpiData = {
    totalUsers: {
      value: 1247,
      trend: 'up',
      trendPercentage: 12.5,
      subtitle: 'Active customers'
    },
    activePolicies: {
      value: 856,
      trend: 'up',
      trendPercentage: 8.3,
      subtitle: 'All policy types'
    },
    monthlyRevenue: {
      value: 45000,
      trend: 'up',
      trendPercentage: 15.2,
      subtitle: 'Current month'
    },
    pendingClaims: {
      value: 23,
      trend: 'down',
      trendPercentage: 5.7,
      subtitle: 'Awaiting approval'
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Options">
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExport}>
              <GetApp sx={{ mr: 1 }} />
              Export Data
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              View Reports
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={kpiData.totalUsers.value.toLocaleString()}
            trend={kpiData.totalUsers.trend}
            trendPercentage={kpiData.totalUsers.trendPercentage}
            icon={<People />}
            color="primary"
            subtitle={kpiData.totalUsers.subtitle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Policies"
            value={kpiData.activePolicies.value.toLocaleString()}
            trend={kpiData.activePolicies.trend}
            trendPercentage={kpiData.activePolicies.trendPercentage}
            icon={<Policy />}
            color="success"
            subtitle={kpiData.activePolicies.subtitle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={kpiData.monthlyRevenue.value.toLocaleString()}
            trend={kpiData.monthlyRevenue.trend}
            trendPercentage={kpiData.monthlyRevenue.trendPercentage}
            icon={<AttachMoney />}
            color="info"
            prefix="$"
            subtitle={kpiData.monthlyRevenue.subtitle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Claims"
            value={kpiData.pendingClaims.value}
            trend={kpiData.pendingClaims.trend}
            trendPercentage={kpiData.pendingClaims.trendPercentage}
            icon={<Assignment />}
            color="warning"
            subtitle={kpiData.pendingClaims.subtitle}
          />
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <RevenueChart title="Revenue & Premium Collection Trends" />
        </Grid>

        {/* Policy Distribution */}
        <Grid item xs={12} lg={4}>
          <PolicyDistributionChart title="Policy Type Distribution" />
        </Grid>

        {/* Claims Analytics */}
        <Grid item xs={12} lg={8}>
          <ClaimAnalyticsChart title="Claims Processing Analytics" />
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12} lg={4}>
          <ActivityTimeline title="Recent System Activity" />
        </Grid>

        {/* Additional Metrics Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Claim Approval Rate
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              87.5%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Last 30 days
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Customer Satisfaction
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              4.6/5
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Based on 234 reviews
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="info.main" gutterBottom>
              Avg. Processing Time
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              2.3
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Days for claims
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="warning.main" gutterBottom>
              Policy Renewals
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              92%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Renewal rate
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        onClick={handleRefresh}
      >
        <Refresh />
      </Fab>
    </Box>
  );
};

export default AnalyticsDashboard;