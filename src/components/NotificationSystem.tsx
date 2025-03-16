import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationList } from './NotificationList';
import { NotificationBadge } from './NotificationBadge';
import { FullScreenAlert } from './FullScreenAlert';
import type { Notification } from '../services/api';
import { notificationService } from '../services/api';

const NotificationSystem: React.FC = () => {
  const { state, dispatch } = useNotifications();
  const [showList, setShowList] = React.useState(false);
  const [showFullScreenAlert, setShowFullScreenAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Notification | null>(null);
  const previousNotificationsRef = useRef<Set<string>>(new Set());
  const fireSoundRef = useRef<HTMLAudioElement | null>(null);
  const fallSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    fireSoundRef.current = new Audio('/sounds/fire_alert.wav');
    fallSoundRef.current = new Audio('/sounds/fall_alert.wav');
  }, []);

  // Handle desktop notifications and sound alerts
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission denied');
        }
      }
    };

    requestNotificationPermission();
  }, []);

  // Handle new notifications
  useEffect(() => {
    const currentNotifications = new Set(state.pendingNotifications.map(n => n.id));
    const newNotifications = state.pendingNotifications.filter(
      n => !previousNotificationsRef.current.has(n.id)
    );

    newNotifications.forEach(notification => {
      setCurrentAlert(notification);
      setShowFullScreenAlert(true);

      // Show desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${notification.type === 'fire_alert' ? 'Fire' : notification.type === 'fall_alert' ? 'Fall' : 'Test'} Alert`, {
          body: `Message: ${notification.data.message}\nSeverity: ${notification.data.severity?.toUpperCase() || 'Unknown'}`,
          icon: notification.type === 'fire_alert' ? '/icons/fire-icon.png' : notification.type === 'fall_alert' ? '/icons/fall-icon.png' : '/icons/test-icon.png',
        });
      }

      // Play sound alert
      if (state.isSoundEnabled) {
        const soundRef = notification.type === 'fire_alert' ? fireSoundRef.current : fallSoundRef.current;
        if (soundRef) {
          soundRef.currentTime = 0;
          soundRef.play().catch(error => {
            console.error('Failed to play sound:', error);
          });
        }
      }
    });

    previousNotificationsRef.current = currentNotifications;
  }, [state.pendingNotifications, state.isSoundEnabled]);

  const handleAcknowledgeAlert = async () => {
    if (currentAlert) {
      try {
        await notificationService.acknowledgeNotification(currentAlert.id);
        dispatch({ type: 'ACKNOWLEDGE_NOTIFICATION', payload: currentAlert.id });
        setShowFullScreenAlert(false);
        setCurrentAlert(null);
      } catch (error) {
        console.error('Failed to acknowledge notification:', error);
      }
    }
  };

  const handleCloseAlert = () => {
    setShowFullScreenAlert(false);
    setCurrentAlert(null);
  };

  const toggleSound = () => {
    dispatch({ type: 'TOGGLE_SOUND', payload: !state.isSoundEnabled });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <NotificationBadge onClick={() => setShowList(!showList)} />
        <Tooltip title={state.isSoundEnabled ? 'Mute notifications' : 'Unmute notifications'}>
          <IconButton onClick={toggleSound} color={state.isSoundEnabled ? 'primary' : 'default'}>
            {state.isSoundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {showList && <NotificationList />}

      {showFullScreenAlert && currentAlert && (
        <FullScreenAlert
          notification={currentAlert}
          onClose={handleCloseAlert}
          onAcknowledge={handleAcknowledgeAlert}
        />
      )}
    </Box>
  );
};

export default NotificationSystem; 