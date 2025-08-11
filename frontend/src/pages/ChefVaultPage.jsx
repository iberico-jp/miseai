import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Button, Grid, TextField,
  Chip, IconButton, Tooltip, Card, CardContent,
  CardActions, InputAdornment, Fab, Menu, MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Calculate as CostIcon,
  Restaurant as RestaurantIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import ProfessionalRecipeCard from '../components/ProfessionalRecipeCard';

const ChefVaultPage = () => {
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem("recipes");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, ai, ocr, favorites
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alphabetical, cost
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [bulkActions, setBulkActions] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // Filter and sort recipes
  const processedRecipes = recipes
    .filter(recipe => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        recipe.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.aiResult.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'ai' && recipe.source === 'ai') ||
        (filterBy === 'ocr' && recipe.source === 'ocr') ||
        (filterBy === 'favorites' && recipe.favorite);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'alphabetical':
          return a.prompt.localeCompare(b.prompt);
        default:
          return 0;
      }
    });

  // Recipe statistics
  const stats = {
    total: recipes.length,
    ai: recipes.filter(r => r.source === 'ai').length,
    ocr: recipes.filter(r => r.source === 'ocr').length,
    thisWeek: recipes.filter(r => {
      const recipeDate = new Date(r.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recipeDate > weekAgo;
    }).length
  };

  const handleBulkExport = () => {
    const bulkData = selectedRecipes.map(id => {
      const recipe = recipes.find(r => r.date === id);
      return `=== ${recipe.prompt} ===\nGenerated: ${new Date(recipe.date).toLocaleString()}\n\n${recipe.aiResult}\n\n`;
    }).join('\n-------------------\n\n');

    const blob = new Blob([bulkData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MiseAI_Bulk_Recipes_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  return (
    <Box sx={{ p: 4, mt: 3 }}>
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#ff6b35", mb: 1, fontWeight: 'bold' }}>
          🗃️ Chef's Vault
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Professional Recipe Management System | HACCP Compliant Kitchen Database
        </Typography>

        {/* VAULT STATISTICS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#2a2a2a', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="#00ffc3">{stats.total}</Typography>
                <Typography color="text.secondary">Total Recipes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#2a2a2a', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="#ff6b35">{stats.ai}</Typography>
                <Typography color="text.secondary">AI Generated</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#2a2a2a', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="#ffd700">{stats.ocr}</Typography>
                <Typography color="text.secondary">OCR Scanned</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#2a2a2a', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="#9c27b0">{stats.thisWeek}</Typography>
                <Typography color="text.secondary">This Week</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* SEARCH AND FILTER BAR */}
      <Box sx={{
        mb: 3,
        p: 2,
        bgcolor: '#2a2a2a',
        borderRadius: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Search recipes, ingredients, techniques..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: '300px',
            '& .MuiInputBase-root': { bgcolor: '#1a1a1a' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#00ffc3' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          startIcon={<FilterIcon />}
          onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          variant="outlined"
          sx={{ borderColor: '#ff6b35', color: '#ff6b35' }}
        >
          Filter: {filterBy}
        </Button>

        <Button
          startIcon={<SortIcon />}
          onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          variant="outlined"
          sx={{ borderColor: '#00ffc3', color: '#00ffc3' }}
        >
          Sort: {sortBy}
        </Button>

        <Button
          onClick={() => setBulkActions(!bulkActions)}
          variant={bulkActions ? "contained" : "outlined"}
          sx={{
            borderColor: '#ffd700',
            color: bulkActions ? '#000' : '#ffd700',
            bgcolor: bulkActions ? '#ffd700' : 'transparent'
          }}
        >
          Bulk Actions
        </Button>

        {bulkActions && selectedRecipes.length > 0 && (
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleBulkExport}
            variant="contained"
            sx={{ bgcolor: '#00ffc3', color: '#000' }}
          >
            Export Selected ({selectedRecipes.length})
          </Button>
        )}
      </Box>

      {/* RECIPES GRID */}
      {processedRecipes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RestaurantIcon sx={{ fontSize: 80, color: '#444', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={2}>
            No recipes found in your vault
          </Typography>
          <Typography color="text.secondary">
            {searchTerm || filterBy !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Generate some recipes to populate your professional vault'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {processedRecipes.map((recipe, index) => (
            <Grid item xs={12} md={6} lg={4} key={recipe.date}>
              <Card sx={{
                bgcolor: '#232323',
                borderRadius: 3,
                minHeight: 200,
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.1)',
                border: selectedRecipes.includes(recipe.date) ? '2px solid #ffd700' : '1px solid #444',
                cursor: bulkActions ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(255, 107, 53, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => bulkActions && toggleRecipeSelection(recipe.date)}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* RECIPE HEADER */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        color: '#00ffc3',
                        fontSize: '1.1rem',
                        lineHeight: 1.3
                      }}
                    >
                      {recipe.prompt}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={recipe.source === 'ocr' ? '📸 OCR' : '🤖 AI'}
                        size="small"
                        sx={{
                          bgcolor: recipe.source === 'ocr' ? '#2196f3' : '#ff6b35',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      />
                      {bulkActions && (
                        <Chip
                          label={selectedRecipes.includes(recipe.date) ? '✅' : '☐'}
                          size="small"
                          sx={{ bgcolor: '#ffd700', color: '#000' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* RECIPE PREVIEW */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      height: '60px',
                      overflow: 'hidden',
                      lineHeight: 1.4
                    }}
                  >
                    {recipe.aiResult.split('\n').slice(0, 3).join(' ').substring(0, 150)}...
                  </Typography>

                  {/* RECIPE METADATA */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label="🔥 HACCP"
                      size="small"
                      sx={{ bgcolor: '#00ff00', color: '#000' }}
                    />
                    <Chip
                      label={`📅 ${new Date(recipe.date).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#666', color: '#666' }}
                    />
                    <Chip
                      label="💰 Costed"
                      size="small"
                      sx={{ bgcolor: '#ffd700', color: '#000' }}
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{
                  justifyContent: 'space-between',
                  px: 2,
                  pb: 2,
                  borderTop: '1px solid #444'
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Open Professional Recipe">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecipe(recipe);
                        }}
                        sx={{ color: '#00ffc3' }}
                      >
                        📖 Open Recipe
                      </Button>
                    </Tooltip>

                    <Tooltip title="Quick Print">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick print functionality
                        }}
                        sx={{ color: '#ff6b35' }}
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(recipe.date).toLocaleTimeString()}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* FILTER MENU */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setFilterBy('all'); setFilterMenuAnchor(null); }}>
          All Recipes
        </MenuItem>
        <MenuItem onClick={() => { setFilterBy('ai'); setFilterMenuAnchor(null); }}>
          🤖 AI Generated
        </MenuItem>
        <MenuItem onClick={() => { setFilterBy('ocr'); setFilterMenuAnchor(null); }}>
          📸 OCR Scanned
        </MenuItem>
        <MenuItem onClick={() => { setFilterBy('favorites'); setFilterMenuAnchor(null); }}>
          ⭐ Favorites
        </MenuItem>
      </Menu>

      {/* SORT MENU */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('newest'); setSortMenuAnchor(null); }}>
          📅 Newest First
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('oldest'); setSortMenuAnchor(null); }}>
          📅 Oldest First
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('alphabetical'); setSortMenuAnchor(null); }}>
          🔤 Alphabetical
        </MenuItem>
      </Menu>

      {/* PROFESSIONAL RECIPE CARD MODAL */}
      <ProfessionalRecipeCard
        open={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onSave={(updatedRecipe) => {
          setRecipes(prev => prev.map(r =>
            r.date === updatedRecipe.date ? updatedRecipe : r
          ));
          setSelectedRecipe(null);
        }}
        onDelete={() => {
          setRecipes(prev => prev.filter(r => r.date !== selectedRecipe.date));
          setSelectedRecipe(null);
        }}
      />

      {/* FLOATING ACTION BUTTON */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          bgcolor: '#ff6b35',
          '&:hover': { bgcolor: '#e55a2b' },
        }}
        onClick={() => window.location.href = '/recipes'}
      >
        <AddIcon />
      </Fab>

      {/* BULK EXPORT FAB */}
      {bulkActions && selectedRecipes.length > 0 && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 150,
            right: 16,
            bgcolor: '#ffd700',
            color: '#000',
            '&:hover': { bgcolor: '#ffed4e' },
          }}
          onClick={handleBulkExport}
        >
          <DownloadIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ChefVaultPage;
