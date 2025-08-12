import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Chip, Divider,
  LinearProgress, Alert, Stack
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  RestaurantMenu as RestaurantMenuIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Thermostat as ThermostatIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 18, condition: 'Light Rain', icon: '🌧️' });
  const [currentCovers, setCurrentCovers] = useState(45);
  const [alertsOpen, setAlertsOpen] = useState(true);

  // Kitchen performance metrics
  const [kitchenMetrics, setKitchenMetrics] = useState({
    avgTicketTime: 18, // minutes
    ordersPerHour: 32,
    kitchenTemp: 28, // celsius
    passTemp: 65, // celsius for hot pass
    equipmentStatus: {
      oven1: 'operational',
      oven2: 'operational',
      oven3: 'warning', // temperature variance
      grill: 'operational',
      fryer1: 'operational',
      fryer2: 'maintenance',
      dishwasher: 'operational'
    }
  });

  // Live orders simulation
  const [liveOrders, setLiveOrders] = useState([
    { id: 1, table: 12, items: 3, timeElapsed: 8, status: 'prep', priority: 'high' },
    { id: 2, table: 7, items: 2, timeElapsed: 15, status: 'cooking', priority: 'normal' },
    { id: 3, table: 23, items: 4, timeElapsed: 22, status: 'plating', priority: 'normal' },
    { id: 4, table: 5, items: 1, timeElapsed: 3, status: 'prep', priority: 'low' }
  ]);

  // Performance data for charts
  const [performanceData, setPerformanceData] = useState({
    hourlyCovers: [8, 12, 15, 18, 25, 35, 42, 38, 33, 28, 22, 15],
    ticketTimes: [15, 18, 22, 16, 19, 25, 18, 17, 20, 16, 18, 19]
  });

  // Get live data from localStorage
  const inventory = (() => {
    try { return JSON.parse(localStorage.getItem("inventory")) || []; } catch { return []; }
  })();

  const reservations = (() => {
    try { return JSON.parse(localStorage.getItem("reservations")) || []; } catch { return []; }
  })();

  const staff = (() => {
    try { return JSON.parse(localStorage.getItem("staff")) || [
      { name: "Takeshi", position: "Sous Chef", status: "on-shift", shift: "14:00-22:00" },
      { name: "Yuki", position: "Line Cook", status: "on-shift", shift: "14:00-22:00" },
      { name: "Maria", position: "Garde Manger", status: "on-shift", shift: "13:00-21:00" },
      { name: "Chen", position: "Pastry", status: "called-sick", shift: "12:00-20:00" },
      { name: "Antonio", position: "Prep Cook", status: "on-shift", shift: "10:00-18:00" },
      { name: "Kenji", position: "Dishwasher", status: "called-sick", shift: "16:00-24:00" }
    ]; } catch { return []; }
  })();

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Update live orders
      setLiveOrders(prev => prev.map(order => ({
        ...order,
        timeElapsed: order.timeElapsed + 1,
        priority: order.timeElapsed > 20 ? 'high' : order.timeElapsed > 15 ? 'normal' : 'low'
      })));

      // Update kitchen metrics occasionally
      if (Math.random() < 0.1) {
        setKitchenMetrics(prev => ({
          ...prev,
          kitchenTemp: prev.kitchenTemp + (Math.random() - 0.5) * 2,
          avgTicketTime: Math.max(12, prev.avgTicketTime + (Math.random() - 0.5) * 2),
          ordersPerHour: Math.max(15, prev.ordersPerHour + (Math.random() - 0.5) * 4)
        }));
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Get today's data
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Today's reservations
  const todayReservations = reservations.filter(r => {
    if (!r.date) return false;
    const resDate = new Date(r.date).toISOString().split('T')[0];
    return resDate === today;
  });

  // Critical alerts
  const criticalInventory = inventory.filter(item =>
    item.quantity <= item.minimumStock * 0.5
  );

  const allergyReservations = todayReservations.filter(r => r.allergies);
  const equipmentIssues = Object.entries(kitchenMetrics.equipmentStatus)
    .filter(([, status]) => status !== 'operational');

  const onShiftStaff = staff.filter(s => s.status === 'on-shift').length;
  const totalStaff = staff.length;

  // Service timing calculations
  const getServicePhase = () => {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    if (currentMinutes < 10 * 60) return { phase: 'Prep Phase', next: 'Breakfast Service', timeToNext: (10 * 60) - currentMinutes };
    if (currentMinutes < 11 * 60) return { phase: 'Breakfast Service', next: 'Lunch Prep', timeToNext: (11 * 60) - currentMinutes };
    if (currentMinutes < 14 * 60) return { phase: 'Lunch Prep', next: 'Lunch Service', timeToNext: (14 * 60) - currentMinutes };
    if (currentMinutes < 16 * 60) return { phase: 'Lunch Service', next: 'Break Time', timeToNext: (16 * 60) - currentMinutes };
    if (currentMinutes < 17 * 60) return { phase: 'Break Time', next: 'Dinner Prep', timeToNext: (17 * 60) - currentMinutes };
    if (currentMinutes < 18 * 60) return { phase: 'Dinner Prep', next: 'Dinner Service', timeToNext: (18 * 60) - currentMinutes };
    if (currentMinutes < 22 * 60) return { phase: 'Dinner Service', next: 'Closing', timeToNext: (22 * 60) - currentMinutes };
    return { phase: 'Closing', next: 'Prep Phase', timeToNext: (24 * 60 + 10 * 60) - currentMinutes };
  };

  const serviceInfo = getServicePhase();
  const timeToNextHours = Math.floor(serviceInfo.timeToNext / 60);
  const timeToNextMinutes = serviceInfo.timeToNext % 60;

  // Japanese holidays check
  const getHolidayAlert = () => {
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay(); // 0 = Sunday

    // September holidays
    if (month === 8) { // September (0-indexed)
      if (date >= 15 && date <= 21 && day === 1) { // Third Monday of September
        return { name: 'Respect for the Aged Day', impact: '+25% expected covers', type: 'holiday' };
      }
      if (date >= 22 && date <= 23) {
        return { name: 'Autumnal Equinox', impact: '+15% expected covers', type: 'holiday' };
      }
    }

    // Check for weekend impact
    if (day === 5 || day === 6) { // Friday or Saturday
      return { name: 'Weekend Rush', impact: '+30% expected covers', type: 'weekend' };
    }

    return null;
  };

  const holidayAlert = getHolidayAlert();

  // Chart configurations
  const hourlyCoversChart = {
    labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
    datasets: [
      {
        label: 'Covers per Hour',
        data: performanceData.hourlyCovers,
        borderColor: '#00ffc3',
        backgroundColor: 'rgba(0, 255, 195, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const ticketTimesChart = {
    labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
    datasets: [
      {
        label: 'Avg Ticket Time (min)',
        data: performanceData.ticketTimes,
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#333333'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#333333'
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: "auto", bgcolor: '#121212', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#1a1a1a", border: "2px solid #00ffc3" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ color: "#00ffc3", fontWeight: 700 }}>
              🔥 MiseAI Kitchen Command Center
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Kitchen Operations
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Live Clock */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 'bold', fontFamily: 'monospace' }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Weather */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: "#fff" }}>
                {weather.icon} {weather.temp}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tokyo - {weather.condition}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Kitchen Status */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: kitchenMetrics.kitchenTemp > 30 ? "#ff4444" : "#00ffc3" }}>
                🌡️ {Math.round(kitchenMetrics.kitchenTemp)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kitchen Temp
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Critical Alerts Section - Enhanced */}
      {(criticalInventory.length > 0 || allergyReservations.length > 0 || equipmentIssues.length > 0 || onShiftStaff < totalStaff * 0.8 || holidayAlert) && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#1a0000", border: "3px solid #ff4444", borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: "#ff4444", display: 'flex', alignItems: 'center', gap: 1 }}>
              🚨 CRITICAL OPERATIONS ALERTS
            </Typography>
            <IconButton onClick={() => setAlertsOpen(!alertsOpen)} sx={{ color: "#ff4444" }}>
              {alertsOpen ? '▼' : '▶'}
            </IconButton>
          </Box>

          {alertsOpen && (
            <Grid container spacing={2}>
              {/* Allergy Alerts */}
              {allergyReservations.map((res, i) => (
                <Grid item xs={12} md={6} key={`allergy-${i}`}>
                  <Alert severity="error" sx={{ bgcolor: "#330000", color: "#ff6666" }}>
                    <Typography fontWeight="bold">
                      🚨 SEVERE ALLERGY: {res.name} - {res.allergies}
                    </Typography>
                    <Typography variant="body2">
                      {res.guests} guests • {new Date(res.date).toLocaleString()} • PREP AREA ISOLATION REQUIRED
                    </Typography>
                  </Alert>
                </Grid>
              ))}

              {/* Equipment Issues */}
              {equipmentIssues.map(([equipment, status], i) => (
                <Grid item xs={12} md={6} key={`equipment-${i}`}>
                  <Alert severity="warning" sx={{ bgcolor: "#331100", color: "#ff8800" }}>
                    <Typography fontWeight="bold">
                      ⚙️ EQUIPMENT: {equipment.toUpperCase()} - {status.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {status === 'warning' ? 'Temperature variance detected' : 'Requires immediate maintenance'}
                    </Typography>
                  </Alert>
                </Grid>
              ))}

              {/* Critical Inventory */}
              {criticalInventory.slice(0, 2).map((item, i) => (
                <Grid item xs={12} md={6} key={`inventory-${i}`}>
                  <Alert severity="warning" sx={{ bgcolor: "#331100", color: "#ff8800" }}>
                    <Typography fontWeight="bold">
                      📦 CRITICAL STOCK: {item.name}
                    </Typography>
                    <Typography variant="body2">
                      Only {item.quantity} {item.unit} remaining • Reorder immediately
                    </Typography>
                  </Alert>
                </Grid>
              ))}

              {/* Staffing Alert */}
              {onShiftStaff < totalStaff * 0.8 && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ bgcolor: "#001133", color: "#4488ff" }}>
                    <Typography fontWeight="bold">
                      👥 STAFFING CRITICAL: {onShiftStaff}/{totalStaff} staff on shift ({Math.round((onShiftStaff/totalStaff)*100)}%)
                    </Typography>
                    <Typography variant="body2">
                      Missing: {staff.filter(s => s.status === 'called-sick').map(s => `${s.name} (${s.position})`).join(', ')}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      )}

      {/* Live Kitchen Operations */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Live Orders */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, bgcolor: "#232323", borderRadius: 2, height: '400px' }}>
            <Typography variant="h6" sx={{ color: "#00ffc3", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🔥 LIVE KITCHEN ORDERS
            </Typography>

            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {liveOrders.map((order) => (
                <Box key={order.id} sx={{
                  p: 2, mb: 2, borderRadius: 2,
                  bgcolor: order.priority === 'high' ? '#2a0000' : order.priority === 'normal' ? '#1a1a1a' : '#0a2a0a',
                  border: `2px solid ${order.priority === 'high' ? '#ff4444' : order.priority === 'normal' ? '#ff8800' : '#44ff44'}`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{
                      color: order.priority === 'high' ? '#ff4444' : order.priority === 'normal' ? '#ff8800' : '#44ff44',
                      fontWeight: 'bold'
                    }}>
                      TABLE {order.table} • {order.items} ITEMS
                    </Typography>
                    <Chip
                      label={`${order.timeElapsed} MIN`}
                      color={order.timeElapsed > 20 ? 'error' : order.timeElapsed > 15 ? 'warning' : 'success'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                      Status: {order.status}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={order.status === 'prep' ? 25 : order.status === 'cooking' ? 60 : 90}
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                      color={order.priority === 'high' ? 'error' : order.priority === 'normal' ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {/* Current Performance */}
            <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>⚡ CURRENT PERFORMANCE</Typography>
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 'bold' }}>
                {Math.round(kitchenMetrics.avgTicketTime)} MIN
              </Typography>
              <Typography variant="body2" color="text.secondary">Average Ticket Time</Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, 100 - (kitchenMetrics.avgTicketTime - 12) * 5)}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={kitchenMetrics.avgTicketTime > 25 ? 'error' : kitchenMetrics.avgTicketTime > 20 ? 'warning' : 'success'}
              />
            </Paper>

            {/* Orders per Hour */}
            <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#ff8800", mb: 1 }}>📊 ORDERS/HOUR</Typography>
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 'bold' }}>
                {Math.round(kitchenMetrics.ordersPerHour)}
              </Typography>
              <Typography variant="body2" color="text.secondary">Current Rate</Typography>
              <LinearProgress
                variant="determinate"
                value={(kitchenMetrics.ordersPerHour / 50) * 100}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color="warning"
              />
            </Paper>

            {/* Equipment Status Summary */}
            <Paper sx={{ p: 3, bgcolor: "#232323" }}>
              <Typography variant="h6" sx={{ color: "#4488ff", mb: 1 }}>⚙️ EQUIPMENT STATUS</Typography>
              {Object.entries(kitchenMetrics.equipmentStatus).map(([equipment, status]) => (
                <Box key={equipment} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                    {equipment}
                  </Typography>
                  <Chip
                    size="small"
                    label={status}
                    color={status === 'operational' ? 'success' : status === 'warning' ? 'warning' : 'error'}
                    icon={status === 'operational' ? <CheckCircleIcon /> : status === 'warning' ? <WarningIcon /> : <ErrorIcon />}
                  />
                </Box>
              ))}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Service Status Cards - Enhanced */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center", borderRadius: 2, boxShadow: "0 4px 20px #00ffc333" }}>
            <Typography color="primary" fontWeight="bold" variant="h6">CURRENT SERVICE</Typography>
            <Typography fontSize="1.8rem" fontWeight={700} sx={{ color: "#00ffc3" }}>
              {serviceInfo.phase}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next: {serviceInfo.next} in {timeToNextHours > 0 && `${timeToNextHours}h `}{timeToNextMinutes}m
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center", borderRadius: 2, boxShadow: "0 4px 20px #4caf5033" }}>
            <Typography color="success.main" fontWeight="bold" variant="h6">COVERS TODAY</Typography>
            <Typography fontSize="1.8rem" fontWeight={700} sx={{ color: "#4caf50" }}>
              {currentCovers}/150
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round((currentCovers / 150) * 100)}% capacity
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(currentCovers / 150) * 100}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
              color="success"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center", borderRadius: 2, boxShadow: `0 4px 20px ${onShiftStaff < totalStaff * 0.8 ? '#ff444433' : '#2196f333'}` }}>
            <Typography color={onShiftStaff < totalStaff * 0.8 ? "error.main" : "info.main"} fontWeight="bold" variant="h6">STAFF ON SHIFT</Typography>
            <Typography fontSize="1.8rem" fontWeight={700} sx={{ color: onShiftStaff < totalStaff * 0.8 ? "#ff4444" : "#2196f3" }}>
              {onShiftStaff}/{totalStaff}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round((onShiftStaff / totalStaff) * 100)}% staffed
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(onShiftStaff / totalStaff) * 100}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
              color={onShiftStaff < totalStaff * 0.8 ? "error" : "info"}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: "#232323", textAlign: "center", borderRadius: 2, boxShadow: "0 4px 20px #ff980033" }}>
            <Typography color="warning.main" fontWeight="bold" variant="h6">RESERVATIONS TODAY</Typography>
            <Typography fontSize="1.8rem" fontWeight={700} sx={{ color: "#ff9800" }}>
              {todayReservations.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {allergyReservations.length} with allergies
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#232323", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#00ffc3", mb: 2 }}>
              📈 Hourly Covers Today
            </Typography>
            <Box sx={{ height: 250 }}>
              <Line data={hourlyCoversChart} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#232323", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#ff6b35", mb: 2 }}>
              ⏱️ Average Ticket Times
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar data={ticketTimesChart} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Today's Operations Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#232323", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#00ffc3", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              📋 Today's Reservations ({todayReservations.length})
            </Typography>

            {todayReservations.length === 0 ? (
              <Typography color="text.secondary">No reservations for today</Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {todayReservations
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((res, i) => (
                    <Box key={i} sx={{
                      p: 2, mb: 1, borderRadius: 2,
                      bgcolor: res.allergies ? "#2a1100" : "#1a1a1a",
                      border: res.allergies ? "2px solid #ff8800" : "1px solid #333"
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight="bold" sx={{ color: res.allergies ? "#ff8800" : "#fff" }}>
                          {res.allergies && '⚠️ '}{res.name}
                        </Typography>
                        <Chip
                          label={new Date(res.date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                          size="small"
                          color={res.allergies ? "warning" : "default"}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {res.guests} guests • {res.outlet}
                      </Typography>
                      {res.allergies && (
                        <Typography variant="body2" sx={{ color: "#ff8800", fontWeight: 'bold' }}>
                          🚨 ALLERGIES: {res.allergies}
                        </Typography>
                      )}
                    </Box>
                  ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#232323", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#00ffc3", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              👥 Staff Status ({onShiftStaff}/{totalStaff} on duty)
            </Typography>

            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {staff.map((person, i) => (
                <Box key={i} sx={{
                  p: 2, mb: 1, borderRadius: 2,
                  bgcolor: person.status === 'called-sick' ? "#1a0000" : "#1a1a1a",
                  border: `2px solid ${person.status === 'called-sick' ? '#ff4444' : '#00ffc3'}`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight="bold" sx={{
                      color: person.status === 'called-sick' ? "#ff4444" : "#00ffc3"
                    }}>
                      {person.status === 'called-sick' ? '🚫 ' : '✅ '}{person.name}
                    </Typography>
                    <Chip
                      label={person.status === 'on-shift' ? 'ON DUTY' : 'SICK'}
                      size="small"
                      color={person.status === 'on-shift' ? "success" : "error"}
                      icon={person.status === 'on-shift' ? <CheckCircleIcon /> : <ErrorIcon />}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {person.position} • {person.shift}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Emergency Action Center */}
      <Paper sx={{ p: 3, bgcolor: "#1a1a1a", border: "2px solid #ff6b35", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: "#ff6b35", mb: 2, textAlign: 'center' }}>
          🚨 EMERGENCY ACTION CENTER
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              startIcon={<>🚨</>}
              onClick={() => alert('EMERGENCY PROTOCOL ACTIVATED\n\n• All stations alerted\n• Management notified\n• Emergency procedures initiated')}
              sx={{ height: 60, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              EMERGENCY ALERT
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              size="large"
              startIcon={<>📞</>}
              component={Link}
              to="/staff"
              sx={{ height: 60, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              CALL BACKUP STAFF
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              size="large"
              startIcon={<>📋</>}
              component={Link}
              to="/inventory"
              sx={{ height: 60, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              CRITICAL INVENTORY
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              startIcon={<>🔧</>}
              onClick={() => alert('MAINTENANCE REQUEST SENT\n\n• Engineering department notified\n• Equipment technician dispatched\n• Backup equipment ready')}
              sx={{ height: 60, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              MAINTENANCE REQUEST
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
