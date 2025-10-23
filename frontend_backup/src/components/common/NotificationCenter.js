import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Assignment as ClaimIcon,
  Policy as PolicyIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/apiService';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAll({ limit: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_due':
      case 'payment_overdue':
      case 'payment_received':
        return <PaymentIcon color="primary" />;
      case 'claim_submitted':
      case 'claim_updated':
      case 'claim_approved':
      case 'claim_rejected':
        return <ClaimIcon color="secondary" />;
      case 'policy_created':
      case 'policy_expiring':
      case 'policy_renewed':
        return <PolicyIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderLeft: !notification.isRead ? 3 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    sx: { fontWeight: 600 }
                  }}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTimestamp(notification.createdAt)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority)}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      </Box>
                    </React.Fragment>
                  }
                  secondaryTypographyProps={{ component: 'span' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={handleClose}>
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
