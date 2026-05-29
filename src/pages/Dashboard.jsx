import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Star, Clock, ChefHat, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Recipe } from "@/api/recipeStore";

function StatCard({ icon: Icon, label, value, color = "text-accent" }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-muted ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-xs font-body text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Bar({ label, count, max, color }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-body text-muted-foreground w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-body font-semibold text-foreground w-5 text-right">{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: recipes = [] } = useQuery({ queryKey: ["recipes"], queryFn: Recipe.list });

  const total     = recipes.length;
  const favorites = recipes.filter((r) => r.isFavorite).length;
  const rated     = recipes.filter((r) => r.rating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1)
    : "—";

  const byDifficulty = {
    Easy:   recipes.filter((r) => r.difficulty === "Easy").length,
    Medium: recipes.filter((r) => r.difficulty === "Medium").length,
    Hard:   recipes.filter((r) => r.difficulty === "Hard").length,
  };
  const maxDiff = Math.max(...Object.values(byDifficulty), 1);

  // Top tags
  const tagCounts = recipes.flatMap((r) => r.tags ?? []).reduce((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTag  = topTags[0]?.[1] ?? 1;

  // Recent 3 recipes
  const recent = [...recipes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-accent font-body text-sm mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="font-body text-muted-foreground mb-8">Your recipe collection at a glance.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen}   label="Total Recipes"  value={total}     color="text-accent" />
        <StatCard icon={Heart}      label="Favorites"      value={favorites} color="text-red-500" />
        <StatCard icon={Star}       label="Avg. Rating"    value={avgRating} color="text-amber-500" />
        <StatCard icon={ChefHat}    label="Recipes Rated"  value={rated.length} color="text-violet-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Difficulty breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> By Difficulty
          </h2>
          <div className="space-y-3">
            <Bar label="Easy"   count={byDifficulty.Easy}   max={maxDiff} color="bg-green-400" />
            <Bar label="Medium" count={byDifficulty.Medium} max={maxDiff} color="bg-yellow-400" />
            <Bar label="Hard"   count={byDifficulty.Hard}   max={maxDiff} color="bg-red-400" />
          </div>
        </div>

        {/* Top tags */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-bold text-foreground mb-4">🏷️ Top Tags</h2>
          {topTags.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">No tags yet.</p>
          ) : (
            <div className="space-y-3">
              {topTags.map(([tag, count]) => (
                <Bar key={tag} label={tag} count={count} max={maxTag} color="bg-accent" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent recipes */}
      {recent.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-bold text-foreground mb-4">🕒 Recently Added</h2>
          <div className="space-y-3">
            {recent.map((r) => (
              <Link
                key={r.id}
                to={`/recipe/${r.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {r.image_url
                    ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground opacity-40" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-foreground truncate">{r.title}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {r.difficulty} · {r.servings} servings
                  </p>
                </div>
                {r.isFavorite && <Heart className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16">
          <p className="font-heading text-xl text-foreground mb-2">No data yet</p>
          <p className="text-sm text-muted-foreground font-body mb-4">Add some recipes to see your stats.</p>
          <Link to="/add" className="text-accent hover:underline text-sm font-body">Add your first recipe →</Link>
        </div>
      )}
    </motion.main>
  );
}
