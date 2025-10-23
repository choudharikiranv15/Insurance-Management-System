import React, { useState } from 'react';
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
  Policy as PolicyIcon,
  Assignment as ClaimIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../components/common/NotificationCenter';
import PolicyList from '../../components/policies/PolicyList';
import ClaimList from '../../components/claims/ClaimList';
import AdminProfile from '../../components/profile/AdminProfile';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`customer-tabpanel-${index}`}
        aria-labelledby={`customer-tab-${index}`}
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
            ClaimEase - Customer Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter />
            <Chip label="CUSTOMER" color="primary" size="small" />
            <Typography variant="body1">
              Welcome, {user?.firstName}!
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
            aria-label="customer dashboard tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Overview"
              id="customer-tab-0"
              aria-controls="customer-tabpanel-0"
            />
            <Tab
              icon={<PolicyIcon />}
              label="My Policies"
              id="customer-tab-1"
              aria-controls="customer-tabpanel-1"
            />
            <Tab
              icon={<ClaimIcon />}
              label="My Claims"
              id="customer-tab-2"
              aria-controls="customer-tabpanel-2"
            />
            <Tab
              icon={<ProfileIcon />}
              label="Profile"
              id="customer-tab-3"
              aria-controls="customer-tabpanel-3"
            />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to Your Insurance Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Manage your policies, claims, and payments all in one place.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Policies
                  </Typography>
                  <Typography variant="h4" color="primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active policies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Claims
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending claims
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Premium Due
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ₹0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Next payment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => setTabValue(1)}>
                    View My Policies
                  </Button>
                  <Button variant="outlined" onClick={() => setTabValue(2)}>
                    File a Claim
                  </Button>
                  <Button variant="outlined" onClick={() => setTabValue(3)}>
                    View Profile
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={1}>
          <PolicyList />
        </TabPanel>

        {/* Claims Tab */}
        <TabPanel value={tabValue} index={2}>
          <ClaimList />
        </TabPanel>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={3}>
          <AdminProfile />
        </TabPanel>
      </Container>
    </>
  );
};

export default CustomerDashboard;