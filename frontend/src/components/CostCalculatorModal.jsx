import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const METRIC_UNITS = [
  'piece', 'gram', 'kg', 'litre', 'ml', 'cup', 'tbsp', 'tsp',
  'bunch', 'clove', 'slice', 'fillet', 'portion'
];

const CostCalculatorModal = ({ recipe, onClose, onSave }) => {
  const [ingredients, setIngredients] = useState([]);
  const [costData, setCostData] = useState({
    ingredientCost: 0,
    laborCost: 0,
    totalCost: 0,
    costPerServing: 0
  });
  const [servings, setServings] = useState(recipe?.servings || 4);

  useEffect(() => {
    if (recipe) {
      const parsedIngredients = parseIngredients(recipe);
      setIngredients(parsedIngredients);
      calculateCosts(parsedIngredients, servings);
    }
  }, [recipe, servings]);

  const parseIngredients = (recipe) => {
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.map((ing, index) => ({
        id: Date.now() + index, // Better unique ID
        name: typeof ing === 'string' ? ing : (ing.name || ''),
        quantity: typeof ing === 'object' ? (ing.quantity || 1) : 1,
        unit: typeof ing === 'object' ? (ing.unit || 'piece') : 'piece',
        price: typeof ing === 'object' ? (ing.price || 0) : 0
      })).filter(ing => ing.name.trim() !== ''); // Remove empty ingredients
    }

    // If no ingredients, start with one empty row
    return [createEmptyIngredient()];
  };

  const createEmptyIngredient = () => ({
    id: Date.now() + Math.random(),
    name: '',
    quantity: 1,
    unit: 'piece',
    price: 0
  });

  const calculateCosts = (ingredientList, servingCount) => {
    let totalIngredientCost = 0;

    ingredientList.forEach(ingredient => {
      const qty = parseFloat(ingredient.quantity) || 0;
      const price = parseFloat(ingredient.price) || 0;
      totalIngredientCost += (qty * price);
    });

    const laborCost = totalIngredientCost * 0.2;
    const totalCost = totalIngredientCost + laborCost;
    const costPerServing = servingCount > 0 ? totalCost / servingCount : 0;

    setCostData({
      ingredientCost: totalIngredientCost,
      laborCost: laborCost,
      totalCost: totalCost,
      costPerServing: costPerServing
    });
  };

  const handleIngredientUpdate = (index, field, value) => {
    const updatedIngredients = [...ingredients];

    if (field === 'price' || field === 'quantity') {
      const numericValue = value === '' ? 0 : parseFloat(value);
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: isNaN(numericValue) ? 0 : numericValue
      };
    } else {
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value
      };
    }

    setIngredients(updatedIngredients);
    calculateCosts(updatedIngredients, servings);
  };

  // IMPROVED: Add empty ingredient
  const addIngredient = () => {
    const newIngredient = createEmptyIngredient();
    setIngredients([...ingredients, newIngredient]);
  };

  // NEW: Delete specific ingredient
  const deleteIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(updatedIngredients);
      calculateCosts(updatedIngredients, servings);
    }
  };

  // NEW: Clear all ingredients
  const clearAllIngredients = () => {
    const emptyIngredients = [createEmptyIngredient()];
    setIngredients(emptyIngredients);
    calculateCosts(emptyIngredients, servings);
  };

  // NEW: Reset to original recipe ingredients
  const resetToOriginal = () => {
    const originalIngredients = parseIngredients(recipe);
    setIngredients(originalIngredients);
    calculateCosts(originalIngredients, servings);
  };

  const handleSave = () => {
    // Filter out empty ingredients before saving
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '');

    if (onSave && typeof onSave === 'function') {
      onSave({
        costData: costData,
        ingredients: validIngredients,
        servings: servings
      });
    }
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#1A1F2E',
          color: '#ffffff'
        }
      }}
      disableScrollLock={true}
      keepMounted={false}
    >
      <DialogTitle sx={{
        backgroundColor: '#1A1F2E',
        color: '#4ECDC4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Cost Analysis: {recipe?.prompt || 'Recipe'}
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#1A1F2E', color: '#ffffff' }}>
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 2 }}>
            Recipe Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                variant="outlined"
                fullWidth
                InputLabelProps={{ style: { color: '#ffffff' } }}
                InputProps={{ style: { color: '#ffffff' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#4ECDC4' },
                    '&:hover fieldset': { borderColor: '#4ECDC4' },
                    '&.Mui-focused fieldset': { borderColor: '#4ECDC4' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Created: {recipe?.date ? new Date(recipe.date).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ backgroundColor: '#374151', mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
              Ingredients & Pricing ({ingredients.filter(ing => ing.name.trim() !== '').length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Reset to original recipe">
                <IconButton
                  onClick={resetToOriginal}
                  size="small"
                  sx={{ color: '#FFB800' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear all ingredients">
                <IconButton
                  onClick={clearAllIngredients}
                  size="small"
                  sx={{ color: '#FF5722' }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Button
                startIcon={<AddIcon />}
                onClick={addIngredient}
                size="small"
                sx={{ color: '#4ECDC4' }}
              >
                Add Ingredient
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ backgroundColor: '#252A3A' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Ingredient</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Qty</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Unit</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Price (¥)</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Total (¥)</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', width: '50px' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredients.map((ingredient, index) => (
                  <TableRow key={ingredient.id || index}>
                    <TableCell sx={{ color: '#ffffff' }}>
                      <TextField
                        placeholder="Enter ingredient name..."
                        value={ingredient.name || ''}
                        onChange={(e) => handleIngredientUpdate(index, 'name', e.target.value)}
                        size="small"
                        variant="standard"
                        fullWidth
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: '#374151' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#4ECDC4' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#4ECDC4' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={ingredient.quantity || 0}
                        onChange={(e) => handleIngredientUpdate(index, 'quantity', e.target.value)}
                        size="small"
                        variant="standard"
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{
                          width: '60px',
                          '& .MuiInput-underline:before': { borderBottomColor: '#374151' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#4ECDC4' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#4ECDC4' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={ingredient.unit || 'piece'}
                          onChange={(e) => handleIngredientUpdate(index, 'unit', e.target.value)}
                          variant="standard"
                          sx={{
                            color: '#ffffff',
                            minWidth: '80px',
                            '& .MuiSelect-icon': { color: '#ffffff' },
                            '& .MuiInput-underline:before': { borderBottomColor: '#374151' },
                            '& .MuiInput-underline:hover:before': { borderBottomColor: '#4ECDC4' },
                            '& .MuiInput-underline:after': { borderBottomColor: '#4ECDC4' }
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#252A3A',
                                color: '#ffffff'
                              }
                            },
                            disableScrollLock: true
                          }}
                        >
                          {METRIC_UNITS.map((unit) => (
                            <MenuItem key={unit} value={unit} sx={{ color: '#ffffff' }}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={ingredient.price || 0}
                        onChange={(e) => handleIngredientUpdate(index, 'price', e.target.value)}
                        size="small"
                        variant="standard"
                        inputProps={{
                          step: "0.01",
                          min: "0",
                          style: { color: '#ffffff' }
                        }}
                        sx={{
                          width: '80px',
                          '& .MuiInput-underline:before': { borderBottomColor: '#374151' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#4ECDC4' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#4ECDC4' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                      ¥{((ingredient.quantity || 0) * (ingredient.price || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete ingredient">
                        <IconButton
                          onClick={() => deleteIngredient(index)}
                          size="small"
                          disabled={ingredients.length <= 1}
                          sx={{
                            color: ingredients.length <= 1 ? '#6B7280' : '#FF5722',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 87, 34, 0.1)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ backgroundColor: '#374151', mb: 3 }} />

        <Box>
          <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 2 }}>
            Cost Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ backgroundColor: '#252A3A', p: 2 }}>
                <Typography variant="body1" sx={{ color: '#ffffff' }}>
                  Ingredient Cost: <span style={{ color: '#4ECDC4' }}>¥{costData.ingredientCost.toFixed(2)}</span>
                </Typography>
                <Typography variant="body1" sx={{ color: '#ffffff' }}>
                  Labor Cost (20%): <span style={{ color: '#4ECDC4' }}>¥{costData.laborCost.toFixed(2)}</span>
                </Typography>
                <Typography variant="h6" sx={{ color: '#4ECDC4', mt: 1 }}>
                  Total Cost: ¥{costData.totalCost.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ backgroundColor: '#252A3A', p: 2 }}>
                <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
                  Cost Per Serving
                </Typography>
                <Typography variant="h4" sx={{ color: '#ffffff' }}>
                  ¥{costData.costPerServing.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: '#1A1F2E' }}>
        <Button onClick={onClose} sx={{ color: '#ffffff' }}>
          Close
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#4ECDC4', color: '#000000' }}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostCalculatorModal;
