import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, ShoppingCart, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingList as SL } from "@/api/recipeStore";

const categoryEmoji = {
  Vegetable: "🥦", Protein: "🥩", Grain: "🌾", Dairy: "🧀",
  Fruit: "🍎", Spice: "🌶️", Sauce: "🫙", Other: "🍽️",
};

export default function ShoppingListPage() {
  const [items, setItems] = useState(() => SL.load());

  const refresh = () => setItems(SL.load());

  const toggle = (id) => { SL.toggleItem(id); refresh(); };
  const remove = (id) => { SL.removeItem(id); refresh(); };
  const clearChecked = () => { SL.clearChecked(); refresh(); };

  const unchecked = items.filter((i) => !i.checked);
  const checked   = items.filter((i) => i.checked);

  // Group unchecked by category
  const grouped = unchecked.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-accent font-body text-sm mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to recipes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Shopping List</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {unchecked.length} item{unchecked.length !== 1 ? "s" : ""} remaining
          </p>
        </div>
        {checked.length > 0 && (
          <button
            onClick={clearChecked}
            className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Clear checked
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <ShoppingCart className="w-14 h-14 text-muted-foreground opacity-30" />
          <p className="font-heading text-xl text-foreground">Your list is empty</p>
          <p className="font-body text-sm text-muted-foreground">
            Open any recipe and click "Add to list" to add ingredients here.
          </p>
          <Link to="/" className="text-accent text-sm hover:underline font-body">Browse recipes</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unchecked grouped by category */}
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <h3 className="flex items-center gap-2 text-xs font-body font-bold text-muted-foreground uppercase tracking-wider mb-2">
                <span>{categoryEmoji[cat] ?? "🍽️"}</span> {cat}
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {catItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(item.id)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-body text-sm font-medium text-foreground">{item.name}</span>
                        {item.amount && (
                          <span className="font-body text-xs text-muted-foreground ml-2">{item.amount}</span>
                        )}
                        {item.source && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">from {item.source}</p>
                        )}
                      </div>
                      <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* Checked items */}
          {checked.length > 0 && (
            <div>
              <h3 className="text-xs font-body font-bold text-muted-foreground uppercase tracking-wider mb-2">
                ✅ Done ({checked.length})
              </h3>
              <div className="space-y-2">
                {checked.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 opacity-60">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggle(item.id)}
                      className="w-4 h-4 accent-orange-500 cursor-pointer flex-shrink-0"
                    />
                    <span className="font-body text-sm text-muted-foreground line-through flex-1">{item.name}</span>
                    <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.main>
  );
}
