import Modal from "@mui/material/Modal";
import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Typography, Box, Paper, Button, IconButton, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, TextField, CircularProgress, Snackbar, Fade, Grid
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PublicIcon from "@mui/icons-material/Public";
import ShareIcon from "@mui/icons-material/Share";
import ChatIcon from "@mui/icons-material/Chat";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SpaIcon from '@mui/icons-material/Spa';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';

const PromptContext = createContext({
  prompt: "",
  setPrompt: () => {}
});
const drawerWidth = 220;
const CHEF_QUOTES = [
  "Cooking is an observation-based process. – Alton Brown",
  "Attention to detail is the secret of success in the kitchen. – Gordon Ramsay",
  "Good food from fresh ingredients is enough. – Julia Child",
  "A recipe has no soul. The cook must bring soul to the recipe. – Thomas Keller",
  "Fear of failure is the only real stumbling block in cooking. – Julia Child" ,
  "What is creativity? Not coping. - Ferran Adria"
];
function getCurrentSeason() {
  const month = new Date().getMonth();
  if ([11, 0, 1].includes(month)) return 'Winter';
  if ([2, 3, 4].includes(month)) return 'Spring';
  if ([5, 6, 7].includes(month)) return 'Summer';
  return 'Autumn';
}
const SEASON_INGREDIENTS = {
  "Summer": { "Fruit": ["Watermelon", "Peach"], "Veges": ["Zucchini"], "Meat": ["Chicken"], "Fish": ["Mackerel"] },
  "Spring": { "Fruit": ["Apricot"], "Veges": ["Asparagus"], "Meat": ["Lamb"], "Fish": ["Sea Bream"] },
  "Autumn": { "Fruit": ["Pear"], "Veges": ["Pumpkin"], "Meat": ["Duck"], "Fish": ["Salmon"] },
  "Winter": { "Fruit": ["Orange"], "Veges": ["Leek"], "Meat": ["Beef (Stew)"], "Fish": ["Cod"] }
};
const INVENTORY_TYPES = [
  "Dry Store", "Dairy", "Meat", "Fish/Seafood", "Fruits & Vegetables",
  "Pastry", "Spices", "Oils/Fats", "Frozen", "Non-Food"
];
const CATEGORY_OPTIONS = [
  "All", "Breakfast", "Casual Restaurant", "Fine Dining", "Room Service", "Pastry", "Afternoon Tea"
];
const METRIC_UNITS = ["kg", "g", "l", "ml", "cm"];
const IMPERIAL_UNITS = ["lb", "oz", "gal", "qt", "pt", "in"];
const STANDARD_INGREDIENTS = [
  "Sugar", "Salt", "Black Pepper", "Olive Oil", "Butter", "Milk", "Eggs",
  "Flour", "Rice", "Chicken Breast", "Beef Tenderloin", "Salmon",
  "Tomato", "Potato", "Onion", "Garlic", "Basil", "Parsley", "Lettuce",
  "Cheddar Cheese", "Parmesan Cheese", "Yogurt", "Cream", "Shrimp",
  "Oregano", "Thyme", "Rosemary", "Soy Sauce", "Vinegar",
  "Cumin", "Coriander", "Paprika", "Saffron", "Baking Powder",
  "Baking Soda", "Lamb", "Duck", "Pork Loin", "Scallops", "Lobster",
  "Apple", "Banana", "Strawberry", "Spinach", "Broccoli", "Carrot",
  "Honey", "Jam", "Ketchup", "Mayonnaise", "Mustard", "Worcestershire Sauce"
];

const sidebarLinks = [
  { label: "Dashboard", icon: <DashboardIcon />, to: "/" },
  { label: "Recipes", icon: <MenuBookIcon />, to: "/recipes" },
  { label: "Chef Vault", icon: <MenuBookIcon />, to: "/vault" },
  { label: "Menus", icon: <RestaurantMenuIcon />, to: "/menus" },
  { label: "Inventory", icon: <AutoAwesomeIcon />, to: "/inventory" },
  { label: "Calendar", icon: <EventNoteIcon />, to: "/calendar" },
  { label: "Reservations", icon: <RestaurantMenuIcon />, to: "/reservations" },
];
const quickLinks = [
  { label: "Photos", icon: <PhotoCameraIcon />, to: "/photos" },
  { label: "Chat", icon: <ChatIcon />, to: "/chat" },
  { label: "Share", icon: <ShareIcon />, to: "/share" },
];

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00ffc3" },
    background: { default: "#181818", paper: "#232323" },
    text: { primary: "#fff" },
    secondary: { main: "#00bfff" },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h2: { fontWeight: 700, fontSize: "2.7rem", letterSpacing: "0.03em" },
    h5: { fontWeight: 500, fontSize: "1.4rem" },
  },
});

