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
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Grid,
  Paper,
  Tooltip,
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
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  BusinessCenter as AgentIcon,
  Person as CustomerIcon
} from '@mui/icons-material';
import { userService } from '../../services/apiService';
import UserForm from './UserForm';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    totalActive: 0,
    totalInactive: 0,
    totalPending: 0,
    roleStats: { admin: 0, agent: 0, customer: 0 }
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(filters);
      const usersData = response.data.users || response.data;
      setUsers(usersData);

      // Calculate stats from users data
      const totalActive = usersData.filter(u => u.isActive).length;
      const totalInactive = usersData.filter(u => !u.isActive).length;
      const roleStats = usersData.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: usersData.length,
        totalActive,
        totalInactive,
        totalPending: 0,
        roleStats
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      showSnackbar('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormOpen(true);
    handleMenuClose();
  };

  const handleUserFormClose = () => {
    setUserFormOpen(false);
    setEditingUser(null);
  };

  const handleUserFormSuccess = () => {
    loadUsers();
    showSnackbar(editingUser ? 'User updated successfully' : 'User created successfully');
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      await userService.update(userId, { isActive });
      showSnackbar(`User ${newStatus} successfully`);
      loadUsers();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update user status', 'error');
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.delete(selectedUser._id);
      showSnackbar('User deleted successfully');
      loadUsers();
      setDeleteDialogOpen(false);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
    }
    handleMenuClose();
  };

  const handleBulkStatusChange = async (status) => {
    try {
      const isActive = status === 'active';
      await userService.bulkUpdateStatus(selectedRows, isActive);
      showSnackbar(`${selectedRows.length} users updated successfully`);
      setSelectedRows([]);
      loadUsers();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update users', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'agent': return <AgentIcon fontSize="small" />;
      case 'customer': return <CustomerIcon fontSize="small" />;
      default: return <PeopleIcon fontSize="small" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'agent': return 'primary';
      case 'customer': return 'info';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 70,
      renderCell: (params) => (
        <Avatar sx={{ width: 32, height: 32 }}>
          {params.row.firstName[0]}{params.row.lastName[0]}
        </Avatar>
      ),
      sortable: false,
      filterable: false
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.email}
          </Typography>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={getRoleIcon(params.value)}
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getRoleColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.value ? 'active' : 'inactive';
        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size="small"
            color={getStatusColor(status)}
            variant="filled"
          />
        );
      }
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Join Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : '-'}
        </Typography>
      )
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'Never'}
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
        onClick={loadUsers}
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
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {stats.totalActive}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.totalPending}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pending Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.totalInactive}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Inactive Users
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
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
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
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {selectedRows.length > 0 && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleBulkStatusChange('active')}
                    >
                      Activate ({selectedRows.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBulkStatusChange('inactive')}
                    >
                      Deactivate ({selectedRows.length})
                    </Button>
                  </>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                >
                  Add User
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Data Grid */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={setSelectedRows}
            getRowId={(row) => row._id}
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
        <MenuItem onClick={() => handleEditUser(selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        {selectedUser?.isActive ? (
          <MenuItem onClick={() => handleStatusChange(selectedUser._id, 'inactive')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleStatusChange(selectedUser._id, 'active')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user {selectedUser?.firstName} {selectedUser?.lastName}?
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

      {/* User Form Modal */}
      <UserForm
        open={userFormOpen}
        onClose={handleUserFormClose}
        user={editingUser}
        onSuccess={handleUserFormSuccess}
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

export default UserList;