import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const RecipeCreationForm = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servings: 1,
    prepTime: '',
    photo: null,
    photoPreview: null,
    ingredients: [{ name: '', quantity: '', unit: 'kg', cost: 0 }]
  });

  // Pricing function - add this after state declarations
  const calculateIngredientCost = (ingredientName, quantity) => {
    const prices = {
      'wagyu beef': 18000,
      'beef': 3000,
      'salmon': 2800,
      'chicken': 800,
      'rice': 300,
      'vegetables': 500,
      'oil': 200,
      'salt': 100,
      'pepper': 150,
      'onion': 200,
      'garlic': 300,
      'soy sauce': 400,
      'miso': 600,
      'nori': 1200,
      'tuna': 5000,
      'shrimp': 3500
    };

    const ingredientLower = ingredientName.toLowerCase();
    let pricePerKg = 0;

    // Find matching ingredient
    for (const [key, price] of Object.entries(prices)) {
      if (ingredientLower.includes(key)) {
        pricePerKg = price;
        break;
      }
    }

    return pricePerKg * quantity;
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: 'kg', cost: 0 }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const calculateTotalCost = () => {
    let totalIngredientCost = 0;

    formData.ingredients.forEach(ingredient => {
      if (ingredient.name && ingredient.quantity) {
        const cost = calculateIngredientCost(ingredient.name, parseFloat(ingredient.quantity) || 0);
        totalIngredientCost += cost;
      }
    });

    const laborCost = totalIngredientCost * 0.2; // 20% labor cost
    const totalCost = totalIngredientCost + laborCost;

    return {
      ingredientCost: totalIngredientCost,
      laborCost: laborCost,
      totalCost: totalCost
    };
  };

  const handleSave = () => {
    const costs = calculateTotalCost();

    const newRecipe = {
      prompt: formData.name,
      aiResult: formData.description,
      description: formData.description,
      date: Date.now(),
      servings: formData.servings,
      prepTime: formData.prepTime,
      photo: formData.photoPreview,
      ingredients: formData.ingredients,
      costData: {
        ingredientCost: costs.ingredientCost,
        laborCost: costs.laborCost,
        totalCost: costs.totalCost
      }
    };

    console.log('Saving recipe:', newRecipe);
    onSave(newRecipe);

    // Reset form
    setFormData({
      name: '',
      description: '',
      servings: 1,
      prepTime: '',
      photo: null,
      photoPreview: null,
      ingredients: [{ name: '', quantity: '', unit: 'kg', cost: 0 }]
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1a1a1a' } }}
    >
      <DialogTitle sx={{ color: '#00ffc3', fontWeight: 'bold' }}>
        🍳 Create New Recipe
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label="Recipe Name"
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            sx={{ '& .MuiInputBase-root': { bgcolor: '#232323' } }}
          />

          {/* Photo Upload Section */}
          <Box sx={{ border: '2px dashed #444', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: '#232323' }}>
            {formData.photoPreview ? (
              <Box>
                <img
                  src={formData.photoPreview}
                  alt="Recipe preview"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <Button onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: null }))} sx={{ mt: 1, color: '#ff6b35' }}>
                  Remove Photo
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>📸 Add Recipe Photo</Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button variant="outlined" component="span" sx={{ borderColor: '#00ffc3', color: '#00ffc3' }}>
                    Choose Photo
                  </Button>
                </label>
              </Box>
            )}
          </Box>

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
            sx={{ '& .MuiInputBase-root': { bgcolor: '#232323' } }}
          />

          {/* Ingredients Section */}
          <Box>
            <Typography variant="h6" sx={{ color: '#00ffc3', mb: 2 }}>🥘 Ingredients</Typography>
            {formData.ingredients.map((ingredient, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  sx={{ flex: 2, '& .MuiInputBase-root': { bgcolor: '#232323' } }}
                />
                <TextField
                  placeholder="Amount"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-root': { bgcolor: '#232323' } }}
                />
                <Button
                  onClick={() => removeIngredient(index)}
                  color="error"
                  disabled={formData.ingredients.length === 1}
                >
                  ✕
                </Button>
              </Box>
            ))}
            <Button onClick={addIngredient} sx={{ color: '#00ffc3' }}>
              + Add Ingredient
            </Button>
          </Box>

          {/* Cost Calculation Section */}
          <Box sx={{ bgcolor: '#232323', p: 3, borderRadius: 2, border: '1px solid #00ffc3' }}>
            <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>💰 Cost Breakdown</Typography>
            {(() => {
              const costs = calculateTotalCost();
              return (
                <>
                  <Typography>Ingredient Cost: ¥{Math.round(costs.ingredientCost)}</Typography>
                  <Typography>Labor Cost (20%): ¥{Math.round(costs.laborCost)}</Typography>
                  <Typography variant="h6" sx={{ color: '#ffd700' }}>Total Cost: ¥{Math.round(costs.totalCost)}</Typography>
                  <Typography color="text.secondary">Cost per serving: ¥{Math.round(costs.totalCost / formData.servings)}</Typography>
                </>
              );
            })()}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Servings"
              type="number"
              value={formData.servings}
              onChange={handleChange('servings')}
              inputProps={{ min: 1 }}
              sx={{ '& .MuiInputBase-root': { bgcolor: '#232323' } }}
            />

            <TextField
              label="Prep Time"
              value={formData.prepTime}
              onChange={handleChange('prepTime')}
              placeholder="e.g., 30 minutes"
              sx={{ '& .MuiInputBase-root': { bgcolor: '#232323' } }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          startIcon={<CancelIcon />}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ bgcolor: '#00ffc3', color: '#000' }}
        >
          Save Recipe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeCreationForm;
