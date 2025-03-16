import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import type { Notification } from '../services/api';

const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
}));

const AlertContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '600px',
  width: '90%',
  position: 'relative',
  animation: 'slideIn 0.3s ease-in-out',
  '@keyframes slideIn': {
    '0%': { transform: 'translateY(-20px)', opacity: 0 },
    '100%': { transform: 'translateY(0)', opacity: 1 },
  },
}));

interface FullScreenAlertProps {
  notification: Notification;
  onClose: () => void;
  onAcknowledge: () => void;
}

export const FullScreenAlert: React.FC<FullScreenAlertProps> = ({
  notification,
  onClose,
  onAcknowledge,
}) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play alert sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Failed to play sound:', error);
      });
    }

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Show desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${notification.type === 'fire_alert' ? 'Fire' : notification.type === 'fall_alert' ? 'Fall' : 'Test'} Alert`, {
        body: `Message: ${notification.data.message}\nSeverity: ${notification.data.severity?.toUpperCase() || 'Unknown'}`,
        icon: notification.type === 'fire_alert' ? '/icons/fire-icon.png' : notification.type === 'fall_alert' ? '/icons/fall-icon.png' : '/icons/test-icon.png',
      });
    }
  }, [notification]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Overlay>
      <audio
        ref={audioRef}
        src={notification.type === 'fire_alert' ? '/sounds/fire_alert.wav' : '/sounds/fall_alert.wav'}
      />
      <AlertContent elevation={24}>
        <IconButton
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            {notification.type === 'fire_alert' ? '🚨 Fire Alert' : notification.type === 'fall_alert' ? '⚠️ Fall Alert' : '🔔 Test Alert'}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: getSeverityColor(notification.data.severity || 'low'),
              fontWeight: 'bold',
            }}
          >
            {notification.data.severity?.toUpperCase() || 'Unknown'} Severity
          </Typography>
        </Box>
        <Box mb={4}>
          <Typography variant="body1" paragraph>
            {notification.data.message}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Time: {new Date(notification.timestamp).toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={onAcknowledge}
            size="large"
          >
            Acknowledge
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            size="large"
          >
            Close
          </Button>
        </Box>
      </AlertContent>
    </Overlay>
  );
}; 