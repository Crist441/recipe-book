import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, ChefHat, Pencil, Trash2, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Recipe, Ratings, Favorites, ShoppingList } from "@/api/recipeStore";
import StarRating from "@/components/recipe/StarRating";

const difficultyColor = {
  Easy:   "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const categoryEmoji = {
  Vegetable: "🥦", Protein: "🥩", Grain: "🌾", Dairy: "🧀",
  Fruit: "🍎", Spice: "🌶️", Sauce: "🫙", Other: "🍽️",
};

function scaleAmount(amount, factor) {
  if (!amount) return "";
  return amount.replace(/[\d.\/]+/g, (n) => {
    if (n.includes("/")) {
      const [a, b] = n.split("/");
      return (parseFloat(a) / parseFloat(b) * factor).toFixed(2).replace(/\.?0+$/, "");
    }
    const result = parseFloat(n) * factor;
    return Number.isInteger(result) ? result : result.toFixed(1);
  });
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [shoppingAdded, setShoppingAdded] = useState(false);

  const { data: recipe, isLoading, refetch } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => Recipe.get(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      navigate("/");
    },
  });

  const handleRate = async (stars) => {
    await Ratings.set(id, stars);
    refetch();
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
  };

  const handleFavorite = async () => {
    await Favorites.toggle(id);
    refetch();
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
  };

  const handleAddToShopping = () => {
    ShoppingList.addFromRecipe(recipe);
    setShoppingAdded(true);
    setTimeout(() => setShoppingAdded(false), 2000);
  };

  if (isLoading) return <div className="flex justify-center py-20 text-muted-foreground">Loading…</div>;
  if (!recipe) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <p className="font-heading text-xl">Recipe not found.</p>
      <Link to="/" className="text-accent hover:underline text-sm">Back to recipes</Link>
    </div>
  );

  const baseServings = recipe.servings ?? 1;
  const currentServings = Math.round(baseServings * servingMultiplier);

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-6 py-8 pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-accent font-body text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1.5 text-sm font-body font-semibold px-4 py-2 rounded-xl border transition-colors ${
              recipe.isFavorite
                ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "border-border hover:bg-muted"
            }`}
          >
            <Heart className={`w-4 h-4 ${recipe.isFavorite ? "fill-current" : ""}`} />
            {recipe.isFavorite ? "Saved" : "Save"}
          </button>
          <Link
            to={`/edit/${id}`}
            className="flex items-center gap-1.5 text-sm font-body font-semibold px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={() => window.confirm("Delete this recipe?") && deleteMutation.mutate()}
            className="flex items-center gap-1.5 text-sm font-body font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Hero */}
      {recipe.image_url ? (
        <div className="w-full h-64 rounded-2xl overflow-hidden mb-6">
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-48 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <ChefHat className="w-14 h-14 text-muted-foreground opacity-30" />
        </div>
      )}

      {/* Title + meta */}
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{recipe.title}</h1>
      {recipe.subtitle && <p className="font-body text-muted-foreground mb-4">{recipe.subtitle}</p>}

      {/* Star rating */}
      <div className="flex items-center gap-3 mb-4">
        <StarRating value={recipe.rating} onChange={handleRate} />
        <span className="text-xs text-muted-foreground font-body">
          {recipe.rating > 0 ? `${recipe.rating}/5` : "Rate this recipe"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {recipe.difficulty && (
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${difficultyColor[recipe.difficulty] ?? "bg-muted text-muted-foreground"}`}>
            {recipe.difficulty}
          </span>
        )}
        {recipe.time && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground font-body">
            <Clock className="w-4 h-4" /> {recipe.time}
          </span>
        )}
      </div>

      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {recipe.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-body font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Ingredients</h2>
            <div className="flex items-center gap-3">
              {/* Serving scaler */}
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
                <button
                  onClick={() => setServingMultiplier((m) => Math.max(0.5, m - 0.5))}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-body font-semibold text-foreground min-w-[60px] text-center">
                  {currentServings} {currentServings === 1 ? "serving" : "servings"}
                </span>
                <button
                  onClick={() => setServingMultiplier((m) => m + 0.5)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to shopping list */}
              <button
                onClick={handleAddToShopping}
                className={`flex items-center gap-1.5 text-sm font-body font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  shoppingAdded
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-accent/10 text-accent hover:bg-accent/20"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {shoppingAdded ? "Added!" : "Add to list"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <span className="text-lg">{categoryEmoji[ing.category] ?? "🍽️"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-body font-semibold text-sm text-foreground">{ing.name}</span>
                    {ing.amount && (
                      <span className="font-body text-xs text-muted-foreground">
                        {scaleAmount(ing.amount, servingMultiplier)}
                      </span>
                    )}
                  </div>
                  {ing.tip && <p className="font-body text-xs text-muted-foreground mt-0.5 italic">{ing.tip}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      {recipe.steps?.length > 0 && (
        <section>
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Directions</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-body text-sm text-foreground leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.main>
  );
}