function SeasonIcon({ season, onClick }) {
  switch (season) {
    case "Winter": return <Tooltip title="Winter"><IconButton onClick={onClick}><AcUnitIcon sx={{ color: "#80e1ff" }} /></IconButton></Tooltip>;
    case "Spring": return <Tooltip title="Spring"><IconButton onClick={onClick}><SpaIcon sx={{ color: "#aaffb3" }} /></IconButton></Tooltip>;
    case "Summer": return <Tooltip title="Summer"><IconButton onClick={onClick}><WbSunnyIcon sx={{ color: "#fff699" }} /></IconButton></Tooltip>;
    default: return <Tooltip title="Autumn"><IconButton onClick={onClick}><LocalFloristIcon sx={{ color: "#ffc266" }} /></IconButton></Tooltip>;
  }
}

function AppShell({ children, onSeasonClick, season }) {
  const location = useLocation();
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#181818" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, bgcolor: "#161616", boxSizing: "border-box" },
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#00ffc3" }}>MiseAI</Typography>
        </Toolbar>
        <Divider />
        <List>
          {sidebarLinks.map(link => (
            <ListItem key={link.to} button component={Link} to={link.to} selected={location.pathname === link.to}>
              <ListItemIcon sx={{ color: "#00ffc3" }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ p: 2, color: "#bbb" }}>
          <Typography fontWeight={600} sx={{ mb: 1, fontSize: "0.95rem" }}>Quick Actions</Typography>
          <Box>
            {quickLinks.map(link => (
              <IconButton key={link.to} component={Link} to={link.to} sx={{ color: "#00ffc3", mr: 1 }}>
                {link.icon}
              </IconButton>
            ))}
            <IconButton onClick={() => window.open("https://iberico.jp", "_blank")} sx={{ color: "#00ffc3", mt: 1 }}>
              <PublicIcon />
            </IconButton>
            <SeasonIcon season={season} onClick={onSeasonClick} />
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 0, bgcolor: "#181818", minHeight: "100vh", maxWidth: "calc(100vw - 220px)" }}>
        {children}
      </Box>
    </Box>
  );
}

function QuoteTicker() {
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * CHEF_QUOTES.length));
  const [show, setShow] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setQuoteIdx(idx => (idx + 1) % CHEF_QUOTES.length);
        setShow(true);
      }, 400);
    }, 20000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Box sx={{
      width: "100vw",
      height: 60,
      minHeight: 60,
      maxHeight: 60,
      px: 0,
      py: 1.2,
      bgcolor: "#111",
      borderBottom: "2px solid #00ffc3",
      boxShadow: "0 2px 20px #00ffc388",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "sticky",
      top: 0,
      zIndex: 1300,
    }}>
      <Fade in={show} timeout={400}>
        <Typography
          sx={{
            color: "#fff", fontSize: "1.18rem", fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
            textShadow: "0 0 3px #00ffc399, 0 0 8px #00ffc322",
            fontStyle: "italic",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "70vw",
            textAlign: "center"
          }}>
          {CHEF_QUOTES[quoteIdx]}
        </Typography>
      </Fade>
    </Box>
  );
}

