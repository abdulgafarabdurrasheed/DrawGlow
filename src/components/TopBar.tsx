import { Download, Undo, Trash2, Sparkles } from "lucide-react";

interface Props {
  undoDisabled: boolean;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
}

export default function TopBar({
  undoDisabled,
  onUndo,
  onClear,
  onExport,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          DrawGlow
        </h1>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onUndo}
          disabled={undoDisabled}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-zinc-900/80 backdrop-blur-md transition-all border border-zinc-800"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={onClear}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 backdrop-blur-md transition-all border border-zinc-800"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>
      </div>
    </div>
  );
}
