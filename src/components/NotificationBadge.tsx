import React from 'react';
import { Badge, IconButton, styled } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../contexts/NotificationContext';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

interface NotificationBadgeProps {
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick }) => {
  const { state } = useNotifications();
  const { pendingNotifications } = state;

  return (
    <IconButton 
      color="inherit" 
      onClick={onClick}
      sx={{
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <StyledBadge
        badgeContent={pendingNotifications.length}
        color="error"
        max={99}
      >
        <NotificationsIcon />
      </StyledBadge>
    </IconButton>
  );
}; 