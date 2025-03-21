import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, Alert, CircularProgress, Badge } from '@mui/material';
import io, { ManagerOptions, SocketOptions } from 'socket.io-client';
import { STREAMING_URL } from '../config';
import '../mobile.css';

interface FrameData {
  frame: string;
  timestamp: number;
  frame_number: number;
  incident_detected?: boolean;
}

interface IncidentData {
  timestamp: number;
  message: string;
}

const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  transports: ['websocket'],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  forceNew: true,
  autoConnect: true
};

const LiveStream = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const [incidentCount, setIncidentCount] = useState(0);
  const [lastIncidentTime, setLastIncidentTime] = useState<number | null>(null);
  const frameBuffer = useRef<FrameData[]>([]);
  const lastFrameNumber = useRef<number>(-1);
  const frameRequestPending = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);
  const incidentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processNextFrame = useCallback(() => {
    if (!isStreaming || frameBuffer.current.length === 0 || !imageRef.current) {
      frameRequestPending.current = false;
      return;
    }

    const frame = frameBuffer.current.shift();
    if (frame) {
      if (imageRef.current) {
        const img = new Image();
        img.onload = () => {
          if (imageRef.current) {
            imageRef.current.src = img.src;
            setIsLoading(false);
            
            if (frame.incident_detected) {
              handleIncidentDetection();
            }
            
            frameRequestPending.current = false;
            requestAnimationFrame(() => scheduleNextFrame());
          }
        };
        img.onerror = () => {
          console.error('Failed to load frame');
          frameRequestPending.current = false;
          scheduleNextFrame();
        };
        img.src = `data:image/jpeg;base64,${frame.frame}`;
      }
    } else {
      frameRequestPending.current = false;
      scheduleNextFrame();
    }
  }, [isStreaming]);

  const handleIncidentDetection = useCallback(() => {
    setIncidentCount(prev => prev + 1);
    
    setIncidentDetected(true);
    setLastIncidentTime(Date.now());
    
    if (incidentTimeoutRef.current) {
      clearTimeout(incidentTimeoutRef.current);
    }
    
    incidentTimeoutRef.current = setTimeout(() => {
      setIncidentDetected(false);
    }, 5000);
  }, []);

  const scheduleNextFrame = useCallback(() => {
    if (!frameRequestPending.current && isStreaming) {
      frameRequestPending.current = true;
      rafId.current = window.requestAnimationFrame(processNextFrame);
    }
  }, [processNextFrame, isStreaming]);

  const handleFrame = useCallback((data: FrameData) => {
    if (!isStreaming) return;

    if (data.frame_number <= lastFrameNumber.current) {
      return;
    }
    lastFrameNumber.current = data.frame_number;

    frameBuffer.current.push(data);
    
    while (frameBuffer.current.length > 3) {
      frameBuffer.current.shift();
    }

    if (!frameRequestPending.current) {
      scheduleNextFrame();
    }
  }, [isStreaming, scheduleNextFrame]);

  const handleIncident = useCallback((data: IncidentData) => {
    handleIncidentDetection();
    console.log('Incident detected:', data);
  }, [handleIncidentDetection]);

  useEffect(() => {
    const socket = io(STREAMING_URL, {
      ...SOCKET_OPTIONS,
      auth: {
        token: undefined
      },
      ackTimeout: 30000,
      retries: 3
    });
    let reconnectAttempts = 0;
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
      frameBuffer.current = [];
      lastFrameNumber.current = -1;
      reconnectAttempts = 0;
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setError('Connection to server lost');
      setIsLoading(true);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      
      frameBuffer.current = [];
      lastFrameNumber.current = -1;
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      reconnectAttempts++;
      setError(`Failed to connect to video stream (Attempt ${reconnectAttempts})`);
      setIsConnected(false);
      setIsLoading(true);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Stream error occurred');
    });

    socket.on('video_frame', handleFrame);
    socket.on('incident_detected', handleIncident);

    return () => {
      socket.off('video_frame', handleFrame);
      socket.off('incident_detected', handleIncident);
      socket.disconnect();
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (incidentTimeoutRef.current) {
        clearTimeout(incidentTimeoutRef.current);
      }
      frameBuffer.current = [];
    };
  }, [handleFrame, handleIncident]);

  const handleStreamToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsStreaming(event.target.checked);
    if (!event.target.checked && imageRef.current) {
      imageRef.current.src = '';
      frameBuffer.current = [];
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      frameRequestPending.current = false;
      setIsLoading(true);
    } else if (event.target.checked) {
      scheduleNextFrame();
    }
  };

  const formattedIncidentTime = lastIncidentTime 
    ? new Date(lastIncidentTime).toLocaleTimeString() 
    : null;

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: '1200px', margin: '0 auto' }} className="mobile-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} className="mobile-header">
        <Typography variant="h5" sx={{ mb: { xs: 1, sm: 0 } }}>
          <Badge 
            color="error" 
            badgeContent={incidentCount > 0 ? incidentCount : undefined}
            sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem' } }}
          >
            Live Stream
          </Badge>
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
      
      {incidentDetected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Incident Detected!</strong> {formattedIncidentTime && ` at ${formattedIncidentTime}`}
        </Alert>
      )}
      
      <Box sx={{ 
        width: '100%', 
        position: 'relative', 
        backgroundColor: '#1a1a1a', 
        minHeight: { xs: '250px', sm: '400px' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: incidentDetected ? '3px solid #f44336' : 'none',
        transition: 'border 0.3s ease-in-out'
      }}>
        <img
          ref={imageRef}
          alt="Live Stream"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: !isStreaming ? 'grayscale(100%)' : 'none',
            opacity: !isStreaming ? 0.5 : 1,
            display: isLoading ? 'none' : 'block',
          }}
        />
        {(isLoading || !isConnected) && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {!isConnected ? 'Connecting to Stream...' : isLoading ? 'Loading Stream...' : 'Stream Paused'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {incidentCount > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total incidents detected: {incidentCount}
            {lastIncidentTime && ` (Last: ${formattedIncidentTime})`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LiveStream; 