import { useRef, useState } from "react";
// tmImage loaded via CDN in index.html
import { Camera, X, Search, Sparkles } from "lucide-react";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/_h7uegWmm/";


const RECIPES = {
  feijoada: {
    title: "Feijoada Brasileira",
    subtitle: "Traditional Brazilian black bean stew",
    time: "3h",
    servings: "6",
    difficulty: "Medium",
    tags: "Brazilian, Traditional, Stew",
    ingredients: [
      { name: "black beans", amount: "500g", category: "Legume", tip: "Soak overnight" },
      { name: "pork ribs", amount: "300g", category: "Meat", tip: "Cut into pieces" },
      { name: "sausage", amount: "200g", category: "Meat", tip: "Slice diagonally" },
      { name: "bacon", amount: "150g", category: "Meat", tip: "Cut into cubes" },
      { name: "garlic", amount: "4 cloves", category: "Vegetable", tip: "Minced" },
      { name: "onion", amount: "2 units", category: "Vegetable", tip: "Chopped" },
      { name: "bay leaves", amount: "3 units", category: "Spice", tip: "Remove before serving" },
      { name: "salt", amount: "to taste", category: "Spice", tip: "" },
      { name: "orange", amount: "2 units", category: "Fruit", tip: "Sliced for serving" },
    ],
    steps: [
      "Soak black beans in cold water overnight (at least 8 hours).",
      "Drain the beans and place in a pressure cooker with fresh water.",
      "Cook under pressure for 25 minutes, then set aside.",
      "In a large pot, fry the bacon until golden and crispy.",
      "Add sausage slices and pork ribs, cook until browned on all sides.",
      "Add garlic and onion, saute until soft and fragrant.",
      "Add the cooked beans with their liquid to the pot.",
      "Add bay leaves, season with salt and simmer for 30 minutes.",
      "Adjust seasoning and serve hot with rice, farofa and orange slices.",
    ]
  },
  pasta: {
    title: "Classic Italian Pasta",
    subtitle: "Authentic Italian pasta with tomato sauce",
    time: "45min",
    servings: "4",
    difficulty: "Easy",
    tags: "Italian, Pasta, Classic",
    ingredients: [
      { name: "pasta", amount: "400g", category: "Grain", tip: "Spaghetti or penne" },
      { name: "tomato sauce", amount: "500ml", category: "Sauce", tip: "Use San Marzano tomatoes" },
      { name: "garlic", amount: "3 cloves", category: "Vegetable", tip: "Thinly sliced" },
      { name: "olive oil", amount: "3 tbsp", category: "Oil", tip: "Extra virgin" },
      { name: "basil", amount: "handful", category: "Herb", tip: "Fresh leaves" },
      { name: "parmesan", amount: "100g", category: "Dairy", tip: "Freshly grated" },
      { name: "salt", amount: "to taste", category: "Spice", tip: "" },
    ],
    steps: [
      "Bring a large pot of salted water to boil.",
      "Cook pasta according to package instructions until al dente.",
      "Heat olive oil in a pan over medium heat.",
      "Add garlic and saute until golden, about 2 minutes.",
      "Add tomato sauce and simmer for 15 minutes.",
      "Drain pasta, reserving 1 cup of pasta water.",
      "Add pasta to the sauce and toss, adding pasta water as needed.",
      "Serve topped with fresh basil and parmesan cheese.",
    ]
  },
  salad: {
    title: "Fresh Garden Salad",
    subtitle: "Light and healthy green salad",
    time: "15min",
    servings: "2",
    difficulty: "Easy",
    tags: "Healthy, Vegetarian, Fresh",
    ingredients: [
      { name: "lettuce", amount: "1 head", category: "Vegetable", tip: "Tear into pieces" },
      { name: "tomato", amount: "2 units", category: "Vegetable", tip: "Cut into wedges" },
      { name: "cucumber", amount: "1 unit", category: "Vegetable", tip: "Sliced" },
      { name: "red onion", amount: "half", category: "Vegetable", tip: "Thinly sliced" },
      { name: "olive oil", amount: "2 tbsp", category: "Oil", tip: "Extra virgin" },
      { name: "lemon juice", amount: "1 tbsp", category: "Fruit", tip: "Freshly squeezed" },
      { name: "salt", amount: "to taste", category: "Spice", tip: "" },
    ],
    steps: [
      "Wash and dry all vegetables thoroughly.",
      "Tear lettuce into bite-sized pieces and place in a bowl.",
      "Add tomato wedges, cucumber slices and red onion.",
      "In a small bowl, whisk together olive oil and lemon juice.",
      "Season dressing with salt and pepper.",
      "Pour dressing over salad just before serving.",
      "Toss gently and serve immediately.",
    ]
  },
  grilled_chicken: {
    title: "Grilled Chicken",
    subtitle: "Juicy and flavorful grilled chicken",
    time: "1h",
    servings: "4",
    difficulty: "Medium",
    tags: "Grilling, Protein, Healthy",
    ingredients: [
      { name: "chicken breast", amount: "4 pieces", category: "Meat", tip: "Pound to even thickness" },
      { name: "olive oil", amount: "3 tbsp", category: "Oil", tip: "" },
      { name: "garlic", amount: "4 cloves", category: "Vegetable", tip: "Minced" },
      { name: "lemon", amount: "1 unit", category: "Fruit", tip: "Juice and zest" },
      { name: "paprika", amount: "1 tsp", category: "Spice", tip: "Smoked paprika preferred" },
      { name: "oregano", amount: "1 tsp", category: "Herb", tip: "Dried" },
      { name: "salt", amount: "to taste", category: "Spice", tip: "" },
    ],
    steps: [
      "Mix olive oil, garlic, lemon juice, paprika and oregano in a bowl.",
      "Season chicken with salt and coat with the marinade.",
      "Let marinate for at least 30 minutes in the fridge.",
      "Preheat grill to medium-high heat.",
      "Grill chicken for 6-7 minutes on each side.",
      "Check internal temperature reaches 165F (74C).",
      "Rest for 5 minutes before serving.",
    ]
  }
};

