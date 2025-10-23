import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Policy,
  Payment,
  Assignment,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';

const ActivityTimeline = ({ activities, title = "Recent System Activity" }) => {
  const theme = useTheme();

  // Sample data if none provided
  const defaultActivities = [
    {
      id: 1,
      type: 'user_registration',
      description: 'New customer registered',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed'
    },
    {
      id: 2,
      type: 'policy_created',
      description: 'New life insurance policy created',
      user: 'Agent Smith',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'completed'
    },
    {
      id: 3,
      type: 'payment_received',
      description: 'Premium payment received',
      user: 'Jane Smith',
      amount: '$1,200',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'completed'
    },
    {
      id: 4,
      type: 'claim_submitted',
      description: 'Insurance claim submitted',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'pending'
    },
    {
      id: 5,
      type: 'claim_approved',
      description: 'Claim approved and processed',
      user: 'Admin',
      amount: '$5,000',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed'
    },
    {
      id: 6,
      type: 'claim_rejected',
      description: 'Claim rejected due to insufficient documentation',
      user: 'Admin',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'rejected'
    }
  ];

  const activityData = activities || defaultActivities;

  const getActivityIcon = (type) => {
    const iconMap = {
      user_registration: <PersonAdd />,
      policy_created: <Policy />,
      payment_received: <Payment />,
      claim_submitted: <Assignment />,
      claim_approved: <CheckCircle />,
      claim_rejected: <Cancel />
    };
    return iconMap[type] || <Schedule />;
  };

  const getActivityColor = (type, status) => {
    if (status === 'rejected') return 'error';
    if (status === 'pending') return 'warning';

    const colorMap = {
      user_registration: 'primary',
      policy_created: 'success',
      payment_received: 'info',
      claim_submitted: 'warning',
      claim_approved: 'success',
      claim_rejected: 'error'
    };
    return colorMap[type] || 'default';
  };

  const getStatusChip = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'success' },
      pending: { label: 'Pending', color: 'warning' },
      rejected: { label: 'Rejected', color: 'error' }
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };

    return (
      <Chip
        label={statusInfo.label}
        size="small"
        color={statusInfo.color}
        variant="outlined"
      />
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {activityData.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                borderLeft: `3px solid ${theme.palette[getActivityColor(activity.type, activity.status)].main}`,
                ml: 1,
                mb: 1,
                backgroundColor: theme.palette.background.default,
                borderRadius: 1
              }}
            >
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type, activity.status)}.main`,
                    width: 32,
                    height: 32
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" component="span">
                      {activity.description}
                    </Typography>
                    {getStatusChip(activity.status)}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {activity.user}
                      {activity.amount && (
                        <Typography component="span" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {activity.amount}
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;