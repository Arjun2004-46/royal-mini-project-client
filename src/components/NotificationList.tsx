import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Notification, notificationService } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationModal } from './NotificationModal';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)',
  },
  border: `1px solid ${theme.palette.divider}`,
  transition: 'background-color 0.2s ease-in-out',
}));

export const NotificationList: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleModalClose = () => {
    setSelectedNotification(null);
  };

  const handleAcknowledge = async (notification: Notification) => {
    try {
      await notificationService.acknowledgeNotification(notification.id);
      dispatch({ type: 'ACKNOWLEDGE_NOTIFICATION', payload: notification.id });
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderNotificationItem = (notification: Notification) => (
    <StyledListItem
      key={notification.id}
      onClick={() => handleNotificationClick(notification)}
    >
      <ListItemIcon>
        {notification.type === 'fire_alert' ? (
          <LocalFireDepartmentIcon color="error" />
        ) : (
          <AccessibilityNewIcon color="primary" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1">
              {notification.type === 'fire_alert' ? 'Fire Alert' : notification.type === 'fall_alert' ? 'Fall Alert' : 'Test Alert'}
            </Typography>
            <Chip
              label={notification.data.severity?.toUpperCase() || 'Unknown'}
              color={getSeverityColor(notification.data.severity || 'low')}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {new Date(notification.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {notification.data.message}
            </Typography>
          </Box>
        }
      />
      {!notification.acknowledged && (
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            aria-label="acknowledge"
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening the modal when clicking the button
              handleAcknowledge(notification);
            }}
          >
            <CheckCircleIcon color="primary" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </StyledListItem>
  );

  return (
    <Box>
      <StyledPaper>
        <Typography variant="h6" gutterBottom>
          Pending Notifications
        </Typography>
      </StyledPaper>

      <List>
        {state.pendingNotifications.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography color="textSecondary">
              No pending notifications
            </Typography>
          </Box>
        ) : (
          state.pendingNotifications.map(renderNotificationItem)
        )}
      </List>

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          open={!!selectedNotification}
          onClose={handleModalClose}
        />
      )}
    </Box>
  );
}; 