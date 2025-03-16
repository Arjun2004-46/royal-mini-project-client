import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  ListItemSecondaryAction
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_BASE_URL } from '../config';

interface Incident {
  uuid: string;
  type: string;
  timestamp: string;
  confidence: number;
  image_path?: string;
}

interface IncidentsListProps {
  searchTerm?: string;
}

const IncidentsList: React.FC<IncidentsListProps> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/incidents`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch incidents: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setIncidents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
    
    // Set up polling to refresh incidents list every 10 seconds
    const intervalId = setInterval(fetchIncidents, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getIncidentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire':
        return <LocalFireDepartmentIcon color="error" />;
      case 'fall':
        return <AccessibilityIcon color="warning" />;
      default:
        return <WarningIcon color="info" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const handleViewIncident = (uuid: string) => {
    navigate(`/incidents/${uuid}`);
  };

  // Filter incidents based on searchTerm
  const filteredIncidents = incidents
    .filter(incident =>
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(incident.timestamp).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by timestamp, latest first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Detected Incidents
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredIncidents.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No incidents match your search.' : 'No incidents detected yet.'}
        </Alert>
      ) : (
        <List>
          {filteredIncidents.map((incident, index) => (
            <React.Fragment key={incident.uuid}>
              {index > 0 && <Divider />}
              <ListItem 
                alignItems="flex-start"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon>
                  {getIncidentIcon(incident.type)}
                </ListItemIcon>
                <ListItemText
                  primary={`${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {formatDate(incident.timestamp)}
                      </Typography>
                      {` — Confidence: ${(incident.confidence * 100).toFixed(1)}%`}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="view incident details"
                    onClick={() => handleViewIncident(incident.uuid)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default IncidentsList; 