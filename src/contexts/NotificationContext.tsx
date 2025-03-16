import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification, notificationService, incidentService } from '../services/api';

interface NotificationState {
  pendingNotifications: Notification[];
  historicalNotifications: Notification[];
  isSoundEnabled: boolean;
  isPolling: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'SET_PENDING_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_HISTORICAL_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_PENDING_NOTIFICATION'; payload: Notification }
  | { type: 'ACKNOWLEDGE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'SET_POLLING_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: NotificationState = {
  pendingNotifications: [],
  historicalNotifications: [],
  isSoundEnabled: true,
  isPolling: false,
  error: null,
};

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | null>(null);

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_PENDING_NOTIFICATIONS':
      return { ...state, pendingNotifications: action.payload };
    case 'SET_HISTORICAL_NOTIFICATIONS':
      return { ...state, historicalNotifications: action.payload };
    case 'ADD_PENDING_NOTIFICATION':
      return {
        ...state,
        pendingNotifications: [...state.pendingNotifications, action.payload],
      };
    case 'ACKNOWLEDGE_NOTIFICATION':
      return {
        ...state,
        pendingNotifications: state.pendingNotifications.filter(
          (n) => n.id !== action.payload
        ),
        historicalNotifications: state.historicalNotifications.map(
          (n) => n.id === action.payload ? { ...n, acknowledged: true } : n
        ),
      };
    case 'TOGGLE_SOUND':
      return { ...state, isSoundEnabled: action.payload };
    case 'SET_POLLING_STATUS':
      return { ...state, isPolling: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollNotifications = async () => {
      try {
        dispatch({ type: 'SET_POLLING_STATUS', payload: true });
        const notifications = await notificationService.getPendingNotifications();
        dispatch({ type: 'SET_PENDING_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch notifications' });
      } finally {
        dispatch({ type: 'SET_POLLING_STATUS', payload: false });
      }
    };

    const startPolling = () => {
      pollNotifications();
      pollInterval = setInterval(pollNotifications, 5000);
    };

    startPolling();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 