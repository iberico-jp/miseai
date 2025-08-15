import React from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { EventNote, People, Warning, Schedule } from '@mui/icons-material';

const ReservationsPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", fontWeight: 700, mb: 3 }}>
        📅 Reservations Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, bgcolor: "#232323", textAlign: 'center', minHeight: 400 }}>
            <EventNote sx={{ fontSize: 80, color: '#ff6b35', mb: 2 }} />
            <Typography variant="h5" sx={{ color: "#ff6b35", mb: 2 }}>
              Advanced Reservation System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Complete reservation management with allergy tracking, table optimization,
              guest preferences, and real-time availability for professional dining operations.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={Link}
                to="/calendar"
                sx={{ bgcolor: '#00ffc3', color: '#000', '&:hover': { bgcolor: '#00cc9f' } }}
                startIcon={<Schedule />}
              >
                View Calendar
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/dashboard"
                sx={{ borderColor: '#ff6b35', color: '#ff6b35' }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
                <CardContent>
                  <People sx={{ color: '#00ffc3', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00ffc3' }}>
                    Guest Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete guest profiles and preference tracking
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
                <CardContent>
                  <Warning sx={{ color: '#ff4444', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#ff4444' }}>
                    Allergy Alerts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical allergy tracking and kitchen notifications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReservationsPage;
