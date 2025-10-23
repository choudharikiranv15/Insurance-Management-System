import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Menu,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { policyService } from '../../services/apiService';
import PolicyForm from './PolicyForm';
import { useAuth } from '../../context/AuthContext';

const PolicyList = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    policyType: 'all',
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyFormOpen, setPolicyFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getAll(filters);
      const policiesData = response.data.policies || response.data;
      setPolicies(policiesData);

      // Calculate stats
      const active = policiesData.filter(p => p.status === 'active').length;
      const pending = policiesData.filter(p => p.status === 'pending').length;
      const expired = policiesData.filter(p => p.status === 'expired').length;

      setStats({
        total: policiesData.length,
        active,
        pending,
        expired
      });
    } catch (error) {
      console.error('Failed to load policies:', error);
      showSnackbar('Failed to load policies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [filters.policyType, filters.status, filters.search]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMenuClick = (event, policy) => {
    setAnchorEl(event.currentTarget);
    setSelectedPolicy(policy);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPolicy(null);
  };

  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setPolicyFormOpen(true);
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setPolicyFormOpen(true);
    handleMenuClose();
  };

  const handleViewPolicy = async (policy) => {
    try {
      // Fetch full policy details with populated fields
      const response = await policyService.getById(policy._id);
      setViewingPolicy(response.data.policy);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Failed to load policy details:', error);
      showSnackbar('Failed to load policy details', 'error');
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await policyService.delete(selectedPolicy._id);
      showSnackbar('Policy deleted successfully');
      loadPolicies();
      setDeleteDialogOpen(false);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to delete policy', 'error');
    }
    handleMenuClose();
  };

  const handlePolicyFormSuccess = () => {
    loadPolicies();
    showSnackbar(editingPolicy ? 'Policy updated successfully' : 'Policy created successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'cancelled': return 'default';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const getPolicyTypeColor = (type) => {
    const colors = {
      life: 'primary',
      health: 'success',
      auto: 'info',
      home: 'secondary',
      travel: 'warning',
      business: 'error'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      field: 'policyNumber',
      headerName: 'Policy Number',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'policyName',
      headerName: 'Policy Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'policyType',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getPolicyTypeColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.firstName} {params.value?.lastName}
        </Typography>
      )
    },
    {
      field: 'coverageAmount',
      headerName: 'Coverage',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          ₹{(params.value || 0).toLocaleString('en-IN')}
        </Typography>
      )
    },
    {
      field: 'premiumAmount',
      headerName: 'Premium',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          ₹{(params.value || 0).toLocaleString('en-IN')}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getStatusColor(params.value)}
          variant="filled"
        />
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
      sortable: false,
      filterable: false
    }
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flexGrow: 1 }} />
      <Button
        size="small"
        startIcon={<RefreshIcon />}
        onClick={loadPolicies}
      >
        Refresh
      </Button>
    </GridToolbarContainer>
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Policies
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {stats.active}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Policies
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pending Approval
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.expired}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Expired Policies
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search policies..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Policy Type</InputLabel>
                <Select
                  value={filters.policyType}
                  onChange={(e) => handleFilterChange('policyType', e.target.value)}
                  label="Policy Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="life">Life</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="travel">Travel</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {(user?.role === 'admin' || user?.role === 'agent') && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddPolicy}
                  >
                    Create Policy
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Policies Data Grid */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={policies}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: 'none'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewPolicy(selectedPolicy)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <MenuItem onClick={() => handleEditPolicy(selectedPolicy)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Policy
          </MenuItem>
        )}
        {user?.role === 'admin' && (
          <MenuItem
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Policy
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete policy {selectedPolicy?.policyNumber}?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Policy Form Modal */}
      <PolicyForm
        open={policyFormOpen}
        onClose={() => {
          setPolicyFormOpen(false);
          setEditingPolicy(null);
        }}
        policy={editingPolicy}
        onSuccess={handlePolicyFormSuccess}
      />

      {/* Policy Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Policy Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewingPolicy && (
            <Grid container spacing={3}>
              {/* Policy Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Policy Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Policy Number</Typography>
                <Typography variant="body1" fontWeight="medium">{viewingPolicy.policyNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Policy Type</Typography>
                <Chip
                  label={viewingPolicy.policyType?.charAt(0).toUpperCase() + viewingPolicy.policyType?.slice(1)}
                  color={getPolicyTypeColor(viewingPolicy.policyType)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Policy Name</Typography>
                <Typography variant="body1" fontWeight="medium">{viewingPolicy.policyName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Status</Typography>
                <Chip
                  label={viewingPolicy.status?.charAt(0).toUpperCase() + viewingPolicy.status?.slice(1)}
                  color={getStatusColor(viewingPolicy.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Description</Typography>
                <Typography variant="body1">{viewingPolicy.description}</Typography>
              </Grid>

              {/* Financial Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Financial Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Coverage Amount</Typography>
                <Typography variant="h6" color="success.main">
                  ₹{(viewingPolicy.coverageAmount || 0).toLocaleString('en-IN')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Premium Amount</Typography>
                <Typography variant="h6" color="warning.main">
                  ₹{(viewingPolicy.premiumAmount || 0).toLocaleString('en-IN')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Premium Frequency</Typography>
                <Typography variant="body1">
                  {viewingPolicy.premiumFrequency?.charAt(0).toUpperCase() + viewingPolicy.premiumFrequency?.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Duration</Typography>
                <Typography variant="body1">{viewingPolicy.duration} years</Typography>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Customer Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Customer Name</Typography>
                <Typography variant="body1">
                  {viewingPolicy.customer?.firstName} {viewingPolicy.customer?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{viewingPolicy.customer?.email}</Typography>
              </Grid>
              {viewingPolicy.customer?.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{viewingPolicy.customer?.phone}</Typography>
                </Grid>
              )}

              {/* Agent Information */}
              {viewingPolicy.agent && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Agent Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Agent Name</Typography>
                    <Typography variant="body1">
                      {viewingPolicy.agent?.firstName} {viewingPolicy.agent?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Agent Code</Typography>
                    <Typography variant="body1">{viewingPolicy.agent?.agentCode}</Typography>
                  </Grid>
                </>
              )}

              {/* Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Important Dates
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Start Date</Typography>
                <Typography variant="body1">
                  {new Date(viewingPolicy.startDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">End Date</Typography>
                <Typography variant="body1">
                  {new Date(viewingPolicy.endDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Next Payment Due</Typography>
                <Typography variant="body1">
                  {new Date(viewingPolicy.nextPaymentDue).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Created At</Typography>
                <Typography variant="body1">
                  {new Date(viewingPolicy.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Terms & Conditions
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {viewingPolicy.terms}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEditPolicy(viewingPolicy);
              }}
            >
              Edit Policy
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PolicyList;
