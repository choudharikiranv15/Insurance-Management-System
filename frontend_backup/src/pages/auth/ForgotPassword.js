import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);

      setSuccess(true);

      // In development, store the reset token
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
              Check Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent password reset instructions to <strong>{email}</strong>
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong>
                <br />
                • Check your spam folder
                <br />
                • Make sure you entered the correct email
                <br />
                • The link expires in 10 minutes
              </Typography>
            </Alert>

            {resetToken && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Development Mode:</strong><br />
                  Since email is not configured, you can use this reset link:
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate(`/reset-password/${resetToken}`)}
                  sx={{ mt: 1 }}
                  variant="contained"
                  color="warning"
                >
                  Reset Password Now
                </Button>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setResetToken('');
                }}
              >
                Send Again
              </Button>
            </Box>
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
              <EmailIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you instructions to reset your password
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                'Send Reset Link'
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Button
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Sign in
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
