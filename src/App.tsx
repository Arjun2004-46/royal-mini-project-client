import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Container,
  useTheme as useMuiTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import WarningIcon from '@mui/icons-material/Warning';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomePage from './components/HomePage';
import LiveStreamPage from './components/LiveStreamPage';
import Incidents from './components/Incidents';
import IncidentDetail from './components/IncidentDetail';
import './mobile.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, useTheme as useCustomTheme } from './contexts/ThemeContext';
import NotificationSystem from './components/NotificationSystem';

const menuItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'Live Stream', path: '/live', icon: <LiveTvIcon /> },
  { text: 'Incidents', path: '/incidents', icon: <WarningIcon /> },
];

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useCustomTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem
          key={item.text}
          component={Link}
          to={item.path}
          onClick={handleDrawerToggle}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Smart CCTV
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <>
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{
                        mx: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </>
              )}
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                sx={{
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              backgroundColor: muiTheme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Box sx={{ flexGrow: 1, mt: 0 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/live" element={<LiveStreamPage />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:uuid" element={<IncidentDetail />} />
          </Routes>
        </Box>
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
          <NotificationSystem />
        </Box>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;

