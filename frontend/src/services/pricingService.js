// Tokyo Hotel Inventory Pricing Database
export const TOKYO_INVENTORY_PRICING = {
  // Proteins
  'wagyu beef': { price: 18000, unit: 'kg', supplier: 'Tokyo Premium Meats' },
  'beef': { price: 3200, unit: 'kg', supplier: 'Tokyo Premium Meats' },
  'chicken': { price: 800, unit: 'kg', supplier: 'Fresh Poultry Tokyo' },
  'pork': { price: 1200, unit: 'kg', supplier: 'Tokyo Premium Meats' },
  'salmon': { price: 2800, unit: 'kg', supplier: 'Tsukiji Fish Market' },
  'tuna': { price: 4500, unit: 'kg', supplier: 'Tsukiji Fish Market' },
  'uni': { price: 450, unit: 'piece', supplier: 'Tsukiji Fish Market' },
  'sea urchin': { price: 450, unit: 'piece', supplier: 'Tsukiji Fish Market' },

  // Vegetables
  'shiitake mushrooms': { price: 800, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'mushrooms': { price: 600, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'onions': { price: 180, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'carrots': { price: 220, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'potatoes': { price: 150, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'tomatoes': { price: 380, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'lettuce': { price: 280, unit: 'kg', supplier: 'Fresh Farm Tokyo' },
  'spinach': { price: 320, unit: 'kg', supplier: 'Fresh Farm Tokyo' },

  // Grains & Starches
  'koshihikari rice': { price: 120, unit: 'kg', supplier: 'Niigata Rice Co.' },
  'rice': { price: 120, unit: 'kg', supplier: 'Niigata Rice Co.' },
  'flour': { price: 85, unit: 'kg', supplier: 'Tokyo Mills' },
  'bread': { price: 340, unit: 'kg', supplier: 'Artisan Bakery Tokyo' },

  // Condiments & Seasonings
  'soy sauce': { price: 340, unit: 'bottle', supplier: 'Kikkoman Direct' },
  'miso': { price: 420, unit: 'kg', supplier: 'Traditional Miso Co.' },
  'sake': { price: 850, unit: 'bottle', supplier: 'Premium Sake Tokyo' },
  'mirin': { price: 380, unit: 'bottle', supplier: 'Kikkoman Direct' },
  'sesame oil': { price: 680, unit: 'bottle', supplier: 'Quality Oils Tokyo' },
  'olive oil': { price: 1200, unit: 'bottle', supplier: 'Quality Oils Tokyo' },
  'salt': { price: 120, unit: 'kg', supplier: 'Sea Salt Co.' },
  'sugar': { price: 180, unit: 'kg', supplier: 'Tokyo Sugar Mills' },

  // Dairy
  'butter': { price: 680, unit: 'kg', supplier: 'Premium Dairy Tokyo' },
  'cream': { price: 450, unit: 'liter', supplier: 'Premium Dairy Tokyo' },
  'milk': { price: 280, unit: 'liter', supplier: 'Premium Dairy Tokyo' },
  'cheese': { price: 1200, unit: 'kg', supplier: 'Artisan Cheese Tokyo' },
  'eggs': { price: 320, unit: 'dozen', supplier: 'Farm Fresh Tokyo' }
};

// Unit conversion factors to standardize to grams
export const UNIT_CONVERSIONS = {
  'kg': 1000,
  'g': 1,
  'liter': 1000, // assume 1ml = 1g for liquids
  'ml': 1,
  'bottle': 750, // standard bottle size in ml
  'piece': 50, // average piece weight in grams
  'dozen': 600, // dozen eggs approximately 600g
  'cup': 240, // 1 cup = 240g
  'cups': 240,
  'tbsp': 15, // 1 tablespoon = 15g
  'tsp': 5 // 1 teaspoon = 5g
};

export const calculateIngredientCost = (ingredientName, quantity, unit) => {
  // Normalize ingredient name for lookup
  const normalizedName = ingredientName.toLowerCase().trim();

  // Find matching ingredient in pricing database
  let pricingData = TOKYO_INVENTORY_PRICING[normalizedName];

  // If exact match not found, try partial matches
  if (!pricingData) {
    const partialMatch = Object.keys(TOKYO_INVENTORY_PRICING).find(key =>
      normalizedName.includes(key) || key.includes(normalizedName)
    );
    if (partialMatch) {
      pricingData = TOKYO_INVENTORY_PRICING[partialMatch];
    }
  }

  // If still no match, return estimated cost
  if (!pricingData) {
    console.warn(`No pricing data found for: ${ingredientName}`);
    return { cost: 50, estimated: true, supplier: 'Estimated' }; // Default ¥50 per 100g
  }

  // Convert quantities to grams for calculation
  const ingredientGrams = convertToGrams(quantity, unit);
  const pricePerGram = pricingData.price / convertToGrams(1, pricingData.unit);

  return {
    cost: Math.round(pricePerGram * ingredientGrams),
    estimated: false,
    supplier: pricingData.supplier,
    pricePerUnit: pricingData.price,
    unit: pricingData.unit
  };
};

const convertToGrams = (quantity, unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  const conversionFactor = UNIT_CONVERSIONS[normalizedUnit] || 100; // default 100g if unknown
  return quantity * conversionFactor;
};

export const calculateRecipeCost = (recipe) => {
  if (!recipe || !recipe.ingredients) {
    return { totalCost: 0, ingredientCosts: [], laborCost: 0 };
  }

  const ingredientCosts = recipe.ingredients.map(ingredient => {
    // Parse ingredient string to extract quantity and unit
    const parsed = parseIngredient(ingredient);
    const costData = calculateIngredientCost(parsed.name, parsed.quantity, parsed.unit);

    return {
      ingredient: ingredient,
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      cost: costData.cost,
      estimated: costData.estimated,
      supplier: costData.supplier
    };
  });

  const totalIngredientCost = ingredientCosts.reduce((sum, item) => sum + item.cost, 0);

  // Calculate labor cost (20% of ingredient cost as standard)
  const laborCost = Math.round(totalIngredientCost * 0.2);

  return {
    totalCost: totalIngredientCost + laborCost,
    ingredientCosts,
    laborCost,
    ingredientTotal: totalIngredientCost
  };
};

const parseIngredient = (ingredientString) => {
  // Parse strings like "2 cups flour", "500g beef", "1 large onion"
  const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/;
  const match = ingredientString.match(regex);

  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: match[2] || 'g',
      name: match[3].trim()
    };
  }

  // If no quantity found, assume 100g
  return {
    quantity: 100,
    unit: 'g',
    name: ingredientString.trim()
  };
};
