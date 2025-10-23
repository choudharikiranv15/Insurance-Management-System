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
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AttachFile as FileIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { claimService, policyService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const ClaimForm = ({ open, onClose, claim = null, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    policy: '',
    claimType: 'medical',
    description: '',
    claimAmount: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: '',
    priority: 'medium',
    witnesses: []
  });
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(claim);

  useEffect(() => {
    if (open) {
      loadPolicies();
      if (claim) {
        // Convert incidentLocation from object to string for the form
        const locationString = typeof claim.incidentLocation === 'object' && claim.incidentLocation
          ? claim.incidentLocation.address || ''
          : claim.incidentLocation || '';

        setFormData({
          policy: claim.policy?._id || claim.policy || '',
          claimType: claim.claimType || 'medical',
          description: claim.description || '',
          claimAmount: claim.claimAmount || '',
          incidentDate: claim.incidentDate ? new Date(claim.incidentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          incidentLocation: locationString,
          priority: claim.priority || 'medium',
          witnesses: claim.witnesses || []
        });
        setDocuments([]);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [claim, open]);

  const loadPolicies = async () => {
    try {
      const response = await policyService.getAll({ status: 'active' });
      const policiesData = response.data.policies || response.data;

      console.log('Loaded policies:', policiesData);
      console.log('User:', user);

      // Backend already filters by user role, so no need for frontend filtering
      // Just ensure we have an array
      const policies = Array.isArray(policiesData) ? policiesData : [];

      console.log('Setting policies:', policies);
      setPolicies(policies);
    } catch (error) {
      console.error('Failed to load policies:', error);
      setPolicies([]);
    }
  };

  const resetForm = () => {
    setFormData({
      policy: '',
      claimType: 'medical',
      description: '',
      claimAmount: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentLocation: '',
      priority: 'medium',
      witnesses: []
    });
    setDocuments([]);
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    // Validate file size (max 5MB per file)
    const invalidFiles = [];
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(file.name);
        return false;
      }
      return true;
    });

    // Set error message for all invalid files
    if (invalidFiles.length > 0) {
      const errorMsg = invalidFiles.length === 1
        ? `${invalidFiles[0]} exceeds 5MB limit`
        : `${invalidFiles.length} files exceed 5MB limit: ${invalidFiles.join(', ')}`;
      setErrors(prev => ({ ...prev, documents: errorMsg }));
    } else if (errors.documents) {
      setErrors(prev => ({ ...prev, documents: '' }));
    }

    setDocuments(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddWitness = () => {
    setFormData(prev => ({
      ...prev,
      witnesses: [...prev.witnesses, { name: '', phone: '', email: '' }]
    }));
  };

  const handleWitnessChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      )
    }));
  };

  const handleRemoveWitness = (index) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.policy) {
      newErrors.policy = 'Policy is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.claimAmount || formData.claimAmount <= 0) {
      newErrors.claimAmount = 'Valid claim amount is required';
    }

    // Handle incidentLocation as both string (new claim) and object (editing)
    const locationValue = typeof formData.incidentLocation === 'string'
      ? formData.incidentLocation
      : formData.incidentLocation?.address || '';

    if (!locationValue.trim()) {
      newErrors.incidentLocation = 'Incident location is required';
    }

    if (!isEditing && documents.length === 0) {
      newErrors.documents = 'At least one supporting document is required';
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

      // Convert incidentLocation string to object format expected by backend
      const submitData = {
        ...formData,
        incidentLocation: {
          address: formData.incidentLocation,
          city: '',
          state: '',
          country: ''
        },
        documents
      };

      // Only include witnesses if there are any
      if (formData.witnesses && formData.witnesses.length === 0) {
        delete submitData.witnesses;
      }

      if (isEditing) {
        await claimService.update(claim._id, submitData);
      } else {
        await claimService.create(submitData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};

        error.response.data.errors.forEach(err => {
          if (err.param) {
            // Express-validator format
            backendErrors[err.param] = err.msg;
          } else if (err.field) {
            // Mongoose format
            backendErrors[err.field] = err.message;
          }
        });

        // If we got field-specific errors, show them
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);

          // Also show a summary in submit error
          const errorFields = Object.keys(backendErrors).join(', ');
          setErrors(prev => ({
            ...prev,
            ...backendErrors,
            submit: `Validation failed for: ${errorFields}`
          }));
        } else {
          setErrors({ submit: error.response?.data?.message || 'Validation failed' });
        }
      } else {
        setErrors({ submit: error.response?.data?.message || error.message || 'Failed to save claim' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getClaimTypeDescription = (type) => {
    const descriptions = {
      death: 'Life insurance claim due to death of insured',
      disability: 'Claim for permanent or temporary disability',
      medical: 'Medical expenses and healthcare costs',
      accident: 'Accidental injury or damage claim',
      property_damage: 'Property damage or destruction',
      theft: 'Theft or burglary claim',
      fire: 'Fire damage claim',
      natural_disaster: 'Damage from natural disasters',
      other: 'Other types of claims'
    };
    return descriptions[type] || '';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 3, px: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DescriptionIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                {isEditing ? 'Edit Claim' : 'File New Claim'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {isEditing ? 'Update your claim information' : 'Submit your insurance claim with required documentation'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: 'grey.50' }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Section 1: Policy & Claim Type */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}
              >
                1
              </Box>
              Select Policy & Claim Type
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Autocomplete
                  options={policies}
                  getOptionLabel={(option) => `${option.policyNumber} - ${option.policyName}`}
                  value={policies.find(p => p._id === formData.policy) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, policy: newValue?._id || '' }));
                    if (errors.policy) {
                      setErrors(prev => ({ ...prev, policy: '' }));
                    }
                  }}
                  noOptionsText={policies.length === 0 ? "No active policies found. Please contact your agent to create a policy first." : "No policies match your search"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Policy *"
                      error={!!errors.policy}
                      helperText={errors.policy || (policies.length === 0 ? "⚠️ No active policies available" : `✓ ${policies.length} active policy(ies) found`)}
                      required
                      size="medium"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.claimType} size="medium">
                  <InputLabel>Claim Type *</InputLabel>
                  <Select
                    value={formData.claimType}
                    onChange={handleChange('claimType')}
                    label="Claim Type *"
                    required
                  >
                    <MenuItem value="medical">Medical Claim</MenuItem>
                    <MenuItem value="accident">Accident Claim</MenuItem>
                    <MenuItem value="property_damage">Property Damage</MenuItem>
                    <MenuItem value="theft">Theft</MenuItem>
                    <MenuItem value="fire">Fire Damage</MenuItem>
                    <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                    <MenuItem value="death">Death Claim</MenuItem>
                    <MenuItem value="disability">Disability Claim</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Claim Amount *"
                  type="number"
                  value={formData.claimAmount}
                  onChange={handleChange('claimAmount')}
                  error={!!errors.claimAmount}
                  helperText={errors.claimAmount || 'Amount you are claiming'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  inputProps={{ min: 1, step: 100 }}
                  required
                  size="medium"
                />
              </Grid>

              {formData.claimType && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <strong>{formData.claimType.replace('_', ' ').toUpperCase()}:</strong> {getClaimTypeDescription(formData.claimType)}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Section 2: Incident Details */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}
              >
                2
              </Box>
              Incident Details
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="When did it happen? *"
                  type="date"
                  value={formData.incidentDate}
                  onChange={handleChange('incidentDate')}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                  helperText="Incident date cannot be in the future"
                  required
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Where did it happen? *"
                  value={formData.incidentLocation}
                  onChange={handleChange('incidentLocation')}
                  error={!!errors.incidentLocation}
                  helperText={errors.incidentLocation || 'City, State or full address'}
                  placeholder="e.g., Mumbai, Maharashtra"
                  required
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What happened? *"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description || 'Explain the incident in detail'}
                  multiline
                  rows={4}
                  placeholder="Describe what happened, how it happened, and any other relevant details..."
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Priority Level</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={handleChange('priority')}
                    label="Priority Level"
                  >
                    <MenuItem value="low">
                      <Chip label="Low" size="small" color="default" sx={{ mr: 1 }} />
                      Can wait
                    </MenuItem>
                    <MenuItem value="medium">
                      <Chip label="Medium" size="small" color="info" sx={{ mr: 1 }} />
                      Normal processing
                    </MenuItem>
                    <MenuItem value="high">
                      <Chip label="High" size="small" color="warning" sx={{ mr: 1 }} />
                      Needs attention
                    </MenuItem>
                    <MenuItem value="urgent">
                      <Chip label="Urgent" size="small" color="error" sx={{ mr: 1 }} />
                      Immediate action
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Documents Upload */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}
              >
                3
              </Box>
              Upload Supporting Documents *
            </Typography>

            <Box
              sx={{
                p: 4,
                border: errors.documents ? '2px dashed' : '2px dashed',
                borderColor: errors.documents ? 'error.main' : 'grey.300',
                borderRadius: 2,
                bgcolor: errors.documents ? 'error.50' : 'grey.50',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha => alpha.palette.primary.main + '08',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <input
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="document-upload"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="document-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <UploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Click or Drag to Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Supported: Images (JPG, PNG), PDF, Word documents
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maximum file size: 5MB per file
                </Typography>
              </label>
            </Box>

            {errors.documents && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.documents}
              </Alert>
            )}

            {documents.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, mb: 2 }}>
                    <FileIcon sx={{ mr: 1 }} />
                    Uploaded Files ({documents.length})
                  </Typography>
                  <List dense>
                    {documents.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { mb: 0 }
                        }}
                      >
                        <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleRemoveFile(index)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Section 4: Witnesses (Optional) */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'grey.400',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700
                  }}
                >
                  4
                </Box>
                Witnesses (Optional)
              </Typography>
              <Button
                variant="outlined"
                onClick={handleAddWitness}
                startIcon={<PersonIcon />}
                size="medium"
              >
                Add Witness
              </Button>
            </Box>

            {formData.witnesses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <PersonIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">
                  No witnesses added. Click "Add Witness" to include witness information.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.witnesses.map((witness, index) => (
                  <Paper key={index} sx={{ p: 2.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Witness #{index + 1}
                      </Typography>
                      <IconButton size="small" onClick={() => handleRemoveWitness(index)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={witness.name}
                          onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                          placeholder="John Doe"
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={witness.phone}
                          onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                          placeholder="9876543210"
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={witness.email}
                          onChange={(e) => handleWitnessChange(index, 'email', e.target.value)}
                          placeholder="witness@example.com"
                          size="medium"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            size="large"
            sx={{ px: 4 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            size="large"
            sx={{
              px: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)',
              }
            }}
          >
            {loading ? 'Submitting...' : (isEditing ? 'Update Claim' : 'Submit Claim')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimForm;
