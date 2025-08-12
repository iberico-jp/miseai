import React from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { Today, Schedule, Event, Notifications } from '@mui/icons-material';

const CalendarPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", fontWeight: 700, mb: 3 }}>
        📆 Kitchen Calendar System
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, bgcolor: "#232323", textAlign: 'center', minHeight: 400 }}>
            <Today sx={{ fontSize: 80, color: '#ff6b35', mb: 2 }} />
            <Typography variant="h5" sx={{ color: "#ff6b35", mb: 2 }}>
              Comprehensive Kitchen Scheduling
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Master calendar system for staff scheduling, event planning, inventory deliveries,
              equipment maintenance, and seasonal menu transitions.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={Link}
                to="/reservations"
                sx={{ bgcolor: '#00ffc3', color: '#000', '&:hover': { bgcolor: '#00cc9f' } }}
                startIcon={<Event />}
              >
                View Reservations
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
                  <Schedule sx={{ color: '#00ffc3', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00ffc3' }}>
                    Staff Scheduling
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Advanced shift planning and coverage management
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
                <CardContent>
                  <Notifications sx={{ color: '#ff8800', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#ff8800' }}>
                    Event Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Special events and seasonal menu coordination
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

export default CalendarPage;
