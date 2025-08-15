import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  Inventory as InventoryIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  EventNote as ReservationIcon
} from '@mui/icons-material';

// Import your existing pages
import DashboardPage from './pages/DashboardPage';
import ChefVaultPage from './pages/ChefVaultPage';
import InventoryPage from './pages/InventoryPage';
import MenusPage from './pages/MenusPage';
import ReservationsPage from './pages/ReservationsPage';
import CalendarPage from './pages/CalendarPage';

// Import the new modern theme
import { miseaiTheme } from './theme/theme';

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
          bgcolor: '#1A1F2E',
          borderRight: '2px solid #4ECDC4',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
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
                color: currentPath === item.path ? '#4ECDC4' : '#ffffff',
                bgcolor: currentPath === item.path ? 'rgba(78, 205, 196, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(78, 205, 196, 0.05)',
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
    <ThemeProvider theme={miseaiTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F1419' }}>
          <Sidebar currentPath={currentPath} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: '#0F1419',
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