function SeasonModal({ open, onClose, season }) {
  const ingredients = SEASON_INGREDIENTS[season];
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        bgcolor: "#222", color: "#fff", p: 5, borderRadius: 3,
        boxShadow: "0 6px 40px #00ffc377", minWidth: 420, maxWidth: 600,
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
      }}>
        <Typography variant="h5" sx={{ color: "#00ffc3", mb: 3, textAlign: "center" }}>
          {season} Ingredients
        </Typography>
        <Grid container spacing={2}>
          {["Fruit", "Veges", "Meat", "Fish"].map(section => (
            <Grid item xs={6} key={section}>
              <Typography variant="subtitle1" sx={{ color: "#bdf", mb: 1 }}>{section}</Typography>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ingredients[section].map(ing => (
                  <li key={ing}><Typography color="text.secondary">{ing}</Typography></li>
                ))}
              </ul>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button variant="contained" color="primary" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
}


function App() {
  const season = getCurrentSeason();
  const [seasonModal, setSeasonModal] = useState(false);
  const [prompt, setPrompt] = useState(""); // For sharing between ChefVault and Recipes

  return (
    <PromptContext.Provider value={{ prompt, setPrompt }}>
      <ThemeProvider theme={theme}>
        <Router>
          <QuoteTicker />
          <AppShell season={season} onSeasonClick={() => setSeasonModal(true)}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/menus" element={<MenusPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/photos" element={<PhotosPage />} />
              <Route path="/chat" element={<ChatAssistantPage />} />
              <Route path="/vault" element={<ChefVaultPage />} />
              <Route path="/share" element={<SectionStub title="Share" />} />
              <Route path="*" element={<SectionStub title="Not Found" />} />
            </Routes>
            <SeasonModal open={seasonModal} onClose={() => setSeasonModal(false)} season={season} />
          </AppShell>
        </Router>
      </ThemeProvider>
    </PromptContext.Provider>
  );
}
// ------------- Paste the FULL pages for DashboardPage, InventoryPage, RecipesPage, MenusPage, ReservationsPage, CalendarPage, PhotosPage, ChatAssistantPage, SectionStub HERE, in this order, one after the other -----------
function DashboardPage() {
  const inventory = (() => {
    try { return JSON.parse(localStorage.getItem("inventory")) || []; } catch { return []; }
  })();
  const reservations = (() => {
    try { return JSON.parse(localStorage.getItem("reservations")) || []; } catch { return []; }
  })();
  const recipes = (() => {
    try { return JSON.parse(localStorage.getItem("recipes")) || []; } catch { return []; }
  })();
  const menus = (() => {
    try { return JSON.parse(localStorage.getItem("menus")) || []; } catch { return []; }
  })();
  const numCritical = inventory.filter(i => i.status === "low").length;
  const totalItems = inventory.length;
  const now = new Date();
  const next24h = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  const upcomingRes = reservations.filter(r => {
    if (!r.date) return false;
    const d = new Date(r.date);
    return d >= now && d <= next24h;
  });

  return (
    <Box sx={{ p: 5, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Chef Dashboard</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, bgcolor: "#232323", flex: 1, minWidth: 170, textAlign: "center", borderRadius: "16px", boxShadow: "0 2px 16px #00ffc333" }}>
          <Typography color="error" fontWeight="bold">Critical Inventory</Typography>
          <Typography fontSize="2rem" fontWeight={700}>{numCritical}</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: "#232323", flex: 1, minWidth: 170, textAlign: "center", borderRadius: "16px", boxShadow: "0 2px 16px #00ffc333" }}>
          <Typography color="primary" fontWeight="bold">Total Inventory</Typography>
          <Typography fontSize="2rem" fontWeight={700}>{totalItems}</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: "#232323", flex: 1, minWidth: 170, textAlign: "center", borderRadius: "16px", boxShadow: "0 2px 16px #00ffc333" }}>
          <Typography color="info.main" fontWeight="bold">Upcoming Reservations</Typography>
          <Typography fontSize="2rem" fontWeight={700}>{upcomingRes.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: "#232323", flex: 1, minWidth: 170, textAlign: "center", borderRadius: "16px", boxShadow: "0 2px 16px #00ffc333" }}>
          <Typography color="success.main" fontWeight="bold">Menus</Typography>
          <Typography fontSize="2rem" fontWeight={700}>{menus.length}</Typography>
        </Paper>
      </Box>

      {/* Quick Add floating actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" component={Link} to="/recipes" startIcon={<MenuBookIcon />}>
          + New Recipe
        </Button>
        <Button variant="contained" color="primary" component={Link} to="/menus" startIcon={<RestaurantMenuIcon />}>
          + New Menu
        </Button>
        <Button variant="contained" color="primary" component={Link} to="/inventory" startIcon={<AutoAwesomeIcon />}>
          + Add Inventory
        </Button>
        <Button variant="contained" color="primary" component={Link} to="/reservations" startIcon={<RestaurantMenuIcon />}>
          + New Reservation
        </Button>
        <Button variant="outlined" color="info" component={Link} to="/chat" startIcon={<ChatIcon />}>
          Quick AI Chat
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>Upcoming Reservations (24h)</Typography>
      {upcomingRes.length === 0 && (
        <Box>
          <Typography color="text.secondary">No reservations in the next 24 hours.</Typography>
          <Button variant="contained" color="success" component={Link} to="/reservations" sx={{ mt: 1 }}>
            + Add Reservation
          </Button>
        </Box>
      )}
      {upcomingRes.map((r, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: "#232323", borderRadius: "16px" }}>
          <Typography fontWeight="bold">{r.name} <Chip label={r.outlet} /></Typography>
          <Typography>Guests: {r.guests} | Date: {r.date ? new Date(r.date).toLocaleString() : "Unknown"}</Typography>
          {r.note && <Typography color="text.secondary">{r.note}</Typography>}
          {r.allergies && <Typography color="error">Allergies: {r.allergies}</Typography>}
        </Paper>
      ))}

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>Recent Activity</Typography>
      <Box>
        <Typography fontWeight="bold" sx={{ color: "#bdf", mb: 0.5 }}>Latest Recipes</Typography>
        {recipes.slice(-2).reverse().map((r, i) => (
          <Paper key={i} sx={{ p: 1, mb: 1, bgcolor: "#232323", borderRadius: "10px" }}>
            <Typography variant="body2">{r.prompt || r.fileName} <span style={{ color: "#bbb", fontSize: "0.9rem" }}>{r.date ? new Date(r.date).toLocaleString() : ""}</span></Typography>
          </Paper>
        ))}
      </Box>
      <Box>
        <Typography fontWeight="bold" sx={{ color: "#bdf", mt: 2, mb: 0.5 }}>Latest Menus</Typography>
        {menus.slice(-2).reverse().map((m, i) => (
          <Paper key={i} sx={{ p: 1, mb: 1, bgcolor: "#232323", borderRadius: "10px" }}>
            <Typography variant="body2">{m.name}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function InventoryPage() {
  const OUTLETS = CATEGORY_OPTIONS.slice(1); // ["Breakfast", "Casual Restaurant", "Fine Dining", ...]
  const [outletTab, setOutletTab] = useState(0);
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory");
    return saved ? JSON.parse(saved) : [
      { name: "Wagyu Beef", status: "low", qty: 5, unit: "kg", type: "Proteins", location: "Walk-in Cooler", outlet: "Fine Dining" }
    ];
  });
  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);
  const [addInvOpen, setAddInvOpen] = useState(false);
  const [newInv, setNewInv] = useState({ name: "", status: "good", qty: "", unit: "kg", type: "", location: "", outlet: OUTLETS[0] });

  const filtered = inventory.filter(item =>
    (outletTab === 0 || item.outlet === OUTLETS[outletTab - 1]) &&
    (item.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Paper sx={{ p: 4, background: "#1a1a1a", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ color: "#00ffc3", mb: 2 }}>
        <span role="img" aria-label="inventory">📦</span> Inventory Management
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, bgcolor: "#232323", flex: 1 }}>
          <b>Total Items</b><br />{inventory.length}
        </Paper>
        <Button variant="contained" color="success" sx={{ ml: 2, height: 48 }} onClick={() => setAddInvOpen(true)}>
          + Add Item
        </Button>
      </Box>
      <TextField
        placeholder="Search inventory..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth sx={{ mb: 2, bgcolor: "#222", borderRadius: 2 }}
      />
      <Tabs value={outletTab} onChange={(_, v) => setOutletTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        {OUTLETS.map(o => <Tab key={o} label={o} />)}
      </Tabs>
      {filtered.map((item, idx) => (
        <Paper key={item.name + idx} sx={{ p: 2, mb: 2, bgcolor: "#222", borderRadius: 3, display: "flex", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight="bold">{item.name}
              {item.status === "low" && <Chip label="low" size="small" color="warning" sx={{ ml: 1 }} />}
              {item.status === "good" && <Chip label="good" size="small" color="success" sx={{ ml: 1 }} />}
            </Typography>
            <Typography color="text.secondary" fontSize="small">{item.type} • {item.location}</Typography>
          </Box>
          <Box fontWeight="bold" fontSize="1.3rem">{item.qty} {item.unit}</Box>
        </Paper>
      ))}

      {/* Add Item Dialog */}
      <Dialog open={addInvOpen} onClose={() => setAddInvOpen(false)}>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={newInv.name} onChange={e => setNewInv({ ...newInv, name: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Status" select value={newInv.status} onChange={e => setNewInv({ ...newInv, status: e.target.value })} fullWidth sx={{ mb: 2 }}>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
          <TextField label="Quantity" value={newInv.qty} onChange={e => setNewInv({ ...newInv, qty: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Unit" select value={newInv.unit} onChange={e => setNewInv({ ...newInv, unit: e.target.value })} fullWidth sx={{ mb: 2 }}>
            {["kg", "g", "l", "ml", "pieces"].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField label="Type" value={newInv.type} onChange={e => setNewInv({ ...newInv, type: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Location" value={newInv.location} onChange={e => setNewInv({ ...newInv, location: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Outlet" select value={newInv.outlet} onChange={e => setNewInv({ ...newInv, outlet: e.target.value })} fullWidth sx={{ mb: 2 }}>
            {OUTLETS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddInvOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            setInventory([...inventory, newInv]);
            setAddInvOpen(false);
            setNewInv({ name: "", status: "good", qty: "", unit: "kg", type: "", location: "", outlet: OUTLETS[0] });
          }} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function RecipesPage() {
  const { prompt, setPrompt } = useContext(PromptContext);
const [aiResult, setAiResult] = useState("");
const [loading, setLoading] = useState(false);
const [snack, setSnack] = useState("");
const [recipes, setRecipes] = useState(() => {
  const saved = localStorage.getItem("recipes");
  return saved ? JSON.parse(saved) : [];
});
const [openRecipeModal, setOpenRecipeModal] = useState({ open: false, recipe: null });
  useEffect(() => { localStorage.setItem("recipes", JSON.stringify(recipes)); }, [recipes]);

  const handleAI = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a world-class chef assistant. ALWAYS use metric units (kg, g, l, ml, cm) in all recipes and menus. Generate a menu or recipe, or answer chef questions, based on the prompt." },
            { role: "user", content: prompt }
          ],
          max_tokens: 650,
        },
        {
          headers: {
             "Content-Type": "application/json",
  "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`// <--- Replace with your key
          }
        }
      );
      setAiResult(res.data.choices[0].message.content);
      setSnack("AI suggestion ready!");
    } catch {
      setSnack("AI failed. Check Groq API key or connection.");
    } finally { setLoading(false); }
  };

  const handleSave = () => {
    setRecipes([...recipes, { prompt, aiResult, date: new Date().toISOString() }]);
    setPrompt(""); setAiResult(""); setSnack("Saved!");
  };

  const [search, setSearch] = useState("");
  const filteredRecipes = recipes.filter(r =>
  (r.prompt || "").toLowerCase().includes(search.toLowerCase()) ||
  (r.aiResult || "").toLowerCase().includes(search.toLowerCase())
);


  return (
    <Box sx={{ p: 4, mt: 3 }}>
      <Typography variant="h5" sx={{ color: "#00ffc3", mb: 2 }}>AI Menu/Recipe Generator</Typography>
      <TextField
        label="Describe your menu/recipe or ask a chef question (e.g. 'Spring vegan brunch', 'How to cook Wagyu?')"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        fullWidth multiline minRows={2}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleAI} disabled={loading || !prompt}>Generate</Button>
      {loading && <CircularProgress sx={{ ml: 2 }} />}
      {aiResult && (
        <Box mt={3}>
          <Typography variant="subtitle1" sx={{ color: "#bdf" }}>AI Suggestion</Typography>
          <TextField multiline fullWidth minRows={5} value={aiResult} InputProps={{ readOnly: true }} />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>Save to Recipes</Button>
        </Box>
      )}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />

      {/* Search/filter */}
      <TextField
        label="Search saved recipes"
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mt: 5, mb: 2, bgcolor: "#232323", borderRadius: 2 }}
      />

      {/* Organized, Clean Recipe Cards */}
      <Box>
        <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>Saved Suggestions</Typography>
        {filteredRecipes.length === 0 && <Typography color="text.secondary">No recipes match your search.</Typography>}
        <Grid container spacing={2}>
          {filteredRecipes.map((r, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Paper sx={{
                p: 2, mb: 2, bgcolor: "#232323", borderRadius: 3, display: "flex", flexDirection: "column", gap: 1, minHeight: 120,
                boxShadow: "0 2px 16px #00ffc322"
              }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography fontWeight="bold" sx={{ fontSize: "1.08rem" }}>
                      {r.prompt} <Chip label="AI" size="small" color="secondary" sx={{ ml: 1 }} />
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                      {new Date(r.date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="View Full Recipe">
                      <IconButton color="primary" onClick={() => setOpenRecipeModal({ open: true, recipe: r })}>👁️</IconButton>
                    </Tooltip>
                    <Tooltip title="Share Recipe">
                      <IconButton color="primary" onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: r.prompt,
                            text: r.aiResult,
                          });
                        } else {
                          setSnack("Web Share not supported.");
                        }
                      }}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => setRecipes(recipes.filter((_, j) => j !== i))}>✖</IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {(r.aiResult || "").split("\n")[0]?.slice(0, 120)}...
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Dialog open={!!openRecipeModal?.open} onClose={() => setOpenRecipeModal({ open: false, recipe: null })}>
          <DialogTitle>Recipe</DialogTitle>
          <DialogContent>
            <Typography fontWeight="bold">{openRecipeModal?.recipe?.prompt}</Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{openRecipeModal?.recipe?.aiResult}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRecipeModal({ open: false, recipe: null })}>Close</Button>
            <Button
              startIcon={<ShareIcon />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: openRecipeModal?.recipe?.prompt,
                    text: openRecipeModal?.recipe?.aiResult,
                  });
                } else {
                  setSnack("Web Share not supported.");
                }
              }}
            >Share</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

