import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    purchasePrice: '',
    supplier: '',
    expiryDate: '',
    location: '',
    minimumStock: '',
    notes: ''
  });

  // Sample inventory data with Tokyo hotel pricing
  const sampleInventoryData = [
    {
      id: 1,
      name: 'Wagyu Beef A5',
      category: 'Protein',
      quantity: 2.5,
      unit: 'kg',
      purchasePrice: 18000,
      supplier: 'Tokyo Premium Meats',
      expiryDate: '2025-08-15',
      location: 'Walk-in Cooler A',
      minimumStock: 1,
      notes: 'Premium grade for special occasions',
      lastUpdated: '2025-08-11'
    },
    {
      id: 2,
      name: 'Fresh Uni (Sea Urchin)',
      category: 'Seafood',
      quantity: 12,
      unit: 'pieces',
      purchasePrice: 450,
      supplier: 'Tsukiji Fish Market',
      expiryDate: '2025-08-12',
      location: 'Seafood Cooler',
      minimumStock: 6,
      notes: 'Daily delivery, Grade A',
      lastUpdated: '2025-08-11'
    },
    {
      id: 3,
      name: 'Koshihikari Rice',
      category: 'Grains',
      quantity: 25,
      unit: 'kg',
      purchasePrice: 120,
      supplier: 'Niigata Rice Co.',
      expiryDate: '2026-03-01',
      location: 'Dry Storage',
      minimumStock: 10,
      notes: 'Premium short-grain rice',
      lastUpdated: '2025-08-10'
    },
    {
      id: 4,
      name: 'Shiitake Mushrooms',
      category: 'Vegetables',
      quantity: 3,
      unit: 'kg',
      purchasePrice: 800,
      supplier: 'Fresh Farm Tokyo',
      expiryDate: '2025-08-14',
      location: 'Vegetable Cooler',
      minimumStock: 2,
      notes: 'Organic, locally grown',
      lastUpdated: '2025-08-11'
    },
    {
      id: 5,
      name: 'Soy Sauce (Premium)',
      category: 'Condiments',
      quantity: 6,
      unit: 'bottles',
      purchasePrice: 340,
      supplier: 'Kikkoman Direct',
      expiryDate: '2026-08-01',
      location: 'Pantry Shelf B',
      minimumStock: 3,
      notes: '18-month aged, 1.8L bottles',
      lastUpdated: '2025-08-09'
    }
  ];

  const categories = ['all', 'Protein', 'Seafood', 'Vegetables', 'Grains', 'Condiments', 'Dairy', 'Spices', 'Beverages'];
  const units = ['kg', 'g', 'pieces', 'bottles', 'cans', 'liters', 'ml', 'boxes', 'bags'];
  const locations = ['Walk-in Cooler A', 'Walk-in Cooler B', 'Seafood Cooler', 'Vegetable Cooler', 'Freezer A', 'Freezer B', 'Dry Storage', 'Pantry Shelf A', 'Pantry Shelf B', 'Wine Cellar'];

  useEffect(() => {
    // Load sample data on component mount
    setInventory(sampleInventoryData);
    setFilteredInventory(sampleInventoryData);
  }, []);

  useEffect(() => {
    // Filter inventory based on search and category
    let filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, selectedCategory, inventory]);

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        purchasePrice: '',
        supplier: '',
        expiryDate: '',
        location: '',
        minimumStock: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      // Update existing item
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id
          ? { ...formData, id: editingItem.id, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      );
      setInventory(updatedInventory);
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: Math.max(...inventory.map(i => i.id), 0) + 1,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setInventory([...inventory, newItem]);
    }
    handleCloseDialog();
  };

  const handleDeleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'error', label: 'Expired' };
    if (daysUntilExpiry <= 2) return { status: 'critical', color: 'error', label: `${daysUntilExpiry} days` };
    if (daysUntilExpiry <= 7) return { status: 'warning', color: 'warning', label: `${daysUntilExpiry} days` };
    return { status: 'good', color: 'success', label: `${daysUntilExpiry} days` };
  };

  const getStockStatus = (quantity, minimumStock) => {
    const ratio = quantity / minimumStock;
    if (ratio <= 0.5) return { status: 'critical', color: 'error', label: 'Critical' };
    if (ratio <= 1) return { status: 'low', color: 'warning', label: 'Low Stock' };
    return { status: 'good', color: 'success', label: 'In Stock' };
  };

  const calculateInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minimumStock);
  };

  const getExpiringItems = () => {
    return inventory.filter(item => {
      const status = getExpiryStatus(item.expiryDate);
      return status.status === 'critical' || status.status === 'warning';
    });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <RestaurantIcon sx={{ fontSize: 40 }} />
        Professional Kitchen Inventory
      </Typography>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Total Items</Typography>
                  <Typography variant="h5">{inventory.length}</Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Inventory Value</Typography>
                  <Typography variant="h5">¥{calculateInventoryValue().toLocaleString()}</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Low Stock Items</Typography>
                  <Typography variant="h5" color="warning.main">{getLowStockItems().length}</Typography>
                </Box>
                <ShoppingCartIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Expiring Soon</Typography>
                  <Typography variant="h5" color="error.main">{getExpiringItems().length}</Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {getLowStockItems().length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Low stock alert: {getLowStockItems().map(item => item.name).join(', ')}
        </Alert>
      )}

      {getExpiringItems().length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Items expiring soon: {getExpiringItems().map(item => item.name).join(', ')}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Inventory" />
          <Tab label="Low Stock" />
          <Tab label="Expiring Soon" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Search and Filter Controls */}
          <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Inventory Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Purchase Price</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate);
                  const stockStatus = getStockStatus(item.quantity, item.minimumStock);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        {item.notes && (
                          <Typography variant="caption" color="textSecondary">
                            {item.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        ¥{item.purchasePrice.toLocaleString()}/{item.unit}
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <Chip
                          label={expiryStatus.label}
                          color={expiryStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteItem(item.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Low Stock Items</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Minimum Stock</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getLowStockItems().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.minimumStock} {item.unit}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" startIcon={<ShoppingCartIcon />}>
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Items Expiring Soon</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Days Remaining</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getExpiringItems().map((item) => {
                    const expiryStatus = getExpiryStatus(item.expiryDate);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.expiryDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={expiryStatus.label}
                            color={expiryStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small" color="warning">
                            Use First
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.slice(1).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unit"
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Purchase Price (¥)"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Storage Location</InputLabel>
                <Select
                  value={formData.location}
                  label="Storage Location"
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Stock Level"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {editingItem ? 'Update' : 'Add'} Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default InventoryPage;
