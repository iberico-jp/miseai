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
  TableRow
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Select, MenuItem, FormControl } from '@mui/material';

const METRIC_UNITS = [
  'piece', 'gram', 'kg', 'litre', 'ml', 'cup', 'tbsp', 'tsp',
  'bunch', 'clove', 'slice', 'fillet', 'portion'
];

const CostCalculatorModal = ({ recipe, onClose }) => {
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
    // Handle different ingredient formats
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.map((ing, index) => ({
        id: index,
        name: typeof ing === 'string' ? ing : (ing.name || `Ingredient ${index + 1}`),
        quantity: typeof ing === 'object' ? (ing.quantity || 1) : 1,
        unit: typeof ing === 'object' ? (ing.unit || 'piece') : 'piece',
        price: typeof ing === 'object' ? (ing.price || 0) : 0
      }));
    }

    // Default empty ingredients
    return [
      { id: 1, name: 'Add ingredient', quantity: 1, unit: 'piece', price: 0 }
    ];
  };

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

  // FIXED: Better handleIngredientUpdate function
  const handleIngredientUpdate = (index, field, value) => {
    console.log(`Updating ingredient ${index}, field: ${field}, value: ${value}`);

    const updatedIngredients = [...ingredients];

    if (field === 'price' || field === 'quantity') {
      // Handle numeric fields properly
      const numericValue = value === '' ? 0 : parseFloat(value);
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: isNaN(numericValue) ? 0 : numericValue
      };
    } else {
      // Handle text fields
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value
      };
    }

    console.log('Updated ingredient:', updatedIngredients[index]);

    setIngredients(updatedIngredients);
    calculateCosts(updatedIngredients, servings);
  };

  const addIngredient = () => {
    const newIngredient = {
      id: ingredients.length + 1,
      name: 'New ingredient',
      quantity: 1,
      unit: 'piece',
      price: 0
    };
    setIngredients([...ingredients, newIngredient]);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff'
        }
      }}
      // FIXED: Prevent scroll lock issues
      disableScrollLock={true}
      keepMounted={false}
    >
      <DialogTitle sx={{
        backgroundColor: '#1a1a1a',
        color: '#00ff88',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Cost Analysis: {recipe?.prompt || 'Recipe'}
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
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
                    '& fieldset': { borderColor: '#00ff88' },
                    '&:hover fieldset': { borderColor: '#00ff88' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff88' }
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

        <Divider sx={{ backgroundColor: '#333333', mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
            Ingredients & Pricing
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Ingredient</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Qty</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Unit</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Price (¥)</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Total (¥)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredients.map((ingredient, index) => (
                  <TableRow key={ingredient.id || index}>
                    <TableCell sx={{ color: '#ffffff' }}>
                      <TextField
                        value={ingredient.name || ''}
                        onChange={(e) => handleIngredientUpdate(index, 'name', e.target.value)}
                        size="small"
                        variant="standard"
                        InputProps={{ style: { color: '#ffffff' } }}
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: '#333333' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#00ff88' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#00ff88' }
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
                          '& .MuiInput-underline:before': { borderBottomColor: '#333333' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#00ff88' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#00ff88' }
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
                            '& .MuiInput-underline:before': { borderBottomColor: '#333333' },
                            '& .MuiInput-underline:hover:before': { borderBottomColor: '#00ff88' },
                            '& .MuiInput-underline:after': { borderBottomColor: '#00ff88' }
                          }}
                          MenuProps={{
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            PaperProps: {
                              style: {
                                backgroundColor: '#2a2a2a',
                                color: '#ffffff',
                                maxHeight: '200px'
                              }
                            },
                            // FIXED: Prevent screen shift
                            disableScrollLock: true,
                            keepMounted: false
                          }}
                        >
                          {METRIC_UNITS.map((unit) => (
                            <MenuItem key={unit} value={unit} sx={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    {/* ADDED: Missing Price TableCell */}
                    <TableCell>
                      <TextField
                        type="number"
                        value={ingredient.price || 0}
                        onChange={(e) => {
                          console.log('Price changing from', ingredient.price, 'to', e.target.value);
                          handleIngredientUpdate(index, 'price', e.target.value);
                        }}
                        onBlur={(e) => {
                          // Ensure the value is properly set on blur
                          const newPrice = parseFloat(e.target.value) || 0;
                          handleIngredientUpdate(index, 'price', newPrice);
                        }}
                        size="small"
                        variant="standard"
                        inputProps={{
                          step: "0.01",
                          min: "0",
                          style: { color: '#ffffff' }
                        }}
                        sx={{
                          width: '80px',
                          '& .MuiInput-underline:before': { borderBottomColor: '#333333' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#00ff88' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#00ff88' }
                        }}
                      />
                    </TableCell>

                    {/* ADDED: Missing Total TableCell */}
                    <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                      ¥{((ingredient.quantity || 0) * (ingredient.price || 0)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            onClick={addIngredient}
            sx={{ mt: 1, color: '#00ff88' }}
            size="small"
          >
            + Add Ingredient
          </Button>
        </Box>

        <Divider sx={{ backgroundColor: '#333333', mb: 3 }} />

        <Box>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
            Cost Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ backgroundColor: '#2a2a2a', p: 2 }}>
                <Typography variant="body1" sx={{ color: '#ffffff' }}>
                  Ingredient Cost: <span style={{ color: '#00ff88' }}>¥{costData.ingredientCost.toFixed(2)}</span>
                </Typography>
                <Typography variant="body1" sx={{ color: '#ffffff' }}>
                  Labor Cost (20%): <span style={{ color: '#00ff88' }}>¥{costData.laborCost.toFixed(2)}</span>
                </Typography>
                <Typography variant="h6" sx={{ color: '#00ff88', mt: 1 }}>
                  Total Cost: ¥{costData.totalCost.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ backgroundColor: '#2a2a2a', p: 2 }}>
                <Typography variant="h6" sx={{ color: '#00ff88' }}>
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

      <DialogActions sx={{ backgroundColor: '#1a1a1a' }}>
        <Button onClick={onClose} sx={{ color: '#ffffff' }}>
          Close
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#00ff88', color: '#000000' }}
          onClick={() => {
            console.log('Saving cost data:', costData);
            onClose();
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostCalculatorModal;
