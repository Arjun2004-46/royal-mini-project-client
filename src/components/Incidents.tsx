import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Visibility, Search } from '@mui/icons-material';
import axios from 'axios';

interface Incident {
  id: string;
  timestamp: string;
  type: string;
  confidence: number;
  image_path: string;
}

const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/incidents');
        setIncidents(response.data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = incidents.filter(incident =>
    incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(incident.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Incident History
        </Typography>
        <TextField
          size="small"
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>
      <List>
        {filteredIncidents.map((incident) => (
          <ListItem
            key={incident.id}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemText
              primary={`Incident: ${incident.type}`}
              secondary={new Date(incident.timestamp).toLocaleString()}
              sx={{ mr: 2 }}
            />
            <Chip
              label={`${(incident.confidence * 100).toFixed(1)}%`}
              color={incident.confidence > 0.7 ? 'error' : 'warning'}
              size="small"
              sx={{ mr: 2 }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="view">
                <Visibility />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Incidents; 