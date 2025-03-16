import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Container, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LiveStream from './components/LiveStream';
import Incidents from './components/Incidents';
import IncidentDetail from './components/IncidentDetail';
import './mobile.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Live Stream', path: '/' },
    { text: 'Incidents', path: '/incidents' },
  ];

  const drawer = (
    <List sx={{ color: theme.palette.text.primary }}>
      {menuItems.map((item) => (
        <ListItem 
          key={item.text} 
          component={Link} 
          to={item.path}
          onClick={handleDrawerToggle}
          sx={{ 
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
            color: theme.palette.text.primary,
          }}
        >
          <ListItemText 
            primary={item.text}
            sx={{
              '& .MuiListItemText-primary': {
                color: theme.palette.text.primary,
              }
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
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
                Smart CCTV Dashboard
              </Typography>
              {!isMobile && (
                <Box>
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}
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
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 1, sm: 3 } }}>
            <Routes>
              <Route path="/" element={<LiveStream />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:uuid" element={<IncidentDetail />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
