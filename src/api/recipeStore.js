// ─── Recipes ──────────────────────────────────────────────────────────────────
const RECIPES_KEY   = "capstone_recipes";
const RATINGS_KEY   = "capstone_ratings";
const FAVORITES_KEY = "capstone_favorites";
const SHOPPING_KEY  = "capstone_shopping";

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function loadObj(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Recipe CRUD ──────────────────────────────────────────────────────────────
export const Recipe = {
  list: async () => {
    const recipes   = load(RECIPES_KEY);
    const ratings   = loadObj(RATINGS_KEY);
    const favorites = load(FAVORITES_KEY);
    return recipes.map((r) => ({
      ...r,
      rating:     ratings[r.id] ?? 0,
      isFavorite: favorites.includes(r.id),
    }));
  },

  get: async (id) => {
    const all       = load(RECIPES_KEY);
    const ratings   = loadObj(RATINGS_KEY);
    const favorites = load(FAVORITES_KEY);
    const r = all.find((r) => r.id === id) ?? null;
    if (!r) return null;
    return { ...r, rating: ratings[id] ?? 0, isFavorite: favorites.includes(id) };
  },

  create: async (data) => {
    const all    = load(RECIPES_KEY);
    const record = { ...data, id: generateId(), created_at: new Date().toISOString() };
    save(RECIPES_KEY, [record, ...all]);
    return record;
  },

  update: async (id, data) => {
    const all = load(RECIPES_KEY);
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Recipe not found");
    all[idx] = { ...all[idx], ...data, updated_at: new Date().toISOString() };
    save(RECIPES_KEY, all);
    return all[idx];
  },

  delete: async (id) => {
    save(RECIPES_KEY, load(RECIPES_KEY).filter((r) => r.id !== id));
    // clean up related data
    const ratings = loadObj(RATINGS_KEY);
    delete ratings[id];
    save(RATINGS_KEY, ratings);
    save(FAVORITES_KEY, load(FAVORITES_KEY).filter((fid) => fid !== id));
  },
};

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const Ratings = {
  set: async (recipeId, stars) => {
    const ratings = loadObj(RATINGS_KEY);
    ratings[recipeId] = stars;
    save(RATINGS_KEY, ratings);
  },
};

// ─── Favorites ────────────────────────────────────────────────────────────────
export const Favorites = {
  toggle: async (recipeId) => {
    const favs = load(FAVORITES_KEY);
    const idx  = favs.indexOf(recipeId);
    if (idx === -1) favs.push(recipeId);
    else            favs.splice(idx, 1);
    save(FAVORITES_KEY, favs);
    return favs.includes(recipeId);
  },
  list: async () => load(FAVORITES_KEY),
};

// ─── Shopping List ────────────────────────────────────────────────────────────
export const ShoppingList = {
  load: () => load(SHOPPING_KEY),

  addFromRecipe: (recipe) => {
    const current = load(SHOPPING_KEY);
    const existing = new Set(current.map((i) => i.id));
    const newItems = (recipe.ingredients ?? [])
      .filter((ing) => ing.name)
      .map((ing) => ({
        id:       `${recipe.id}_${ing.name}`,
        name:     ing.name,
        amount:   ing.amount,
        category: ing.category,
        checked:  false,
        source:   recipe.title,
      }))
      .filter((i) => !existing.has(i.id));
    save(SHOPPING_KEY, [...current, ...newItems]);
  },

  toggleItem: (id) => {
    const list = load(SHOPPING_KEY);
    const idx  = list.findIndex((i) => i.id === id);
    if (idx !== -1) list[idx].checked = !list[idx].checked;
    save(SHOPPING_KEY, list);
  },

  removeItem: (id) => {
    save(SHOPPING_KEY, load(SHOPPING_KEY).filter((i) => i.id !== id));
  },

  clear: () => save(SHOPPING_KEY, []),
  clearChecked: () => save(SHOPPING_KEY, load(SHOPPING_KEY).filter((i) => !i.checked)),
};
