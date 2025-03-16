import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import VideocamIcon from '@mui/icons-material/Videocam';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const HomePage = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <VideocamIcon sx={{ fontSize: 40 }} />,
      title: "Real-time Monitoring",
      description: "24/7 live video surveillance with advanced AI-powered detection"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Smart Detection",
      description: "Intelligent detection of potential safety threats and unusual activities"
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 40 }} />,
      title: "Instant Alerts",
      description: "Immediate notifications when potential safety concerns are detected"
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
          animation: `${pulse} 3s infinite ease-in-out`
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 4
          }}
        >
          AI-powered Child Safety Surveillance
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Protecting what matters most with cutting-edge AI technology
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            component={Link}
            to="/live"
            variant="contained"
            size="large"
            startIcon={<VideocamIcon />}
          >
            View Live Stream
          </Button>
          <Button
            component={Link}
            to="/incidents"
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
          >
            View Incidents History
          </Button>
        </Stack>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage; 