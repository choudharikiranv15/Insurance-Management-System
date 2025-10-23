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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  Policy as PolicyIcon,
  Assignment as ClaimIcon,
  Payment as PaymentIcon,
  TrendingUp,
  Lightbulb as RecommendIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../components/common/NotificationCenter';
import { policyService, claimService, paymentService, recommendationService } from '../../services/apiService';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Data states
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activeClaims: 0,
    upcomingPayments: 0,
    totalPremiumDue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [policiesRes, claimsRes, paymentsRes, recommendationsRes] = await Promise.all([
        policyService.getAll({ limit: 10 }).catch(() => ({ data: { policies: [] } })),
        claimService.getAll({ limit: 10 }).catch(() => ({ data: { claims: [] } })),
        paymentService.getAll({ limit: 10 }).catch(() => ({ data: { payments: [] } })),
        recommendationService.getAll().catch(() => ({ data: { recommendations: [] } }))
      ]);

      const policiesData = policiesRes.data.policies || [];
      const claimsData = claimsRes.data.claims || [];
      const paymentsData = paymentsRes.data.payments || [];
      const recommendationsData = recommendationsRes.data.recommendations || [];

      setPolicies(policiesData);
      setClaims(claimsData);
      setPayments(paymentsData);
      setRecommendations(recommendationsData);

      // Calculate stats
      const activePolicies = policiesData.filter(p => p.status === 'active').length;
      const pendingClaims = claimsData.filter(c => ['submitted', 'under_review', 'investigating'].includes(c.status)).length;
      const upcomingPayments = paymentsData.filter(p => p.status === 'pending').length;
      const totalDue = paymentsData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalPolicies: activePolicies,
        activeClaims: pendingClaims,
        upcomingPayments,
        totalPremiumDue: totalDue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'info',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Customer Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter />
            <Chip label="CUSTOMER" color="primary" />
            <Typography variant="body1">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1">
            Manage your insurance policies, track claims, and stay protected.
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PolicyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats.totalPolicies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Policies
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="outlined" fullWidth>
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ClaimIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {stats.activeClaims}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Claims
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="outlined" color="warning" fullWidth>
                  Track Claims
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {stats.upcomingPayments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payments Due
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="outlined" color="error" fullWidth>
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(stats.totalPremiumDue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Due
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="contained" color="success" fullWidth>
                  Make Payment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<PolicyIcon />} label="My Policies" />
            <Tab icon={<ClaimIcon />} label="Claims" />
            <Tab icon={<PaymentIcon />} label="Payments" />
            <Tab icon={<RecommendIcon />} label="Recommendations" />
          </Tabs>
        </Paper>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={0}>
          {policies.length === 0 ? (
            <Alert severity="info">
              You don't have any policies yet. Browse our policy options to get started!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {policies.map((policy) => (
                <Grid item xs={12} md={6} key={policy._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{policy.policyName}</Typography>
                        <Chip
                          label={policy.status}
                          color={getStatusColor(policy.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Policy No: {policy.policyNumber}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Coverage
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(policy.coverageAmount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Premium
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(policy.premiumAmount)}/{policy.premiumFrequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(policy.startDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            End Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(policy.endDate)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                          View Details
                        </Button>
                        <Button size="small" variant="text">
                          Download
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Claims Tab */}
        <TabPanel value={tabValue} index={1}>
          {claims.length === 0 ? (
            <Alert severity="info">
              No claims filed yet. If you need to file a claim, click the button below.
              <Box sx={{ mt: 2 }}>
                <Button variant="contained">File a Claim</Button>
              </Box>
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Claim Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim._id}>
                    <TableCell>{claim.claimNumber}</TableCell>
                    <TableCell>{claim.claimType}</TableCell>
                    <TableCell>{formatCurrency(claim.claimAmount)}</TableCell>
                    <TableCell>{formatDate(claim.reportedDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={claim.status}
                        color={getStatusColor(claim.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={2}>
          {payments.length === 0 ? (
            <Alert severity="info">No payment records found.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <Button size="small" variant="contained" color="primary">
                          Pay Now
                        </Button>
                      )}
                      {payment.status === 'completed' && (
                        <Button size="small" variant="outlined">
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={3}>
          {recommendations.length === 0 ? (
            <Alert severity="info">
              Complete your profile to get personalized policy recommendations.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {recommendations.slice(0, 6).map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{rec.name}</Typography>
                        <Chip
                          label={`Score: ${rec.score}`}
                          color={rec.score >= 80 ? 'success' : rec.score >= 60 ? 'warning' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {rec.description}
                      </Typography>

                      {rec.hasExisting && (
                        <Chip label="Already have this policy" size="small" color="info" sx={{ mb: 2 }} />
                      )}

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Estimated Premium:
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(rec.estimatedPremium?.monthly)}/month
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({formatCurrency(rec.estimatedPremium?.annual)}/year)
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Why recommended:
                        </Typography>
                        <List dense>
                          {rec.reasons?.slice(0, 3).map((reason, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemText
                                primary={`• ${reason}`}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      <Button variant="contained" fullWidth>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Container>
    </>
  );
};

export default CustomerDashboard;
