import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { userService } from '../../services/apiService';

const UserForm = ({ open, onClose, user = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    isActive: true,
    department: '',
    password: '',
    dateOfBirth: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const isEditing = Boolean(user);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        isActive: user.isActive !== undefined ? user.isActive : true,
        department: user.department || '',
        password: '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer',
        isActive: true,
        department: '',
        password: 'Welcome@123',  // Default password for new users (meets all requirements)
        dateOfBirth: ''
      });
    }
    setErrors({});
    setAvatar(null);
  }, [user, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Clear dateOfBirth when changing role from customer to agent/admin
      if (field === 'role' && value !== 'customer') {
        updated.dateOfBirth = '';
      }

      // Clear department when changing role to customer
      if (field === 'role' && value === 'customer') {
        updated.department = '';
      }

      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be between 2 and 50 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be between 2 and 50 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation - exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Password validation (only for new users)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
      }
    }

    // Department validation
    if (formData.role === 'agent' || formData.role === 'admin') {
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required for agents and admins';
      }
    }

    // Date of Birth validation (required for customers)
    if (formData.role === 'customer') {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required for customers';
      } else {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
          newErrors.dateOfBirth = 'Customer must be at least 18 years old';
        } else if (age > 120) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await userService.update(user.id, formData);
      } else {
        await userService.create(formData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};

        // Check if errors are in express-validator format
        error.response.data.errors.forEach(err => {
          if (err.param) {
            // Express-validator format: { param: 'fieldName', msg: 'error message' }
            backendErrors[err.param] = err.msg;
          } else if (err.field) {
            // Mongoose format: { field: 'fieldName', message: 'error message' }
            backendErrors[err.field] = err.message;
          }
        });

        // If we got field-specific errors, show them on the fields
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        } else {
          // Fallback to generic error
          setErrors({ submit: error.response?.data?.message || 'Validation failed' });
        }
      } else {
        // Generic error message
        setErrors({ submit: error.response?.data?.message || error.message || 'Failed to save user' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDepartmentOptions = () => {
    switch (formData.role) {
      case 'admin':
        return ['Administration', 'IT', 'Finance', 'Human Resources'];
      case 'agent':
        return ['Sales', 'Customer Service', 'Underwriting', 'Claims'];
      default:
        return [];
    }
  };

  const showDepartmentField = formData.role === 'admin' || formData.role === 'agent';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {isEditing ? 'Edit User' : 'Add New User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEditing ? 'Update user information' : 'Fill in the details to create a new user'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              1. Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name *"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName || '2-50 characters'}
              placeholder="John"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name *"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName || '2-50 characters'}
              placeholder="Doe"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email || 'Will be used for login'}
              placeholder="john.doe@example.com"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone || "10-digit mobile number"}
              placeholder="9876543210"
              required
            />
          </Grid>

          {/* Date of Birth (required for customers) */}
          {formData.role === 'customer' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth || "Must be at least 18 years old"}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
                required
              />
            </Grid>
          )}

          {!isEditing && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Default password: <strong>Welcome@123</strong> (User can change it later)
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password || "Min 8 chars with uppercase, lowercase, number & special character"}
                placeholder="Enter a secure password"
                required
              />
            </Grid>
          )}

          {/* Role and Status */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              2. Role & Access
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>User Role *</InputLabel>
              <Select
                value={formData.role}
                onChange={handleChange('role')}
                label="User Role *"
              >
                <MenuItem value="customer">
                  <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                    <Typography variant="body2">Customer</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Can purchase policies and file claims
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="agent">
                  <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                    <Typography variant="body2">Agent</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manage policies and assist customers
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                    <Typography variant="body2">Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full system access and management
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Account Status *</InputLabel>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                label="Account Status *"
              >
                <MenuItem value="active">
                  <Chip label="Active" color="success" size="small" sx={{ mr: 1 }} />
                  Can access system
                </MenuItem>
                <MenuItem value="inactive">
                  <Chip label="Inactive" color="default" size="small" sx={{ mr: 1 }} />
                  Access disabled
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Department (for agents and admins) */}
          {showDepartmentField && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleChange('department')}
                  label="Department *"
                  required
                >
                  {getDepartmentOptions().map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;