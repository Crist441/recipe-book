import { useState } from "react";
import { ImagePlus, X } from "lucide-react";

export default function ImageUpload({ imageUrl, onImageUploaded, height = "h-48" }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageUploaded(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`relative w-full ${height} rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
        dragging ? "border-accent bg-accent/5" : "border-border bg-muted/40"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Recipe" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onImageUploaded("")}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer gap-2">
          <ImagePlus className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm font-body text-muted-foreground">
            Click or drag to upload photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}
