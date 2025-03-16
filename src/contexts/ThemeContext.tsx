import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#b3b3b3' : '#666666',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === 'dark' ? '#121212' : '#f5f5f5',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 