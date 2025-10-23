import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              py: 4
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: 600,
                width: '100%'
              }}
            >
              <ErrorIcon
                color="error"
                sx={{ fontSize: 80, mb: 2 }}
              />

              <Typography variant="h4" gutterBottom color="error">
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry for the inconvenience. An unexpected error has occurred.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                >
                  Reload Page
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                If this problem persists, please contact support.
              </Typography>
            </Paper>
          </Box>
        </Container>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
