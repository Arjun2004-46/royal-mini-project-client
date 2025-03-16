import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Pagination,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const NotificationList: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useNotifications();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const fetchHistoricalNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationHistory({
        page,
        limit: ITEMS_PER_PAGE,
      });
      if (response && response.notifications) {
        dispatch({ type: 'SET_HISTORICAL_NOTIFICATIONS', payload: response.notifications });
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } else {
        console.error('Invalid response format from history endpoint');
        dispatch({ type: 'SET_HISTORICAL_NOTIFICATIONS', payload: [] });
      }
    } catch (error) {
      console.error('Failed to fetch historical notifications:', error);
      dispatch({ type: 'SET_HISTORICAL_NOTIFICATIONS', payload: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 1) {
      fetchHistoricalNotifications();
    }
  }, [page, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

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
      // If we're in the history tab, refresh the list
      if (tabValue === 1) {
        fetchHistoricalNotifications();
      }
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
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tab label="Pending" />
          <Tab label="History" />
        </Tabs>
      </StyledPaper>

      <TabPanel value={tabValue} index={0}>
        <List>
          {state.pendingNotifications.map(renderNotificationItem)}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : !state.historicalNotifications || state.historicalNotifications.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography color="textSecondary">
              No historical notifications found
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {state.historicalNotifications.map(renderNotificationItem)}
            </List>
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: theme.palette.text.primary,
                  },
                  '& .MuiPaginationItem-page.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                  '& .MuiPaginationItem-page:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              />
            </Box>
          </>
        )}
      </TabPanel>

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