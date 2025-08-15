import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Button, Grid, TextField,
  Card, CardContent, Fab, Divider,
  IconButton, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  MenuBook as RecipeIcon,
  People as StaffIcon,
  LibraryBooks as LibraryIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Calculate as CalculateIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ProfessionalRecipeCard from '../components/ProfessionalRecipeCard';
import RecipeCreationForm from '../components/RecipeCreationForm';
import CostCalculatorModal from '../components/CostCalculatorModal';

const ChefVaultPage = () => {
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem("recipes");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeSection, setActiveSection] = useState('recipes');
  const [creationFormOpen, setCreationFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRecipe, setMenuRecipe] = useState(null);
  const [costCalculatorRecipe, setCostCalculatorRecipe] = useState(null);
  const [isCostCalculatorOpen, setIsCostCalculatorOpen] = useState(false);

  const [isViewingRecipe, setIsViewingRecipe] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState(null);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  const filteredRecipes = recipes.filter(recipe => {
    const recipeName = recipe.prompt || recipe.name || '';
    const recipeContent = recipe.aiResult || '';
    const recipeDescription = recipe.description || '';

    return recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipeContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipeDescription.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewRecipe = (recipe) => {
    console.log('=== DEBUG: View Recipe Button Clicked ===');
    console.log('Recipe data:', recipe);
    setViewingRecipe(recipe);
    setIsViewingRecipe(true);
    console.log('Recipe modal should open now');
  };

  const handleCreateRecipe = () => {
    setCreationFormOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setCreationFormOpen(true);
  };

  const handleDirectCostAnalysis = (recipe) => {
    console.log('=== DEBUG: Cost Calculator Button Clicked ===');
    console.log('Recipe data:', recipe);
    console.log('Current modal state:', isCostCalculatorOpen);
    setCostCalculatorRecipe(recipe);
    setIsCostCalculatorOpen(true);
    console.log('Cost calculator should open now');
  };

  const handleSaveCostData = (updatedCostData) => {
    console.log('Saving cost data for recipe:', costCalculatorRecipe?.prompt);
    console.log('Updated data:', updatedCostData);
    setRecipes(prevRecipes =>
      prevRecipes.map(recipe =>
        recipe.date === costCalculatorRecipe.date
          ? {
              ...recipe,
              costData: updatedCostData.costData,
              ingredients: updatedCostData.ingredients,
              servings: updatedCostData.servings
            }
          : recipe
      )
    );
    console.log('Cost data saved!');
  };

  const handleDeleteRecipe = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      setRecipes(prev => prev.filter(r => r.date !== recipeToDelete.date));
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const handleMenuOpen = (event, recipe) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRecipe(recipe);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRecipe(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* CLEAN HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
          👨‍🍳 Chef's Vault
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Professional Kitchen Management Hub
        </Typography>
      </Box>

      {/* MAIN ACTION SECTIONS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: activeSection === 'recipes' ? 'rgba(78, 205, 196, 0.1)' : 'background.paper',
              border: activeSection === 'recipes' ? '2px solid' : '1px solid',
              borderColor: activeSection === 'recipes' ? 'primary.main' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveSection('recipes')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <RecipeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                Recipe Management
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Create, edit, and cost recipes
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                {recipes.length} Recipes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: activeSection === 'roster' ? 'rgba(255, 107, 107, 0.1)' : 'background.paper',
              border: activeSection === 'roster' ? '2px solid' : '1px solid',
              borderColor: activeSection === 'roster' ? 'secondary.main' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveSection('roster')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <StaffIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 'bold', mb: 1 }}>
                Staff Roster
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Manage schedules and shifts
              </Typography>
              <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                Phase 3
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: activeSection === 'library' ? 'rgba(255, 184, 0, 0.1)' : 'background.paper',
              border: activeSection === 'library' ? '2px solid' : '1px solid',
              borderColor: activeSection === 'library' ? 'warning.main' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setActiveSection('library')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <LibraryIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'warning.main', fontWeight: 'bold', mb: 1 }}>
                Cookbook Library
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                PDF cookbooks and references
              </Typography>
              <Typography variant="h6" sx={{ color: 'warning.main' }}>
                Phase 4
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderColor: 'divider' }} />

      {/* RECIPE MANAGEMENT SECTION */}
      {activeSection === 'recipes' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Recipe Collection
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRecipe}
            >
              Create New Recipe
            </Button>
          </Box>

          {/* SIMPLE SEARCH */}
          <TextField
            fullWidth
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />

          {/* RECIPE GRID */}
          {filteredRecipes.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <RecipeIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={2}>
                {searchTerm ? 'No recipes found' : 'No recipes in your vault yet'}
              </Typography>
              <Typography color="text.secondary" mb={3}>
                {searchTerm ? 'Try a different search term' : 'Create your first professional recipe'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateRecipe}
              >
                Create Recipe
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} lg={4} key={recipe.date}>
                  <Card sx={{ minHeight: 300, transition: 'all 0.3s ease' }}>
                    {/* Recipe Photo */}
                    {recipe.photo && (
                      <Box
                        sx={{
                          height: 150,
                          backgroundImage: `url(${recipe.photo})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '12px 12px 0 0'
                        }}
                      />
                    )}

                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 'bold',
                            lineHeight: 1.3,
                            flexGrow: 1
                          }}
                        >
                          {recipe.prompt || recipe.name || 'Untitled Recipe'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, recipe);
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>

                      {(recipe.description || recipe.aiResult) && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            height: '40px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {recipe.description || (recipe.aiResult && recipe.aiResult.substring(0, 100) + '...')}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {recipe.servings && (
                          <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            bgcolor: 'background.surface',
                            px: 1, py: 0.5, borderRadius: 1
                          }}>
                            👥 {recipe.servings} servings
                          </Typography>
                        )}
                        {recipe.prepTime && (
                          <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            bgcolor: 'background.surface',
                            px: 1, py: 0.5, borderRadius: 1
                          }}>
                            ⏱️ {recipe.prepTime}
                          </Typography>
                        )}
                        {recipe.costData && recipe.servings && (
                          <Typography variant="caption" sx={{
                            color: 'warning.main',
                            bgcolor: 'rgba(255, 184, 0, 0.1)',
                            px: 1, py: 0.5, borderRadius: 1
                          }}>
                            💰 ¥{Math.round(recipe.costData.totalCost / recipe.servings)}/serving
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(recipe.date).toLocaleDateString()}
                      </Typography>
                    </CardContent>

                    <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecipe(recipe);
                        }}
                        sx={{ color: 'primary.main', fontWeight: 'bold' }}
                      >
                        View Recipe
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectCostAnalysis(recipe);
                        }}
                        sx={{ color: 'warning.main', borderColor: 'warning.main' }}
                      >
                        Edit & Cost
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* STAFF ROSTER SECTION */}
      {activeSection === 'roster' && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <StaffIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'secondary.main', mb: 2 }}>
            Staff Roster Management
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Coming in Phase 3: Weekly schedules, shift planning, and labor cost tracking
          </Typography>
        </Paper>
      )}

      {/* COOKBOOK LIBRARY SECTION */}
      {activeSection === 'library' && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <LibraryIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'warning.main', mb: 2 }}>
            Cookbook Library
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Coming in Phase 4: PDF cookbook uploads, reference materials, and quick access guides
          </Typography>
        </Paper>
      )}

      {/* RECIPE CREATION FORM */}
      <RecipeCreationForm
        open={creationFormOpen}
        onClose={() => {
          setCreationFormOpen(false);
          setEditingRecipe(null);
        }}
        onSave={(recipeData) => {
          if (editingRecipe) {
            setRecipes(prev => prev.map(r =>
              r.date === editingRecipe.date ? { ...recipeData, date: editingRecipe.date } : r
            ));
          } else {
            setRecipes(prev => [...prev, recipeData]);
          }
          setCreationFormOpen(false);
          setEditingRecipe(null);
        }}
        editingRecipe={editingRecipe}
      />

      {/* VIEW RECIPE MODAL */}
      {isViewingRecipe && viewingRecipe && (
        <ProfessionalRecipeCard
          recipe={viewingRecipe}
          onClose={() => {
            setIsViewingRecipe(false);
            setViewingRecipe(null);
          }}
        />
      )}

      {/* COST CALCULATOR MODAL */}
      {isCostCalculatorOpen && costCalculatorRecipe && (
        <CostCalculatorModal
          recipe={costCalculatorRecipe}
          onClose={() => {
            setIsCostCalculatorOpen(false);
            setCostCalculatorRecipe(null);
          }}
          onSave={handleSaveCostData}
        />
      )}

      {/* CONTEXT MENU */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditRecipe(menuRecipe);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit Recipe
        </MenuItem>
        <MenuItem onClick={() => {
          handleViewRecipe(menuRecipe);
          handleMenuClose();
        }}>
          <RecipeIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => {
          handleDirectCostAnalysis(menuRecipe);
          handleMenuClose();
        }}>
          <CalculateIcon sx={{ mr: 1 }} /> Cost Analysis
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteRecipe(menuRecipe);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Recipe
        </MenuItem>
      </Menu>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          🗑️ Delete Recipe
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "<strong>{recipeToDelete?.prompt || recipeToDelete?.name || 'this recipe'}</strong>"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* FLOATING ACTION BUTTON */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
        onClick={handleCreateRecipe}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ChefVaultPage;
