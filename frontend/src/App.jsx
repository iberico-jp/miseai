import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  Inventory as InventoryIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,  // ✅ Fixed
  EventNote as ReservationIcon     // ✅ Better icon for reservations
} from '@mui/icons-material';

// Import your existing pages
import DashboardPage from './pages/DashboardPage';
import ChefVaultPage from './pages/ChefVaultPage';
import InventoryPage from './pages/InventoryPage';
import MenusPage from './pages/MenusPage';
import ReservationsPage from './pages/ReservationsPage';
import CalendarPage from './pages/CalendarPage';

// MiseAI Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffc3',
    },
    secondary: {
      main: '#ff6b35',
    },
    error: {
      main: '#ff4444',
    },
    warning: {
      main: '#ff8800',
    },
    info: {
      main: '#4488ff',
    },
    success: {
      main: '#44ff44',
    },
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const drawerWidth = 240;

// Sidebar Navigation
const Sidebar = ({ currentPath }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Chef\'s Vault', icon: <MenuBookIcon />, path: '/vault' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Menus', icon: <RestaurantIcon />, path: '/menus' },
    { text: 'Reservations', icon: <ReservationIcon />, path: '/reservations' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1a1a1a',
          borderRight: '2px solid #00ffc3',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ color: '#00ffc3', fontWeight: 'bold' }}>
          🔥 MiseAI
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component="a"
              href={item.path}
              sx={{
                color: currentPath === item.path ? '#00ffc3' : '#ffffff',
                bgcolor: currentPath === item.path ? 'rgba(0, 255, 195, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(0, 255, 195, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

function App() {
  // Get current path for sidebar highlighting
  const currentPath = window.location.pathname;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#121212' }}>
          <Sidebar currentPath={currentPath} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: '#121212',
              minHeight: '100vh',
            }}
          >
            <Routes>
              {/* Default route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Main application routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/vault" element={<ChefVaultPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/menus" element={<MenusPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />

              {/* Catch-all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
