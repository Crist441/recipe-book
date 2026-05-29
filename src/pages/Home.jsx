import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, ChefHat, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Recipe } from "@/api/recipeStore";
import RecipeCard from "@/components/recipe/RecipeCard";
import { sampleRecipes } from "@/data/sampleRecipes";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function Home() {
  const [search, setSearch]         = useState("");
  const [tag, setTag]               = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [favOnly, setFavOnly]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const queryClient = useQueryClient();

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: Recipe.list,
  });

  const handleLoadSamples = async () => {
    setLoading(true);
    for (const r of sampleRecipes) {
      await Recipe.create(r);
    }
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
    setLoading(false);
  };

  const allTags = [...new Set(recipes.flatMap((r) => r.tags ?? []))];

  const filtered = recipes.filter((r) => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subtitle?.toLowerCase().includes(search.toLowerCase());
    const matchTag        = !tag || r.tags?.includes(tag);
    const matchDifficulty = difficulty === "All" || r.difficulty === difficulty;
    const matchFav        = !favOnly || r.isFavorite;
    return matchSearch && matchTag && matchDifficulty && matchFav;
  });

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground">My Recipe Book</h1>
          <p className="font-body text-muted-foreground mt-1">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          {recipes.length === 0 && (
            <button
              onClick={handleLoadSamples}
              disabled={loading}
              className="flex items-center gap-2 bg-muted text-foreground font-body font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              {loading ? "Loading…" : "Load Sample Recipes"}
            </button>
          )}
          <Link
            to="/add"
            className="flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Recipe
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        {allTags.length > 0 && (
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Difficulty + Favorites chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              if (d === "All") setFavOnly(false);
            }}
            className={`text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-colors ${
              difficulty === d && !favOnly
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-colors ${
            favOnly
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Heart className="w-3 h-3" /> Favorites
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <ChefHat className="w-14 h-14 text-muted-foreground opacity-30" />
          <p className="font-heading text-xl text-foreground">No recipes found</p>
          <p className="font-body text-sm text-muted-foreground">
            {search || tag || difficulty !== "All" || favOnly
              ? "Try different filters."
              : "Add your first recipe to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </motion.main>
  );
}
