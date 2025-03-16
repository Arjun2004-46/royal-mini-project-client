import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Notification, notificationService } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '500px',
    maxWidth: '800px',
  },
}));

interface NotificationModalProps {
  notification: Notification;
  open: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  open,
  onClose,
}) => {
  const { dispatch } = useNotifications();

  const handleAcknowledge = async () => {
    try {
      await notificationService.acknowledgeNotification(notification.id);
      dispatch({ type: 'ACKNOWLEDGE_NOTIFICATION', payload: notification.id });
      onClose();
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

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {notification.type === 'fire_alert' ? 'Fire Alert' : notification.type === 'fall_alert' ? 'Fall Alert' : 'Test Alert'}
          </Typography>
          <Chip
            label={notification.data.severity?.toUpperCase() || 'Unknown'}
            color={getSeverityColor(notification.data.severity || 'low')}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Message
          </Typography>
          <Typography>{notification.data.message || 'N/A'}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Timestamp
          </Typography>
          <Typography>
            {new Date(notification.timestamp).toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!notification.acknowledged && (
          <Button
            onClick={handleAcknowledge}
            variant="contained"
            color="primary"
          >
            Acknowledge
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
}; 