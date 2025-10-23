import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Chip,
  Tab,
  Tabs
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics,
  People,
  Policy,
  Assignment,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import UserList from '../../components/users/UserList';
import AdminProfile from '../../components/profile/AdminProfile';
import PolicyList from '../../components/policies/PolicyList';
import ClaimList from '../../components/claims/ClaimList';
import NotificationCenter from '../../components/common/NotificationCenter';
import { analyticsService } from '../../services/apiService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activePolicies: 0,
    pendingClaims: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboard();

      // The analytics endpoint returns data in response.data.analytics, not response.data.data
      const data = response.data.analytics || {};

      setDashboardStats({
        totalUsers: data.users?.totalUsers || 0,
        activePolicies: data.policies?.activePolicies || 0,
        pendingClaims: data.claims?.pendingClaims || 0,
        revenue: data.payments?.totalRevenue || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Button Handlers
  const handleManageUsers = () => {
    setTabValue(2); // Navigate to Users tab
  };

  const handleViewAgents = () => {
    setTabValue(2); // Navigate to Users tab (can add filter later)
    toast.info('Filtering agents...');
  };

  const handleCustomerReports = () => {
    setTabValue(2); // Navigate to Users tab
    toast.info('Loading customer reports...');
  };

  const handleApproveClaims = () => {
    setTabValue(4); // Navigate to Claims tab
  };

  const handleViewAllClaims = () => {
    setTabValue(4); // Navigate to Claims tab
  };

  const handleClaimAnalytics = () => {
    setTabValue(1); // Navigate to Analytics tab
  };

  const handlePolicyManagement = () => {
    setTabValue(3); // Navigate to Policies tab
  };

  const handlePaymentRecords = () => {
    toast.info('Payment records feature coming soon!');
  };

  const handleSystemReports = () => {
    setTabValue(1); // Navigate to Analytics tab
    toast.info('Loading system reports...');
  };

  const handleAnalyticsDashboard = () => {
    setTabValue(1); // Navigate to Analytics tab
  };

  const handleSecuritySettings = () => {
    toast.info('Security settings feature coming soon!');
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`admin-tabpanel-${index}`}
        aria-labelledby={`admin-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ClaimEase - Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter />
            <Chip label="ADMIN" color="error" />
            <Typography variant="body1">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin dashboard tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Overview"
              id="admin-tab-0"
              aria-controls="admin-tabpanel-0"
            />
            <Tab
              icon={<Analytics />}
              label="Analytics"
              id="admin-tab-1"
              aria-controls="admin-tabpanel-1"
            />
            <Tab
              icon={<People />}
              label="Users"
              id="admin-tab-2"
              aria-controls="admin-tabpanel-2"
            />
            <Tab
              icon={<Policy />}
              label="Policies"
              id="admin-tab-3"
              aria-controls="admin-tabpanel-3"
            />
            <Tab
              icon={<Assignment />}
              label="Claims"
              id="admin-tab-4"
              aria-controls="admin-tabpanel-4"
            />
            <Tab
              icon={<ProfileIcon />}
              label="Profile"
              id="admin-tab-5"
              aria-controls="admin-tabpanel-5"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                System Administration
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage users, policies, claims, and oversee system operations.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4" color="primary">
                  {loading ? '...' : dashboardStats.totalUsers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Registered users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Policies
                </Typography>
                <Typography variant="h4" color="success.main">
                  {loading ? '...' : dashboardStats.activePolicies}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All policies
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Claims
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {loading ? '...' : dashboardStats.pendingClaims}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Need approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue
                </Typography>
                <Typography variant="h4" color="info.main">
                  ₹{loading ? '...' : (dashboardStats.revenue || 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total collected
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={handleManageUsers}>
                  Manage Users
                </Button>
                <Button variant="outlined" onClick={handleViewAgents}>
                  View Agents
                </Button>
                <Button variant="outlined" onClick={handleCustomerReports}>
                  Customer Reports
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Claims Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleApproveClaims}
                >
                  Approve Claims
                </Button>
                <Button variant="outlined" onClick={handleViewAllClaims}>
                  View All Claims
                </Button>
                <Button variant="outlined" onClick={handleClaimAnalytics}>
                  Claim Analytics
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Operations
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={handlePolicyManagement}>
                  Policy Management
                </Button>
                <Button variant="outlined" onClick={handlePaymentRecords}>
                  Payment Records
                </Button>
                <Button variant="outlined" onClick={handleSystemReports}>
                  System Reports
                </Button>
                <Button variant="outlined" onClick={handleAnalyticsDashboard}>
                  Analytics Dashboard
                </Button>
                <Button variant="outlined" onClick={handleSecuritySettings}>
                  Security Settings
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent System Activity
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No recent activity to display.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <AnalyticsDashboard />
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={2}>
          <UserList />
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={3}>
          <PolicyList />
        </TabPanel>

        {/* Claims Tab */}
        <TabPanel value={tabValue} index={4}>
          <ClaimList />
        </TabPanel>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={5}>
          <AdminProfile />
        </TabPanel>
      </Container>
    </>
  );
};

export default AdminDashboard;