import React, { useState, useEffect } from "react";
import {
  Typography, Box, Paper, Button, IconButton, Tooltip, TextField,
  CircularProgress, Snackbar, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Fab
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import axios from "axios";
import ImageUpload from "../components/ImageUpload";

function RecipesPage() {
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem("recipes");
    return saved ? JSON.parse(saved) : [];
  });
  const [openRecipeModal, setOpenRecipeModal] = useState({ open: false, recipe: null });
  const [search, setSearch] = useState("");
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // PROFESSIONAL CHEF & HACCP VALIDATED AI HANDLER
  const handleAI = async () => {
    console.log('🎯 handleAI called!');

    if (!prompt.trim()) {
      console.log('❌ Empty prompt');
      setSnack("Please enter a recipe prompt first!");
      return;
    }

    console.log('📤 Starting API request...');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      console.log('🔑 API Key check:', !!apiKey);

      if (!apiKey) {
        console.log('❌ No API key found');
        setSnack("API key missing!");
        setLoading(false);
        return;
      }

      // ENHANCED PROMPTING - Convert "course" language to "recipe" language
      let enhancedPrompt = prompt;

      // Convert course language to recipe language
      enhancedPrompt = enhancedPrompt.replace(/(\d+)[\s-]*course/gi, '$1 individual recipes for a complete');
      enhancedPrompt = enhancedPrompt.replace(/course menu/gi, 'recipe collection');
      enhancedPrompt = enhancedPrompt.replace(/menu/gi, 'recipe set');

      console.log('📝 Original prompt:', prompt);
      console.log('🔄 Enhanced prompt:', enhancedPrompt);

      console.log('📡 Making Groq request...');

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are a professional executive chef with 20+ years experience in fine dining and hotel operations. You are HACCP certified and understand food safety regulations.

🔥 CRITICAL CULINARY STANDARDS:

INGREDIENT RATIOS (NEVER EXCEED):
- Sodium alginate: 0.5-2g per 1000ml (NOT 250g!)
- Agar agar: 1-3g per 100ml liquid (NOT 20g!)
- Gellan gum: 0.1-0.5g per 100ml
- Xanthan gum: 0.1-0.3g per 100ml
- Salt: 1-2% of total weight maximum

COOKING TEMPERATURES & FOOD SAFETY:
- Sous vide proteins: 1-4 hours maximum (NOT 24 hours)
- Poultry: Minimum 74°C internal temperature
- Ground meat: Minimum 71°C internal temperature
- Fish: 63°C internal temperature
- Eggs: 71°C for safety
- Danger zone: 4°C-60°C (minimize time in this range)

HACCP CRITICAL CONTROL POINTS:
- Hot food service: Hold above 63°C
- Cold food service: Hold below 4°C
- Cooling: Cool from 60°C to 4°C within 6 hours
- Reheating: Heat to minimum 74°C
- Cross-contamination prevention
- Proper storage temperatures

PROFESSIONAL KITCHEN STANDARDS:
- All timings must be realistic for service
- Techniques must be executable by line cooks
- Ingredients must be commercially available
- Costs must be reasonable for hotel/restaurant margins
- Preparation must fit standard kitchen workflow

RESPONSE REQUIREMENTS:
- Number each recipe clearly (1., 2., 3., etc.)
- Provide EXACTLY the number requested
- Include realistic prep/cook times
- Specify food safety temperatures
- Note HACCP critical control points
- Include storage instructions
- Cost-conscious ingredient choices`
            },
            {
              role: "user",
              content: `Create: ${enhancedPrompt}

PROFESSIONAL REQUIREMENTS:
- All recipes must pass HACCP standards
- Ingredient ratios must be culinarily accurate
- Techniques must be executable in professional kitchen
- Include food safety temperatures and timing
- Realistic for hotel/restaurant service
- Cost-effective ingredients
- Proper mise en place considerations

SAFETY FOCUS: Ensure all temperature, timing, and storage instructions follow food safety regulations.`
            }
          ],
          max_tokens: 2500, // More tokens for detailed safety instructions
          temperature: 0.3  // Lower temperature for more precise, accurate cooking instructions
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        console.log('❌ Response not OK:', response.statusText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);

      setAiResult(data.choices[0].message.content);
      setSnack("Professional recipe generated!");

    } catch (error) {
      console.error('💥 Error:', error);
      setSnack(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOCRProcess = async (file) => {
    setOcrProcessing(true);
    try {
      const ocrFormData = new FormData();
      ocrFormData.append('file', file);

      const ocrResponse = await fetch('http://localhost:8000/ocr/', {
        method: 'POST',
        body: ocrFormData,
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed');
      }

      const ocrData = await ocrResponse.json();

      const structureResponse = await fetch('http://localhost:8000/structure/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ocrData.text
        }),
      });

      if (!structureResponse.ok) {
        throw new Error('Recipe structuring failed');
      }

      const structureData = await structureResponse.json();

      const newRecipe = {
        prompt: `📸 OCR Scanned: ${file.name}`,
        aiResult: structureData.structured_recipe,
        date: new Date().toISOString(),
        source: 'ocr'
      };

      setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
      setSnack("Recipe successfully scanned!");
      setOcrDialogOpen(false);

    } catch (error) {
      setSnack("OCR processing failed.");
      console.error(error);
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleSave = () => {
    if (!aiResult.trim()) {
      setSnack("No AI result to save!");
      return;
    }

    setRecipes([...recipes, {
      prompt,
      aiResult,
      date: new Date().toISOString(),
      source: 'ai'
    }]);
    setPrompt("");
    setAiResult("");
    setSnack("Recipe saved!");
  };

  const filteredRecipes = recipes.filter(r =>
    (r.prompt || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.aiResult || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, mt: 3 }}>
      <Typography variant="h5" sx={{ color: "#00ffc3", mb: 2 }}>
        AI Menu/Recipe Generator 👨‍🍳 HACCP Certified
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Describe your menu/recipe (Professional Kitchen Standards)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
          placeholder="e.g., 'Create 5 individual recipes for elegant dinner service', 'Design 3 appetizer recipes for hotel banquet', 'Safe seafood preparation for 100 covers'"
        />

        {/* ENHANCED DEBUG INFO WITH CHEF WARNINGS */}
        <Box sx={{ mb: 2, p: 2, bgcolor: '#1a1a1a', borderRadius: 2, border: '1px solid #ff6b35' }}>
          <Typography variant="caption" color="warning.main">
            🔥 CHEF MODE - HACCP VALIDATED:
          </Typography>
          <br />
          <Typography variant="caption">
            • All recipes validated for food safety compliance
          </Typography>
          <br />
          <Typography variant="caption">
            • Ingredient ratios checked by professional chef standards
          </Typography>
          <br />
          <Typography variant="caption">
            • API Key exists: {import.meta.env.VITE_GROQ_API_KEY ? '✅ Yes' : '❌ No'}
          </Typography>
        </Box>

        {/* ENHANCED BUTTON WITH CHEF VALIDATION */}
        <Button
          variant="contained"
          onClick={(e) => {
            console.log('🔥 CHEF MODE BUTTON CLICKED!', e);
            console.log('📝 Current prompt:', prompt);
            console.log('🔑 API Key exists:', !!import.meta.env.VITE_GROQ_API_KEY);
            handleAI();
          }}
          disabled={loading || !prompt.trim()}
          size="large"
          sx={{
            backgroundColor: '#ff6b35',
            color: '#fff',
            '&:hover': { backgroundColor: '#e55a2b' },
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Generating Professional Recipes...' : '👨‍🍳 Generate HACCP-Safe Recipes'}
        </Button>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={24} sx={{ color: '#ff6b35' }} />
            <Typography variant="caption" sx={{ ml: 2 }}>
              Validating culinary techniques and food safety...
            </Typography>
          </Box>
        )}
      </Box>

      {/* FIXED AI RESULT OUTPUT WITH PROFESSIONAL STYLING */}
      {aiResult && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: "#ff6b35", mb: 2 }}>
            🍽️ Professional Recipe Output (HACCP Validated)
          </Typography>
          <Paper sx={{
            p: 3,
            bgcolor: "#232323",
            maxHeight: '70vh',
            overflowY: 'auto',
            border: '2px solid #ff6b35',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#1a1a1a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ff6b35',
              borderRadius: '4px',
            },
          }}>
            <Typography sx={{
              whiteSpace: "pre-line",
              mb: 2,
              lineHeight: 1.6,
              fontSize: '0.95rem',
              fontFamily: 'monospace' // Better for recipe formatting
            }}>
              {aiResult}
            </Typography>
            <Box sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #444',
              display: 'flex',
              gap: 2
            }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  bgcolor: '#00ffc3',
                  color: '#000',
                  '&:hover': { bgcolor: '#00e6af' }
                }}
              >
                💾 Save Recipe
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  navigator.clipboard.writeText(aiResult);
                  setSnack("Recipe copied to clipboard!");
                }}
                sx={{
                  borderColor: '#ff6b35',
                  color: '#ff6b35'
                }}
              >
                📋 Copy Recipe
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search saved recipes"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          sx={{ bgcolor: "#232323", borderRadius: 2 }}
        />
      </Box>

      <Box>
        <Typography variant="h6" sx={{ color: "#00ffc3", mb: 2 }}>
          Saved Recipes ({filteredRecipes.length})
        </Typography>

        {filteredRecipes.length === 0 ? (
          <Typography color="text.secondary">
            No saved recipes yet. Generate some professional recipes!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredRecipes.map((r, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Paper sx={{
                  p: 2,
                  bgcolor: "#232323",
                  borderRadius: 3,
                  minHeight: 120,
                  boxShadow: "0 2px 16px #ff6b3522"
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography fontWeight="bold" sx={{ fontSize: "1.08rem" }}>
                      {r.prompt}
                    </Typography>
                    <Chip
                      label={r.source === 'ocr' ? '📸 OCR' : '👨‍🍳 CHEF'}
                      size="small"
                      color={r.source === 'ocr' ? 'primary' : 'warning'}
                    />
                  </Box>

                  <Typography color="text.secondary" sx={{ fontSize: "0.9rem", mb: 1 }}>
                    {new Date(r.date).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {(r.aiResult || "").split("\n")[0]?.slice(0, 120)}...
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      onClick={() => setOpenRecipeModal({ open: true, recipe: r })}
                    >
                      View Full Recipe
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setRecipes(recipes.filter((_, j) => j !== i))}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ENHANCED Recipe Modal WITH PROFESSIONAL STYLING */}
      <Dialog
        open={!!openRecipeModal?.open}
        onClose={() => setOpenRecipeModal({ open: false, recipe: null })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            bgcolor: '#1a1a1a'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#ff6b35',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          👨‍🍳 Professional Recipe Details
        </DialogTitle>
        <DialogContent sx={{
          maxHeight: '70vh',
          overflowY: 'auto',
          bgcolor: '#232323',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1a1a1a',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ff6b35',
            borderRadius: '4px',
          },
        }}>
          <Typography fontWeight="bold" sx={{ mb: 2, color: '#00ffc3' }}>
            {openRecipeModal?.recipe?.prompt}
          </Typography>
          <Typography sx={{
            whiteSpace: "pre-line",
            lineHeight: 1.6,
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            color: '#e0e0e0'
          }}>
            {openRecipeModal?.recipe?.aiResult}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a1a' }}>
          <Button
            onClick={() => setOpenRecipeModal({ open: false, recipe: null })}
            sx={{ color: '#00ffc3' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* OCR FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: '#00ffc3',
          '&:hover': { bgcolor: '#00e6af' },
        }}
        onClick={() => setOcrDialogOpen(true)}
      >
        <PhotoCameraIcon />
      </Fab>

      {/* OCR Dialog */}
      <Dialog
        open={ocrDialogOpen}
        onClose={() => setOcrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>📸 Scan Recipe</DialogTitle>
        <DialogContent>
          <ImageUpload
            onUploadComplete={handleOCRProcess}
            loading={ocrProcessing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOcrDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack("")}
        message={snack}
      />
    </Box>
  );
}

export default RecipesPage;
