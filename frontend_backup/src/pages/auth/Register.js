import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    dateOfBirth: '',
  });
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isAuthenticated, user, error, loading } = useAuth();
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Account Details', 'Verification'];

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUppercase || !hasLowercase) {
      return 'Password must contain both uppercase and lowercase letters';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecial) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return '';
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleDashboards = {
        admin: '/admin/dashboard',
        agent: '/agent/dashboard',
        customer: '/customer/dashboard'
      };
      navigate(roleDashboards[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

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

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    } else if (step === 1) {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else {
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          errors.password = passwordError;
        }
      }
      if (!formData.confirmPassword.trim()) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      if (formData.role === 'customer' && !formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required for customers';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1)) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      setActiveStep(2);
    } catch (err) {
      setShowError(true);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const roleInfo = {
    customer: {
      icon: <PeopleIcon />,
      title: 'Customer',
      description: 'Access personal insurance policies, file claims, and manage payments'
    },
    agent: {
      icon: <BusinessIcon />,
      title: 'Insurance Agent',
      description: 'Help customers choose policies, assist with claims, and manage client relationships'
    },
    admin: {
      icon: <SecurityIcon />,
      title: 'Administrator',
      description: 'Full system access, manage users, approve claims, and oversight operations'
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Account Setup
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Choose your role:
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(roleInfo).map(([roleKey, info]) => (
                  <Grid item xs={12} sm={4} key={roleKey}>
                    <Card
                      variant={formData.role === roleKey ? "outlined" : "elevation"}
                      sx={{
                        cursor: 'pointer',
                        border: formData.role === roleKey ? '2px solid' : '1px solid',
                        borderColor: formData.role === roleKey ? 'primary.main' : 'grey.300',
                        bgcolor: formData.role === roleKey ? 'primary.50' : 'background.paper',
                        '&:hover': { bgcolor: 'primary.50' }
                      }}
                      onClick={() => setFormData({ ...formData, role: roleKey })}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box sx={{ color: 'primary.main', mb: 1 }}>
                          {info.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {info.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {info.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {formData.role === 'customer' && (
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="dateOfBirth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={!!fieldErrors.dateOfBirth}
                  helperText={fieldErrors.dateOfBirth}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || 'Min 8 chars, uppercase, lowercase, number, special char'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box textAlign="center" py={4}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Welcome to ClaimEase!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Account Created Successfully
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Your account has been created and you're now logged in.
              You'll be redirected to your dashboard shortly.
            </Typography>
            <Chip
              label={`Logged in as ${roleInfo[formData.role].title}`}
              color="primary"
              sx={{ mt: 2 }}
            />
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
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

      <Container component="main" maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
              Join ClaimEase
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Create your ClaimEase account
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {(error || showError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error || 'Registration failed. Please try again.'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep !== 2 && (
                <>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  {activeStep === steps.length - 2 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                        }
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      }}
                    >
                      Next
                    </Button>
                  )}
                </>
              )}
            </Box>

            {activeStep !== 2 && (
              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Already have an account?
                </Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => navigate('/login')}
                  type="button"
                  sx={{
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign In →
                </Link>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;