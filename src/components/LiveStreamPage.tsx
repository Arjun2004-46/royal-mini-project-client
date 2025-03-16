import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import LiveStream from './LiveStream';

const LiveStreamPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Live Surveillance Feed
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Real-time monitoring with AI-powered threat detection
        </Typography>
      </Box>
      
      <Paper 
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 2
        }}
      >
        <LiveStream />
      </Paper>
    </Container>
  );
};

export default LiveStreamPage; 