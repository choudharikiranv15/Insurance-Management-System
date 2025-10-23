import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  TextField,
  Alert,
  Snackbar,
  Paper,
  Fade,
  Chip,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { profileService, authService } from '../../services/apiService';

const AdminProfile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.get();

      const profileData = response.data.profile || response.data || {};
      const defaultProfile = {
        personalInfo: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        },
        ...profileData
      };

      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } catch (error) {
      showSnackbar('Failed to load profile', 'error');
      console.error('Profile load error:', error);

      const defaultProfile = {
        personalInfo: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          dateOfBirth: '',
          address: { street: '', city: '', state: '', zipCode: '', country: '' }
        }
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(profile);
  };

  const handleSave = async () => {
    try {
      const response = await profileService.update(formData);
      setProfile(response.data);
      setEditing(false);
      showSnackbar('Profile updated successfully');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showSnackbar('Please upload a valid image file (JPG, PNG, or GIF)', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size should be less than 5MB', 'error');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await profileService.uploadAvatar(formData);

        // Update profile and formData with new avatar URL
        const updatedProfile = { ...profile, avatar: response.data.avatar };
        setProfile(updatedProfile);
        setFormData(updatedProfile);

        showSnackbar('Profile picture updated successfully');
      } catch (error) {
        console.error('Avatar upload error:', error);
        showSnackbar(error.response?.data?.message || 'Failed to update profile picture', 'error');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showSnackbar('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showSnackbar('Password changed successfully');
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="text.secondary">Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Fade in timeout={800}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 4,
              overflow: 'hidden',
              mb: 3,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: 140,
                        height: 140,
                        border: '4px solid #000000',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                        color: '#ffffff'
                      }}
                      src={profile.avatar}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#000000',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                          '&:hover': {
                            backgroundColor: '#2d3748',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                  </Box>
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h3"
                    sx={{
                      color: '#1a202c',
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      icon={<EmailIcon />}
                      label={formData.personalInfo?.email}
                      sx={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1px solid #000000',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: '#000000' }
                      }}
                    />
                    {formData.personalInfo?.phone && (
                      <Chip
                        icon={<PhoneIcon />}
                        label={formData.personalInfo?.phone}
                        sx={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          border: '1px solid #000000',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#000000' }
                        }}
                      />
                    )}
                  </Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#000000' }} />
                    <Typography variant="body1" sx={{ color: '#000000', fontWeight: 600 }}>
                      Account Active
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Action Buttons Row */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={editing ? <SaveIcon /> : <EditIcon />}
                  onClick={editing ? handleSave : handleEdit}
                  sx={{
                    background: '#000000',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                    '&:hover': {
                      background: '#2d3748',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {editing ? 'Save Changes' : 'Edit Profile'}
                </Button>
                {editing && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{
                      borderColor: '#000000',
                      color: '#000000',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#2d3748',
                        color: '#2d3748',
                        borderWidth: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{
                    borderColor: '#000000',
                    color: '#000000',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: '#2d3748',
                      color: '#2d3748',
                      borderWidth: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Personal Information Section */}
          <Grid container spacing={3}>
            {/* Basic Information Card */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="#1a202c">
                      Basic Information
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={formData.personalInfo?.firstName || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                          disabled={!editing}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#000000' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={formData.personalInfo?.lastName || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                          disabled={!editing}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#000000' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.personalInfo?.email || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#000000' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#000000'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#000000',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#000000'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.personalInfo?.phone || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#000000' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#000000'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#000000',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#000000'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={formData.personalInfo?.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeIcon sx={{ color: '#000000' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#000000'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#000000',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#000000'
                        }
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information Card */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <HomeIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="#1a202c">
                      Address Information
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={formData.personalInfo?.address?.street || ''}
                      onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
                      disabled={!editing}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon sx={{ color: '#000000' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#000000'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#000000',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#000000'
                        }
                      }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={formData.personalInfo?.address?.city || ''}
                          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          value={formData.personalInfo?.address?.state || ''}
                          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'state', e.target.value)}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          value={formData.personalInfo?.address?.zipCode || ''}
                          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'zipCode', e.target.value)}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={formData.personalInfo?.address?.country || ''}
                          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'country', e.target.value)}
                          disabled={!editing}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#000000'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#000000'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              <LockIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1a202c">
              Change Password
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#000000' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#000000'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#000000'
                }
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#000000' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#000000'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#000000'
                }
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#000000' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#000000'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#000000'
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setPasswordDialog(false)}
            size="large"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              color: '#000000'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            size="large"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              background: '#000000',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
              '&:hover': {
                background: '#2d3748',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
              }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfile;
