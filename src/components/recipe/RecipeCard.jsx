import { Link } from "react-router-dom";
import { Clock, Users, ChefHat, Heart } from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "./StarRating";

const difficultyColor = {
  Easy:   "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function RecipeCard({ recipe }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/recipe/${recipe.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 bg-muted overflow-hidden relative">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ChefHat className="w-12 h-12 opacity-30" />
              </div>
            )}
            {recipe.isFavorite && (
              <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/50 rounded-full p-1.5">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-heading font-bold text-foreground leading-tight line-clamp-2">
                {recipe.title}
              </h3>
              {recipe.difficulty && (
                <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${difficultyColor[recipe.difficulty] ?? "bg-muted text-muted-foreground"}`}>
                  {recipe.difficulty}
                </span>
              )}
            </div>

            {recipe.subtitle && (
              <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-2">
                {recipe.subtitle}
              </p>
            )}

            {recipe.rating > 0 && (
              <div className="mb-2">
                <StarRating value={recipe.rating} size="w-3.5 h-3.5" readonly />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
              {recipe.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {recipe.time}
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {recipe.servings} servings
                </span>
              )}
            </div>

            {recipe.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-body font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
