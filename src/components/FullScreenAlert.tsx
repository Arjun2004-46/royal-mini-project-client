import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useTheme,
  Divider,
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
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[24],
  '@keyframes slideIn': {
    '0%': { transform: 'translateY(-20px)', opacity: 0 },
    '100%': { transform: 'translateY(0)', opacity: 1 },
  },
}));

const AlertHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const AlertTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const AlertBody = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const AlertMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const AlertTimestamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const AlertActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
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
        <AlertHeader>
          <AlertTitle variant="h5">
            {notification.type === 'fire_alert' ? '🚨 Fire Alert' : notification.type === 'fall_alert' ? '⚠️ Fall Alert' : '🔔 Test Alert'}
          </AlertTitle>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </AlertHeader>

        <Divider sx={{ mb: 3 }} />

        <AlertBody>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography
              variant="subtitle1"
              sx={{
                color: getSeverityColor(notification.data.severity || 'low'),
                fontWeight: 600,
              }}
            >
              {notification.data.severity?.toUpperCase() || 'Unknown'} Severity
            </Typography>
          </Box>
          <AlertMessage variant="body1">
            {notification.data.message}
          </AlertMessage>
          <AlertTimestamp>
            {new Date(notification.timestamp).toLocaleString()}
          </AlertTimestamp>
        </AlertBody>

        <AlertActions>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
              },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={onAcknowledge}
            color="primary"
            sx={{
              backgroundColor: getSeverityColor(notification.data.severity || 'low'),
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? theme.palette.primary.dark
                  : theme.palette.primary.main,
              },
            }}
          >
            Acknowledge
          </Button>
        </AlertActions>
      </AlertContent>
    </Overlay>
  );
}; 