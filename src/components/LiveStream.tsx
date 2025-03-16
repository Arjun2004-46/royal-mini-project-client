import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, Alert } from '@mui/material';
import io from 'socket.io-client';

const LiveStream: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleFrame = useCallback((frame: string) => {
    if (imageRef.current && isStreaming) {
      imageRef.current.src = `data:image/jpeg;base64,${frame}`;
    }
  }, [isStreaming]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setError('Connection to server lost');
    });

    socket.on('video_frame', handleFrame);

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to video stream');
      setIsConnected(false);
    });

    return () => {
      socket.off('video_frame', handleFrame);
      socket.disconnect();
    };
  }, [handleFrame]);

  const handleStreamToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsStreaming(event.target.checked);
    if (!event.target.checked && imageRef.current) {
      imageRef.current.src = '';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Live Stream
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isStreaming}
              onChange={handleStreamToggle}
              color="primary"
              disabled={!isConnected}
            />
          }
          label={isStreaming ? "Stream Active" : "Stream Paused"}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ width: '100%', position: 'relative', backgroundColor: '#1a1a1a', minHeight: '400px' }}>
        <img
          ref={imageRef}
          alt="Live Stream"
          style={{
            width: '100%',
            height: 'auto',
            filter: !isStreaming ? 'grayscale(100%)' : 'none',
            opacity: !isStreaming ? 0.5 : 1,
            display: 'block',
          }}
        />
        {(!isStreaming || !isConnected) && (
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {!isConnected ? 'Connecting to Stream...' : 'Stream Paused'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default LiveStream; 