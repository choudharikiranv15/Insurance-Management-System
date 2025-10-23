import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (showError) setShowError(false);
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(formData.email, formData.password);

      // Navigate after successful login
      const roleDashboards = {
        admin: '/admin/dashboard',
        agent: '/agent/dashboard',
        customer: '/customer/dashboard'
      };

      navigate(roleDashboards[response.user.role] || '/', { replace: true });
    } catch (err) {
      setShowError(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Demo credentials for quick testing (matches backend seed data)
  const setDemoCredentials = (role) => {
    const demoCredentials = {
      admin: { email: 'admin@insurance.com', password: 'admin123' },
      agent: { email: 'agent@insurance.com', password: 'agent123' },
      customer: { email: 'customer@insurance.com', password: 'customer123' }
    };
    setFormData(demoCredentials[role]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 3, md: 4 },
        position: 'relative'
      }}
    >
      {/* Go Back Button */}
      <Button
        onClick={() => navigate('/')}
        startIcon={<ArrowBackIcon />}
        sx={{
          position: 'absolute',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 32 },
          color: 'white',
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          px: 3,
          py: 1.5,
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.25)',
            transform: 'translateX(-4px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        Back to Home
      </Button>

      <Container component="main" maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid container spacing={4} alignItems="center" sx={{ maxWidth: '1200px', width: '100%' }}>
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ color: 'white', mb: 4 }}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                ClaimEase
              </Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                Insurance Management System
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Making insurance claims easy and hassle-free
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">Customer Portal</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Manage policies & claims
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">Agent Dashboard</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Help customers grow
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">Admin Control</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      System management
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={24}
              sx={{
                padding: { xs: 3, sm: 4, md: 5 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                width: '100%',
                maxWidth: '480px',
                margin: 'auto'
              }}
            >
              {/* Mobile Branding */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                  ClaimEase
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                  Insurance Management System
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold" sx={{ display: { xs: 'none', md: 'block' } }}>
                  Welcome Back
                </Typography>
                <Typography variant="h5" component="h1" gutterBottom color="primary" fontWeight="bold" sx={{ display: { xs: 'block', md: 'none' } }}>
                  Sign In
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Sign in to access your insurance dashboard
                </Typography>
              </Box>

              {(error || showError) && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error || 'Login failed. Please check your credentials.'}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    }
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Demo Access
                  </Typography>
                </Divider>

                <Grid container spacing={1} sx={{ mb: 2, justifyContent: 'center' }}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => setDemoCredentials('admin')}
                      startIcon={<SecurityIcon />}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Admin
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => setDemoCredentials('agent')}
                      startIcon={<BusinessIcon />}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Agent
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => setDemoCredentials('customer')}
                      startIcon={<PeopleIcon />}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Customer
                    </Button>
                  </Grid>
                </Grid>

                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate('/register')}
                    type="button"
                    sx={{
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Create Account →
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
