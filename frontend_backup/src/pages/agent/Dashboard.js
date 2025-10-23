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

const AgentDashboard = () => {
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
        id={`agent-tabpanel-${index}`}
        aria-labelledby={`agent-tab-${index}`}
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
            ClaimEase - Agent Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter />
            <Chip label={`Agent Code: ${user?.agentCode || 'N/A'}`} color="secondary" />
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
            aria-label="agent dashboard tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Overview"
              id="agent-tab-0"
              aria-controls="agent-tabpanel-0"
            />
            <Tab
              icon={<PolicyIcon />}
              label="Policies"
              id="agent-tab-1"
              aria-controls="agent-tabpanel-1"
            />
            <Tab
              icon={<ClaimIcon />}
              label="Claims"
              id="agent-tab-2"
              aria-controls="agent-tabpanel-2"
            />
            <Tab
              icon={<ProfileIcon />}
              label="Profile"
              id="agent-tab-3"
              aria-controls="agent-tabpanel-3"
            />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to ClaimEase
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Help customers find the right insurance and manage their needs.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Customers
                  </Typography>
                  <Typography variant="h4" color="primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total customers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Policies Sold
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This month
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
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Need assistance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Commission
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    ₹0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Agent Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => setTabValue(1)}>
                    Create Policy
                  </Button>
                  <Button variant="outlined" onClick={() => setTabValue(1)}>
                    View Policies
                  </Button>
                  <Button variant="outlined" onClick={() => setTabValue(2)}>
                    Assist with Claims
                  </Button>
                  <Button variant="outlined" onClick={() => setTabValue(3)}>
                    View Profile
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No recent activity to display.
                </Typography>
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

export default AgentDashboard;