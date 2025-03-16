import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import '../mobile.css';
import IncidentsList from './IncidentsList';

const Incidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: '1200px', margin: '0 auto' }} className="mobile-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} className="mobile-header">
        <Typography variant="h5" sx={{ mb: { xs: 1, sm: 0 } }}>
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
          className="mobile-search"
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>
      
      <IncidentsList searchTerm={searchTerm} />
    </Paper>
  );
};

export default Incidents; 