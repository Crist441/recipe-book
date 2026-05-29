import { Trash2 } from "lucide-react";

const CATEGORIES = ["Vegetable", "Protein", "Grain", "Dairy", "Fruit", "Spice", "Sauce", "Other"];

const inputCls =
  "px-3 py-2 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function IngredientFormRow({ ingredient, index, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-4">
        <input
          value={ingredient.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="Ingredient"
          className={`${inputCls} w-full`}
        />
      </div>
      <div className="col-span-2">
        <input
          value={ingredient.amount}
          onChange={(e) => onChange(index, "amount", e.target.value)}
          placeholder="Amount"
          className={`${inputCls} w-full`}
        />
      </div>
      <div className="col-span-3">
        <select
          value={ingredient.category}
          onChange={(e) => onChange(index, "category", e.target.value)}
          className={`${inputCls} w-full`}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <input
          value={ingredient.tip}
          onChange={(e) => onChange(index, "tip", e.target.value)}
          placeholder="Tip (optional)"
          className={`${inputCls} w-full`}
        />
      </div>
      <div className="col-span-1 flex items-center justify-center pt-2">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
