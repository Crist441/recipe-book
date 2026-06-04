import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Recipe } from "@/api/recipeStore";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, Camera } from "lucide-react";
import ImageUpload from "@/components/recipe/ImageUpload";
import IngredientFormRow from "@/components/recipe/IngredientFormRow";
import StepFormRow from "@/components/recipe/StepFormRow";
import IngredientScanner from "@/components/recipe/IngredientScanner";
import { motion } from "framer-motion";

const emptyIngredient = { name: "", amount: "", tip: "", category: "Vegetable" };

export default function AddRecipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const [form, setForm] = useState({
    title: "", subtitle: "", time: "", servings: "",
    difficulty: "Easy", tags: "", image_url: "",
    ingredients: [{ ...emptyIngredient }], steps: [""],
  });

  const createMutation = useMutation({
    mutationFn: (data) => Recipe.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recipes"] }); navigate("/"); },
  });

  const updateField = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const updateIngredient = (i, field, val) => setForm((f) => { const arr = [...f.ingredients]; arr[i] = { ...arr[i], [field]: val }; return { ...f, ingredients: arr }; });
  const removeIngredient = (i) => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));
  const updateStep = (i, val) => setForm((f) => { const arr = [...f.steps]; arr[i] = val; return { ...f, steps: arr }; });
  const removeStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const handleScannedIngredients = (detected, recipe, imageUrl) => {
    if (recipe) {
      setForm({
        title: recipe.title,
        subtitle: recipe.subtitle,
        time: recipe.time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        image_url: imageUrl || "",
        ingredients: [...recipe.ingredients, { ...emptyIngredient }],
        steps: recipe.steps,
      });
    } else {
      setForm((f) => {
        const existing = f.ingredients.map((i) => i.name.toLowerCase());
        const newOnes = detected.filter((name) => !existing.includes(name.toLowerCase())).map((name) => ({ ...emptyIngredient, name }));
        const base = f.ingredients.filter((i) => i.name);
        return { ...f, ingredients: [...base, ...newOnes, { ...emptyIngredient }] };
      });
    }
    setShowScanner(false);
  };

  const handleSubmit = () => {
    const data = {
      title: form.title || "Untitled Recipe", subtitle: form.subtitle,
      image_url: form.image_url, time: form.time,
      servings: Number(form.servings) || 2, difficulty: form.difficulty,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ingredients: form.ingredients.filter((i) => i.name),
      steps: form.steps.filter((s) => s),
    };
    createMutation.mutate(data);
  };

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-6 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-accent font-body text-sm mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to recipes
      </Link>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Add New Recipe</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Fill in the details below. Add tips to each ingredient to help readers understand the dish better.</p>
      <div className="mb-8">
        <div className="relative w-full h-52 rounded-2xl border-2 border-dashed border-border overflow-hidden">
          {(form.image_url || scannedImage) ? (
            <img src={form.image_url || scannedImage} alt="Recipe" className="w-full h-full object-cover" />
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer gap-2">
              <span className="text-sm font-body text-muted-foreground">Click or drag to upload photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => updateField("image_url", ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </label>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Recipe Title *</label>
          <input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Grilled Pork Tenderloin" className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Short Description</label>
          <input value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="A brief tagline for this recipe" className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <div>
          <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Total Time</label>
          <input value={form.time} onChange={(e) => updateField("time", e.target.value)} placeholder="e.g. 3h 45min" className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Servings</label>
            <input type="number" value={form.servings} onChange={(e) => updateField("servings", e.target.value)} placeholder="4" className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40">
              {["Easy", "Medium", "Hard"].map((d) => (<option key={d}>{d}</option>))}
            </select>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <label className="block text-[11px] font-body text-muted-foreground tracking-wider uppercase mb-1.5">Tags (comma separated)</label>
        <input value={form.tags} onChange={(e) => updateField("tags", e.target.value)} placeholder="e.g. Grilling, Summer, Vegetarian" className="w-full px-4 py-3 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40" />
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg font-bold text-foreground">Ingredients</h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowScanner(true)} className="flex items-center gap-1.5 border border-accent text-accent text-sm font-body font-semibold px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors">
              <Camera className="w-4 h-4" /> Scan Photo
            </button>
            <button type="button" onClick={() => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...emptyIngredient }] }))} className="flex items-center gap-1.5 bg-accent text-accent-foreground text-sm font-body font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-2 mb-1">
          {["Ingredient", "Amount", "Category", "Tip", ""].map((h, i) => (
            <span key={i} className={"text-[10px] uppercase tracking-wider text-muted-foreground font-body " + (i===0?"col-span-4":i===1?"col-span-2":i===2?"col-span-3":i===3?"col-span-2":"col-span-1")}>{h}</span>
          ))}
        </div>
        <div className="space-y-3">
          {form.ingredients.map((ing, i) => (
            <IngredientFormRow key={i} ingredient={ing} index={i} onChange={updateIngredient} onRemove={() => removeIngredient(i)} canRemove={form.ingredients.length > 1} />
          ))}
        </div>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-foreground">Directions</h3>
          <button type="button" onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, ""] }))} className="flex items-center gap-1.5 bg-accent text-accent-foreground text-sm font-body font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>
        <div className="space-y-3">
          {form.steps.map((step, i) => (
            <StepFormRow key={i} step={step} index={i} onChange={updateStep} onRemove={() => removeStep(i)} canRemove={form.steps.length > 1} />
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full bg-primary text-primary-foreground font-body font-bold text-base py-4 rounded-2xl hover:bg-accent transition-colors tracking-wide disabled:opacity-60 flex items-center justify-center gap-2">
        {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
        Publish Recipe
      </button>
      {showScanner && (<IngredientScanner onIngredientsDetected={handleScannedIngredients} onClose={() => setShowScanner(false)} />)}
    </motion.main>
  );
}