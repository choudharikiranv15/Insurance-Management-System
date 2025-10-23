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
  Snackbar,
  LinearProgress
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
  Assignment as AssignIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { claimService } from '../../services/apiService';
import ClaimForm from './ClaimForm';
import { useAuth } from '../../context/AuthContext';

const ClaimList = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    claimType: 'all',
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await claimService.getAll(filters);
      const claimsData = response.data.claims || response.data;
      setClaims(claimsData);

      // Calculate stats
      const submitted = claimsData.filter(c => c.status === 'submitted').length;
      const underReview = claimsData.filter(c => c.status === 'under_review').length;
      const approved = claimsData.filter(c => c.status === 'approved').length;
      const rejected = claimsData.filter(c => c.status === 'rejected').length;

      setStats({
        total: claimsData.length,
        submitted,
        underReview,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Failed to load claims:', error);
      showSnackbar('Failed to load claims', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [filters.claimType, filters.status, filters.priority, filters.search]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMenuClick = (event, claim) => {
    setAnchorEl(event.currentTarget);
    setSelectedClaim(claim);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedClaim immediately - it's needed for dialogs
  };

  const handleAddClaim = () => {
    setEditingClaim(null);
    setClaimFormOpen(true);
  };

  const handleEditClaim = (claim) => {
    setEditingClaim(claim);
    setClaimFormOpen(true);
    handleMenuClose();
  };

  const handleViewClaim = (claim) => {
    // Could navigate to detailed view
    console.log('View claim:', claim);
    handleMenuClose();
  };

  const handleStatusChange = (status) => {
    setNewStatus(status);
    setStatusNotes('');
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusConfirm = async () => {
    if (!selectedClaim || !selectedClaim._id) {
      showSnackbar('No claim selected', 'error');
      setStatusDialogOpen(false);
      return;
    }

    try {
      console.log('Updating claim status:', {
        claimId: selectedClaim._id,
        newStatus,
        notes: statusNotes
      });

      const response = await claimService.updateStatus(selectedClaim._id, newStatus, statusNotes);

      console.log('Status update response:', response);

      showSnackbar(`Claim ${newStatus.replace('_', ' ')} successfully`);
      loadClaims();
      setStatusDialogOpen(false);
      setSelectedClaim(null);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      console.error('Status update error:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to update claim status';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClaim || !selectedClaim._id) {
      showSnackbar('No claim selected', 'error');
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await claimService.delete(selectedClaim._id);
      showSnackbar('Claim deleted successfully');
      loadClaims();
      setDeleteDialogOpen(false);
      setSelectedClaim(null);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to delete claim', 'error');
    }
  };

  const handleClaimFormSuccess = () => {
    loadClaims();
    showSnackbar(editingClaim ? 'Claim updated successfully' : 'Claim submitted successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'investigating': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'closed': return 'default';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getClaimTypeLabel = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns = [
    {
      field: 'claimNumber',
      headerName: 'Claim Number',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'policy',
      headerName: 'Policy',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.policyNumber || 'N/A'}
        </Typography>
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
      field: 'claimType',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getClaimTypeLabel(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'claimAmount',
      headerName: 'Amount',
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
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          size="small"
          color={getStatusColor(params.value)}
          variant="filled"
        />
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getPriorityColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'incidentDate',
      headerName: 'Incident Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'reportedDate',
      headerName: 'Reported',
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
        onClick={loadClaims}
      >
        Refresh
      </Button>
    </GridToolbarContainer>
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Claims
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {stats.submitted}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Submitted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.underReview}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Under Review
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {stats.approved}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Approved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.rejected}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Rejected
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
                placeholder="Search claims..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Claim Type</InputLabel>
                <Select
                  value={filters.claimType}
                  onChange={(e) => handleFilterChange('claimType', e.target.value)}
                  label="Claim Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="death">Death</MenuItem>
                  <MenuItem value="disability">Disability</MenuItem>
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="accident">Accident</MenuItem>
                  <MenuItem value="property_damage">Property Damage</MenuItem>
                  <MenuItem value="theft">Theft</MenuItem>
                  <MenuItem value="fire">Fire</MenuItem>
                  <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
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
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddClaim}
                >
                  File Claim
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Claims Data Grid */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={claims}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar,
              loadingOverlay: LinearProgress
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
        <MenuItem onClick={() => handleViewClaim(selectedClaim)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {user?.role !== 'customer' && selectedClaim?.status === 'submitted' && (
          <MenuItem onClick={() => handleStatusChange('under_review')}>
            <AssignIcon fontSize="small" sx={{ mr: 1 }} />
            Start Review
          </MenuItem>
        )}
        {user?.role === 'admin' && ['under_review', 'investigating'].includes(selectedClaim?.status) && (
          <>
            <MenuItem onClick={() => handleStatusChange('approved')}>
              <ApproveIcon fontSize="small" sx={{ mr: 1 }} color="success" />
              Approve Claim
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('rejected')}>
              <RejectIcon fontSize="small" sx={{ mr: 1 }} color="error" />
              Reject Claim
            </MenuItem>
          </>
        )}
        {(user?.role === 'admin' || selectedClaim?.customer?._id === user?.id) && (
          <MenuItem onClick={() => handleEditClaim(selectedClaim)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Claim
          </MenuItem>
        )}
        {user?.role === 'admin' && (
          <MenuItem
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Claim
          </MenuItem>
        )}
      </Menu>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedClaim(null);
          setNewStatus('');
          setStatusNotes('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Claim Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Change status to: <strong>{newStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            placeholder="Add notes about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStatusDialogOpen(false);
            setSelectedClaim(null);
            setNewStatus('');
            setStatusNotes('');
          }}>Cancel</Button>
          <Button
            onClick={handleStatusConfirm}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedClaim(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete claim {selectedClaim?.claimNumber}?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setSelectedClaim(null);
          }}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Claim Form Modal */}
      <ClaimForm
        open={claimFormOpen}
        onClose={() => {
          setClaimFormOpen(false);
          setEditingClaim(null);
        }}
        claim={editingClaim}
        onSuccess={handleClaimFormSuccess}
      />

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

export default ClaimList;
