import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Incident {
  uuid: string;
  timestamp: string;
  type: string;
  confidence: number;
  image: string;
  description?: string;
  location?: string;
}

const IncidentDetail: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidentDetail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/incidents/${uuid}`);
        setIncident(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load incident details');
        console.error('Error fetching incident details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchIncidentDetail();
    }
  }, [uuid]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !incident) {
    return (
      <Paper elevation={3} sx={{ p: 3, m: 2 }} className="mobile-container">
        <Typography color="error" gutterBottom>{error || 'Incident not found'}</Typography>
        <Button 
          onClick={() => navigate('/incidents')} 
          startIcon={<ArrowBack />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Incidents
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, m: 2 }} className="mobile-container">
      <Box sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/incidents')} 
          sx={{ mb: 2 }}
          aria-label="back to incidents"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1" gutterBottom>
          Incident Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Type
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {incident.type}
              <Chip
                label={`${(incident.confidence * 100).toFixed(1)}%`}
                color={incident.confidence > 0.7 ? 'error' : 'warning'}
                size="small"
              />
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Timestamp
            </Typography>
            <Typography variant="body1">
              {new Date(incident.timestamp).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Incident ID
            </Typography>
            <Typography variant="body1" sx={{ 
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              p: 1,
              borderRadius: 1
            }}>
              {incident.uuid}
            </Typography>
          </Box>

          {incident.location && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                {incident.location}
              </Typography>
            </Box>
          )}

          {incident.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {incident.description}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: { xs: '250px', sm: '400px' },
              backgroundColor: '#1a1a1a',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {incident.image ? (
              <img
                src={`${API_BASE_URL}/api/incidents/files/${incident.image}`}
                alt={`Incident: ${incident.type}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography color="text.secondary">No image available</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IncidentDetail; 