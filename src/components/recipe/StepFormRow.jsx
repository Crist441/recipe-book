import { Trash2 } from "lucide-react";

export default function StepFormRow({ step, index, onChange, onRemove, canRemove }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center mt-2">
        {index + 1}
      </span>
      <textarea
        value={step}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Step ${index + 1} instructions…`}
        rows={2}
        className="flex-1 px-3 py-2 rounded-xl border border-border text-sm font-body bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-red-500 transition-colors mt-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
