/**
 * Header Component
 * Top navigation bar with app title and WebSocket status
 */

import React from 'react';
import { AppBar, Toolbar, Typography, Chip, Box } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

const Header = () => {
  const { wsConnected } = useApp();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Task Board
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon 
            sx={{ 
              fontSize: 12, 
              color: wsConnected ? '#4caf50' : '#f44336'
            }} 
          />
          <Typography variant="body2" sx={{ color: 'white' }}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
