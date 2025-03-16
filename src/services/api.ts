import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';

export interface Notification {
  id: string;
  type: 'fall_alert' | 'fire_alert' | 'test_alert';
  timestamp: number;
  acknowledged: boolean;
  ack_time: string | null;
  data: {
    message: string;
    severity: 'low' | 'medium' | 'high';
  };
}

export interface Incident {
  uuid: string;
  type: 'fire' | 'fall';
  timestamp: string;
  location: string;
  imageUrl?: string;
  metadata: {
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    description?: string;
  };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationService = {
  getPendingNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/notifications/pending');
    return response.data;
  },

  acknowledgeNotification: async (notificationId: string): Promise<void> => {
    await api.post(`/api/notifications/${notificationId}/acknowledge`);
  },

  getNotificationHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: 'fire' | 'fall' | 'test_alert';
    startDate?: string;
    endDate?: string;
  }): Promise<{ notifications: Notification[]; total: number }> => {
    const response = await api.get('/api/notifications/history', { params });
    return response.data;
  },
};

export const incidentService = {
  getIncidents: async (): Promise<Incident[]> => {
    const response = await api.get('/api/incidents');
    return response.data;
  },

  getIncidentDetails: async (incidentUuid: string): Promise<Incident> => {
    const response = await api.get(`/api/incidents/${incidentUuid}`);
    return response.data;
  },
}; 