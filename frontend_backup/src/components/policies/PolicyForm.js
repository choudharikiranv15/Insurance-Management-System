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
  Typography,
  Divider,
  Alert,
  InputAdornment,
  Autocomplete,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import {
  Policy as PolicyIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  LocalHospital as HealthIcon,
  DirectionsCar as AutoIcon,
  Home as HomeIcon,
  Flight as TravelIcon,
  Business as BusinessIcon,
  Favorite as LifeIcon
} from '@mui/icons-material';
import { policyService, userService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const PolicyForm = ({ open, onClose, policy = null, onSuccess }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    policyName: '',
    policyType: 'life',
    description: '',
    coverageAmount: '',
    premiumAmount: '',
    premiumFrequency: 'annual',
    duration: 1,
    customer: '',
    startDate: new Date().toISOString().split('T')[0],
    terms: '',
    status: 'pending'
  });
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(policy);

  const steps = [
    { label: 'Basic Information', icon: <PolicyIcon />, desc: 'Policy type and details' },
    { label: 'Coverage & Premium', icon: <MoneyIcon />, desc: 'Financial terms' },
    { label: 'Review & Submit', icon: <CheckIcon />, desc: 'Review and finalize' }
  ];

  useEffect(() => {
    if (open) {
      loadCustomers();
      if (policy) {
        setFormData({
          policyName: policy.policyName || '',
          policyType: policy.policyType || 'life',
          description: policy.description || '',
          coverageAmount: policy.coverageAmount || '',
          premiumAmount: policy.premiumAmount || '',
          premiumFrequency: policy.premiumFrequency || 'annual',
          duration: policy.duration || 1,
          customer: policy.customer?._id || policy.customer || '',
          startDate: policy.startDate ? new Date(policy.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          terms: policy.terms || '',
          status: policy.status || 'pending'
        });
      } else {
        resetForm();
      }
      setErrors({});
      setActiveStep(0);
    }
  }, [policy, open]);

  const loadCustomers = async () => {
    try {
      const response = await userService.getAll({ role: 'customer' });
      setCustomers(response.data.users || response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      policyName: '',
      policyType: 'life',
      description: '',
      coverageAmount: '',
      premiumAmount: '',
      premiumFrequency: 'annual',
      duration: 1,
      customer: '',
      startDate: new Date().toISOString().split('T')[0],
      terms: '',
      status: 'pending'
    });
  };

  // Helper to fill sample data for testing (remove in production)
  const fillSampleData = () => {
    setFormData({
      policyName: 'Sample Life Insurance Policy',
      policyType: 'life',
      description: 'This is a comprehensive life insurance policy that provides financial protection.',
      coverageAmount: '100000',
      premiumAmount: '500',
      premiumFrequency: 'annual',
      duration: 10,
      customer: formData.customer,
      startDate: new Date().toISOString().split('T')[0],
      terms: 'This policy is subject to the following terms and conditions: 1. Premium must be paid on time. 2. Any pre-existing conditions must be disclosed.',
      status: 'pending'
    });
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Basic Information validation
      if (!formData.policyName.trim()) {
        newErrors.policyName = 'Policy name is required';
      } else if (formData.policyName.trim().length < 5) {
        newErrors.policyName = 'Policy name must be at least 5 characters';
      } else if (formData.policyName.trim().length > 100) {
        newErrors.policyName = 'Policy name must not exceed 100 characters';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      } else if (formData.description.trim().length > 500) {
        newErrors.description = 'Description must not exceed 500 characters';
      }
      if (!formData.customer && user?.role !== 'customer') {
        newErrors.customer = 'Customer is required';
      }
    } else if (step === 1) {
      // Coverage & Premium validation
      if (!formData.coverageAmount || formData.coverageAmount < 1000) {
        newErrors.coverageAmount = 'Coverage amount must be at least ₹1,000';
      }
      if (!formData.premiumAmount || formData.premiumAmount < 100) {
        newErrors.premiumAmount = 'Premium amount must be at least ₹100';
      }
      if (!formData.duration || formData.duration < 1) {
        newErrors.duration = 'Duration must be at least 1 year';
      }
      if (!formData.terms.trim()) {
        newErrors.terms = 'Terms and conditions are required';
      } else if (formData.terms.trim().length < 50) {
        newErrors.terms = 'Terms must be at least 50 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        customer: user?.role === 'customer' ? user.id : formData.customer,
        agent: user?.role === 'agent' ? user.id : undefined
      };

      // Log the data being submitted for debugging
      console.log('Submitting policy data:', submitData);

      if (isEditing) {
        await policyService.update(policy._id, submitData);
      } else {
        await policyService.create(submitData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      // Log full error for debugging
      console.error('Policy submission error:', error);
      console.error('Error response:', error.response?.data);

      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};
        const errorMessages = [];

        error.response.data.errors.forEach(err => {
          if (err.param) {
            // Express-validator format
            backendErrors[err.param] = err.msg;
            errorMessages.push(`${err.param}: ${err.msg}`);
          } else if (err.field) {
            // Mongoose format
            backendErrors[err.field] = err.message;
            errorMessages.push(`${err.field}: ${err.message}`);
          } else {
            // Generic error format
            errorMessages.push(err.msg || err.message || JSON.stringify(err));
          }
        });

        // If we got field-specific errors, show them
        if (Object.keys(backendErrors).length > 0) {
          setErrors({
            ...backendErrors,
            submit: errorMessages.join('\n')
          });
        } else {
          setErrors({ submit: errorMessages.join('\n') || error.response?.data?.message || 'Validation failed' });
        }
      } else {
        setErrors({ submit: error.response?.data?.message || error.message || 'Failed to save policy' });
      }
    } finally {
      setLoading(false);
    }
  };

  const policyTypes = [
    { value: 'life', label: 'Life Insurance', icon: <LifeIcon />, color: '#1976d2', desc: 'Provides financial protection for beneficiaries in case of death' },
    { value: 'health', label: 'Health Insurance', icon: <HealthIcon />, color: '#2e7d32', desc: 'Covers medical expenses and healthcare costs' },
    { value: 'auto', label: 'Auto Insurance', icon: <AutoIcon />, color: '#ed6c02', desc: 'Protects against vehicle damage and liability' },
    { value: 'home', label: 'Home Insurance', icon: <HomeIcon />, color: '#9c27b0', desc: 'Covers property damage and personal liability' },
    { value: 'travel', label: 'Travel Insurance', icon: <TravelIcon />, color: '#d32f2f', desc: 'Provides coverage during travel including medical emergencies' },
    { value: 'business', label: 'Business Insurance', icon: <BusinessIcon />, color: '#0288d1', desc: 'Protects business assets, operations, and liability' }
  ];

  const selectedType = policyTypes.find(t => t.value === formData.policyType) || policyTypes[0];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              {/* Policy Type Selection */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <PolicyIcon sx={{ mr: 1, color: 'primary.main' }} />
                Select Insurance Type
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {policyTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.value}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: 2,
                        borderColor: formData.policyType === type.value ? type.color : 'grey.300',
                        bgcolor: formData.policyType === type.value ? alpha(type.color, 0.08) : 'background.paper',
                        transition: 'all 0.2s ease',
                        height: '100%',
                        '&:hover': {
                          borderColor: type.color,
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleChange('policyType')({ target: { value: type.value } })}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                          sx={{
                            width: 45,
                            height: 45,
                            borderRadius: 2,
                            bgcolor: alpha(type.color, 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: type.color,
                            mx: 'auto',
                            mb: 1.5
                          }}
                        >
                          {type.icon}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {type.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Policy Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                Policy Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Policy Name"
                    value={formData.policyName}
                    onChange={handleChange('policyName')}
                    error={!!errors.policyName}
                    helperText={errors.policyName || 'A descriptive name for this policy (5-100 characters)'}
                    placeholder="e.g., Comprehensive Life Insurance Plan"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PolicyIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={handleChange('description')}
                    error={!!errors.description}
                    helperText={errors.description || 'Explain what this policy covers (10-500 characters)'}
                    multiline
                    rows={3}
                    placeholder="Describe the policy coverage, benefits, and key features..."
                    required
                  />
                </Grid>

                {user?.role !== 'customer' && (
                  <Grid item xs={12}>
                    <Autocomplete
                      options={customers}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                      value={customers.find(c => c._id === formData.customer) || null}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({ ...prev, customer: newValue?._id || '' }));
                        if (errors.customer) {
                          setErrors(prev => ({ ...prev, customer: '' }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Customer"
                          error={!!errors.customer}
                          helperText={errors.customer || 'Choose the customer for this policy'}
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <PersonIcon color="action" fontSize="small" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange('startDate')}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="When does this policy begin?"
                  />
                </Grid>

                {(user?.role === 'admin' || isEditing) && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={handleChange('status')}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending Approval</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="expired">Expired</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              {/* Financial Terms */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                Coverage & Premium
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coverage Amount"
                    type="number"
                    value={formData.coverageAmount}
                    onChange={handleChange('coverageAmount')}
                    error={!!errors.coverageAmount}
                    helperText={errors.coverageAmount || 'Total coverage provided'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 1000, step: 1000 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Premium Amount"
                    type="number"
                    value={formData.premiumAmount}
                    onChange={handleChange('premiumAmount')}
                    error={!!errors.premiumAmount}
                    helperText={errors.premiumAmount || 'Amount to be paid per period'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 100, step: 100 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Frequency</InputLabel>
                    <Select
                      value={formData.premiumFrequency}
                      onChange={handleChange('premiumFrequency')}
                      label="Payment Frequency"
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Every 3 Months</MenuItem>
                      <MenuItem value="semi-annual">Every 6 Months</MenuItem>
                      <MenuItem value="annual">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Policy Duration (Years)"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange('duration')}
                    error={!!errors.duration}
                    helperText={errors.duration || 'How many years?'}
                    inputProps={{ min: 1, max: 50 }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Total Premium: ₹{(formData.premiumAmount * (formData.premiumFrequency === 'monthly' ? 12 : formData.premiumFrequency === 'quarterly' ? 4 : formData.premiumFrequency === 'semi-annual' ? 2 : 1) * formData.duration).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      over {formData.duration} {formData.duration === 1 ? 'year' : 'years'}
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Terms & Conditions */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                Terms & Conditions
              </Typography>
              <TextField
                fullWidth
                value={formData.terms}
                onChange={handleChange('terms')}
                error={!!errors.terms}
                helperText={errors.terms || 'Enter policy terms, conditions, and important information (minimum 50 characters)'}
                multiline
                rows={6}
                placeholder="Include coverage details, exclusions, claim procedures, cancellation policy, and any other important terms..."
                required
              />
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <CheckIcon sx={{ mr: 1, color: 'success.main' }} />
                Review Your Policy
              </Typography>

              {/* Policy Summary */}
              <Card sx={{ mb: 3, bgcolor: alpha(selectedType.color, 0.05), border: `2px solid ${alpha(selectedType.color, 0.2)}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: selectedType.color, mr: 2 }}>
                      {selectedType.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formData.policyName || 'Policy Name'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedType.label}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formData.description || 'No description provided'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Key Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Coverage Amount</Typography>
                    <Typography variant="h6" color="success.main">₹{Number(formData.coverageAmount || 0).toLocaleString('en-IN')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Premium ({formData.premiumFrequency})</Typography>
                    <Typography variant="h6" color="primary.main">₹{Number(formData.premiumAmount || 0).toLocaleString('en-IN')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="h6">{formData.duration} {formData.duration === 1 ? 'Year' : 'Years'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="h6">{new Date(formData.startDate).toLocaleDateString()}</Typography>
                  </Paper>
                </Grid>
                {user?.role !== 'customer' && formData.customer && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">Customer</Typography>
                      <Typography variant="body1">
                        {customers.find(c => c._id === formData.customer)?.firstName} {customers.find(c => c._id === formData.customer)?.lastName}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Alert severity="success" icon={<InfoIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Total Premium: ₹{(formData.premiumAmount * (formData.premiumFrequency === 'monthly' ? 12 : formData.premiumFrequency === 'quarterly' ? 4 : formData.premiumFrequency === 'semi-annual' ? 2 : 1) * formData.duration).toLocaleString('en-IN')} over {formData.duration} {formData.duration === 1 ? 'year' : 'years'}
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>

              {errors.submit && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    {errors.submit}
                  </Typography>
                </Alert>
              )}
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <PolicyIcon color="primary" sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isEditing ? 'Edit Policy' : 'Create New Policy'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing ? 'Update policy details' : 'Fill in the details to create a new insurance policy'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing && process.env.NODE_ENV === 'development' && (
              <Tooltip title="Fill sample data for testing">
                <Button size="small" onClick={fillSampleData} variant="outlined">
                  Fill Sample
                </Button>
              </Tooltip>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {activeStep > index ? <CheckIcon fontSize="small" /> : step.icon}
                  </Box>
                )}
              >
                <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.desc}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                endIcon={<CheckIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                }}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Policy' : 'Create Policy')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyForm;
