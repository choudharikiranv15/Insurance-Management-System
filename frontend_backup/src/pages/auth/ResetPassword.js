import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/apiService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validation
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, formData.password);

      setSuccess(true);

      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 2
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={10}
            sx={{
              padding: 4,
              borderRadius: 3,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            <Typography variant="h4" gutterBottom fontWeight={700}>
              Password Reset Successful!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been reset successfully. You will be redirected to the login page in a moment...
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                fontWeight: 600
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Button
          onClick={() => navigate('/login')}
          startIcon={<ArrowBackIcon />}
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 24 },
            left: { xs: 16, md: 32 },
            color: 'white',
            fontWeight: 600,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateX(-4px)'
            }
          }}
        >
          Back to Login
        </Button>

        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || 'Min 8 chars, uppercase, lowercase, number, special char'}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
