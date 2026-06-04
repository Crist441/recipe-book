import { useRef, useState } from "react";
// tmImage loaded via CDN in index.html
import { Camera, X, Search, Sparkles } from "lucide-react";

const MODEL_URL = "/model/";

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
      if (onIngredientsDetected && detected.length>0) onIngredientsDetected(detected.map(d=>d.name));
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