function MenusPage() {
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem("menus");
    return saved ? JSON.parse(saved) : [
      { name: "Breakfast Menu", url: "https://www.iberico.jp/menus/breakfast.pdf" },
      { name: "Fine Dining Menu", url: "https://www.iberico.jp/menus/finedining.pdf" },
      { name: "Room Service Menu", url: "https://www.iberico.jp/menus/roomservice.pdf" }
    ];
  });
  const [addDialog, setAddDialog] = useState(false);
  const [newMenu, setNewMenu] = useState({ name: "", url: "" });

  useEffect(() => {
    localStorage.setItem("menus", JSON.stringify(menus));
  }, [menus]);

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Menus</Typography>
      <Button variant="contained" color="success" onClick={() => setAddDialog(true)} sx={{ mb: 2 }}>+ New Menu</Button>
      <ul>
        {menus.map((menu, i) => (
          <li key={i}>
            <a href={menu.url} target="_blank" rel="noopener noreferrer" style={{color:"#00ffc3"}}>{menu.name}</a>
          </li>
        ))}
      </ul>
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>New Menu</DialogTitle>
        <DialogContent>
          <TextField label="Menu Name" value={newMenu.name} onChange={e => setNewMenu({ ...newMenu, name: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Menu File or URL" value={newMenu.url} onChange={e => setNewMenu({ ...newMenu, url: e.target.value })} fullWidth sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setMenus([...menus, newMenu]);
            setAddDialog(false);
            setNewMenu({ name: "", url: "" });
          }}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
function ReservationsPage() {
  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : [];
  });
  const [addDialog, setAddDialog] = useState(false);
  const [newRes, setNewRes] = useState({
    name: "",
    guests: "",
    outlet: "Fine Dining",
    note: "",
    allergies: "",
    date: "",
  });

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Reservations</Typography>
      <Button variant="contained" color="success" onClick={() => setAddDialog(true)} sx={{ mb: 2 }}>
        + New Reservation
      </Button>
      {reservations.length === 0 && (
        <Typography color="text.secondary">No reservations yet.</Typography>
      )}
      {reservations.map((res, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: "#232323" }}>
          <Typography fontWeight="bold">
            {res.name} <Chip label={res.outlet} />
          </Typography>
          <Typography>Guests: {res.guests}</Typography>
          {res.date && <Typography>Date: {new Date(res.date).toLocaleString()}</Typography>}
          {res.note && <Typography color="text.secondary">{res.note}</Typography>}
          {res.allergies && (
            <Typography color="error">Allergies: {res.allergies}</Typography>
          )}
        </Paper>
      ))}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>New Reservation</DialogTitle>
        <DialogContent>
          <TextField
            label="Guest Name"
            value={newRes.name}
            onChange={e => setNewRes({ ...newRes, name: e.target.value })}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="Guests"
            value={newRes.guests}
            onChange={e => setNewRes({ ...newRes, guests: e.target.value })}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="Outlet"
            select
            value={newRes.outlet}
            onChange={e => setNewRes({ ...newRes, outlet: e.target.value })}
            fullWidth sx={{ mb: 2 }}
          >
            {CATEGORY_OPTIONS.slice(1).map(o => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date & Time"
            type="datetime-local"
            value={newRes.date}
            onChange={e => setNewRes({ ...newRes, date: e.target.value })}
            fullWidth sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Special Requests"
            value={newRes.note}
            onChange={e => setNewRes({ ...newRes, note: e.target.value })}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="Allergies"
            value={newRes.allergies}
            onChange={e => setNewRes({ ...newRes, allergies: e.target.value })}
            fullWidth sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReservations([...reservations, newRes]);
              setAddDialog(false);
              setNewRes({
                name: "",
                guests: "",
                outlet: "Fine Dining",
                note: "",
                allergies: "",
                date: "",
              });
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function CalendarPage() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendarEvents");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);
  const [eventDialog, setEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "" });

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Kitchen Calendar</Typography>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={info => {
          setNewEvent({ title: "", date: info.dateStr });
          setEventDialog(true);
        }}
        height={420}
      />
      <Dialog open={eventDialog} onClose={() => setEventDialog(false)}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <TextField label="Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <Typography>Date: {newEvent.date}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setEvents([...events, { title: newEvent.title, date: newEvent.date }]);
            setEventDialog(false);
          }}>Add</Button>
        </DialogActions>
      </Dialog>
      <Box mt={3}>
        <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>Upcoming Events</Typography>
        {events.length === 0 && <Typography color="text.secondary">No events yet.</Typography>}
        {events.map((ev, i) => (
          <Paper key={i} sx={{ p: 1, mb: 1, bgcolor: "#232323" }}>
            <Typography fontWeight="bold">{ev.title} <span style={{ color: "#bbb", fontSize: "0.9rem" }}>{ev.date ? new Date(ev.date).toLocaleDateString() : ""}</span></Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function PhotosPage() {
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem("photos");
    return saved ? JSON.parse(saved) : [];
  });
  const [photoModal, setPhotoModal] = useState({ open: false, src: "" });

  useEffect(() => {
    localStorage.setItem("photos", JSON.stringify(photos));
  }, [photos]);

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Photos</Typography>
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Add Photo
        <input hidden type="file" accept="image/*" capture="environment"
          onChange={e => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = evt => setPhotos(p => {
                const np = [...p, evt.target.result];
                localStorage.setItem("photos", JSON.stringify(np));
                return np;
              });
              reader.readAsDataURL(e.target.files[0]);
            }
          }}
        />
      </Button>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {photos.map((photo, i) => (
          <Box key={i} sx={{ position: "relative" }}>
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              style={{ maxWidth: 150, borderRadius: 8, cursor: "pointer" }}
              onClick={() => setPhotoModal({ open: true, src: photo })}
            />
            <Button
              size="small"
              color="error"
              sx={{ position: "absolute", top: 4, right: 4, minWidth: 0, borderRadius: "50%" }}
              onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
            >X</Button>
          </Box>
        ))}
      </Box>
      <Dialog open={photoModal.open} onClose={() => setPhotoModal({ open: false, src: "" })} maxWidth="md" fullWidth>
        <img src={photoModal.src} alt="Photo Full" style={{ maxWidth: "100%" }} />
      </Dialog>
    </Box>
  );
}

function ChatAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem("chatHistory", JSON.stringify(chatHistory)); }, [chatHistory]);

  const handleAI = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a chef assistant AI. Answer chef questions or offer tips." },
            { role: "user", content: prompt }
          ],
          max_tokens: 400,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          }
        }
      );
      setAiResult(res.data.choices[0].message.content);
      setChatHistory([...chatHistory, { prompt, aiResult: res.data.choices[0].message.content, date: new Date().toISOString() }]);
      setPrompt("");
      setSnack("AI answered!");
    } catch { setSnack("AI failed."); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>AI Chat Assistant</Typography>
      <TextField
        label="Ask the Chef AI (e.g. 'How do I clarify butter?', 'Best wine for lamb?')"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        fullWidth multiline minRows={2}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleAI} disabled={loading || !prompt}>Ask</Button>
      {loading && <CircularProgress sx={{ ml: 2 }} />}
      {aiResult && (
        <Box mt={3}>
          <Typography variant="subtitle1" sx={{ color: "#bdf" }}>AI Answer</Typography>
          <TextField multiline fullWidth minRows={3} value={aiResult} InputProps={{ readOnly: true }} />
        </Box>
      )}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
      <Box mt={5}>
        <Typography variant="h6" sx={{ color: "#00ffc3", mb: 1 }}>Chat History</Typography>
        {chatHistory.length === 0 && <Typography color="text.secondary">No chat history yet.</Typography>}
        {chatHistory.map((c, i) => (
          <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: "#232323" }}>
            <Typography fontWeight="bold">{c.prompt} <span style={{ color: "#bbb", fontSize: "1rem" }}>{new Date(c.date).toLocaleString()}</span></Typography>
            <Typography variant="body2" color="text.secondary">{c.aiResult?.slice(0, 300)}...</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function ChefVaultPage({ onInsert }) {
  const { setPrompt } = useContext(PromptContext);
  const [vault, setVault] = useState(() => {
    const saved = localStorage.getItem("chefVault");
    return saved ? JSON.parse(saved) : [];
  });
  const [addDialog, setAddDialog] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", ingredients: "", instructions: "" });
  const [snack, setSnack] = useState("");

  useEffect(() => {
    localStorage.setItem("chefVault", JSON.stringify(vault));
  }, [vault]);

  const handleInsert = (recipe) => {
    if (onInsert) {
      onInsert(
        `${recipe.name}\nIngredients:\n${recipe.ingredients}\nInstructions:\n${recipe.instructions}`
      );
      setSnack("Inserted into AI prompt!");
    }
  };

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ color: "#00ffc3", mb: 2 }}>Chef Vault</Typography>
      <Button variant="contained" color="success" onClick={() => setAddDialog(true)} sx={{ mb: 2 }}>+ Add Recipe</Button>
      {vault.length === 0 && <Typography color="text.secondary">No chef recipes yet.</Typography>}
      {vault.map((r, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: "#232323", borderRadius: 3 }}>
          <Typography fontWeight="bold">{r.name}</Typography>
          <Typography variant="body2" color="text.secondary"><b>Ingredients:</b> {r.ingredients}</Typography>
          <Typography variant="body2" color="text.secondary"><b>Instructions:</b> {r.instructions}</Typography>
          <Box sx={{ mt: 1 }}>
            {onInsert && (
              <Button
  size="small"
  variant="outlined"
  color="primary"
  sx={{ mr: 1 }}
  onClick={() => {
    setPrompt(
      `${r.name}\nIngredients:\n${r.ingredients}\nInstructions:\n${r.instructions}`
    );
    setSnack("Inserted into AI prompt! Go to Recipes to use.");
  }}
>
                Insert to AI
              </Button>
            )}
            <Button size="small" color="error" onClick={() => setVault(vault.filter((_, j) => j !== i))}>Delete</Button>
          </Box>
        </Paper>
      ))}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Add Chef Recipe</DialogTitle>
        <DialogContent>
          <TextField label="Recipe Name" value={newRecipe.name} onChange={e => setNewRecipe(r => ({ ...r, name: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Ingredients" value={newRecipe.ingredients} onChange={e => setNewRecipe(r => ({ ...r, ingredients: e.target.value }))} fullWidth multiline minRows={2} sx={{ mb: 2 }} />
          <TextField label="Instructions" value={newRecipe.instructions} onChange={e => setNewRecipe(r => ({ ...r, instructions: e.target.value }))} fullWidth multiline minRows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (newRecipe.name && newRecipe.ingredients && newRecipe.instructions) {
              setVault([...vault, newRecipe]);
              setNewRecipe({ name: "", ingredients: "", instructions: "" });
              setAddDialog(false);
            }
          }}>Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

function SectionStub({ title }) {
  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" color="secondary">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        This section is coming soon or under construction.
      </Typography>
    </Box>
  );
}


export default App;