export default function IngredientScanner({ onIngredientsDetected, onClose }) {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);

  const analyzeImage = async (imgElement) => {
    setLoading(true); setError(null);
    try {
      let m = model;
      if (!m) { m = await window.tmImage.load(MODEL_URL+"model.json", MODEL_URL+"metadata.json"); setModel(m); }
      const results = await m.predict(imgElement);
      const detected = results.filter(p=>p.probability>0.5).map(p=>({name:p.className,confidence:Math.round(p.probability*100)})).sort((a,b)=>b.confidence-a.confidence);
      setPredictions(detected);
      if (onIngredientsDetected && detected.length>0) {
        const topDish = detected[0].name.toLowerCase().replace(' ', '_');
        const recipe = RECIPES[topDish] || null;
        onIngredientsDetected(detected.map(d=>d.name), recipe, preview);
      }
    } catch { setError("Failed to analyze image."); } finally { setLoading(false); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPredictions([]); setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => { setPreview(ev.target.result); setTimeout(()=>{ if(imageRef.current) analyzeImage(imageRef.current); },600); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md border border-border">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> Scan Ingredients
          </h2>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
        <div className="p-4 space-y-4">
          <label className="cursor-pointer flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground py-3 px-4 rounded-xl font-body font-semibold text-sm hover:bg-accent/90 transition-colors">
            <Camera className="w-4 h-4" /> Take Photo or Upload Image
            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
          </label>
          {preview && (
            <div className="relative rounded-xl overflow-hidden">
              <img ref={imageRef} src={preview} alt="preview" crossOrigin="anonymous" className="w-full object-cover max-h-56" />
              {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Search className="w-7 h-7 text-white animate-pulse" /></div>}
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center p-3 rounded-lg">{error}</p>}
          {predictions.length>0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body mb-2">Detected Ingredients</p>
              <ul className="space-y-2">
                {predictions.map(p=>(<li key={p.name} className="flex justify-between items-center bg-accent/10 px-4 py-2.5 rounded-lg"><span className="capitalize font-body font-medium text-sm">{p.name}</span><span className="text-xs font-bold text-accent">{p.confidence}%</span></li>))}
              </ul>
              <button onClick={onClose} className="mt-4 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-body font-semibold text-sm hover:bg-accent">Use These Ingredients</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
