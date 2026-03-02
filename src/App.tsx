import React, { useState, useRef, useCallback } from "react";
import { COLORS, BG_COLOR, DEFAULTS } from "./lib/constants";
import Canvas, { type CanvasHandle } from "./components/Canvas";
import {
  Download,
  Undo,
  Trash2,
  Palette,
  ChevronLeft,
  ChevronRight,
  Zap,
  FlipHorizontal,
  Grid3X3,
} from "lucide-react";

function App() {
  const canvasHandle = useRef<CanvasHandle>(null);
  const [symmetryCount, setSymmetryCount] = useState<number>(DEFAULTS.symmetryCount);
  const [brushColor, setBrushColor] = useState<string>(DEFAULTS.brushColor);
  const [brushSize, setBrushSize] = useState<number>(DEFAULTS.brushSize);
  const [glow, setGlow] = useState<boolean>(DEFAULTS.glow);
  const [mirror, setMirror] = useState<boolean>(DEFAULTS.mirror);
  const [showGuides, setShowGuides] = useState<boolean>(DEFAULTS.showGuides);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const saveState = useCallback(() => {
    const dataUrl = canvasHandle.current?.toDataURL();
    if (dataUrl) {
      setUndoStack((prev) => [...prev, dataUrl]);
    }
  }, []);

  const renderGuides = () => {
    if (!showGuides) return null;
    const lines = [];
    const totalLines = symmetryCount * (mirror ? 2 : 1);
    const angleStep = 360 / totalLines;

    for (let i = 0; i < totalLines; i++) {
        lines.push(
            <div
                key={i}
                className="absolute top-1/2 left-1/2 w-[1px] h-[100vmax] bg-white/[0.04] origin-top pointer-events-none"
                style={{ transform: `translate(-50%, 0) rotate(${i * angleStep}deg)` }}
            />
        );
    }
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {lines}
        </div>
    );
  };

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = lastState;
  }, [undoStack]);

  const clearCanvas = useCallback(() => {
    saveState();
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [saveState]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo]);

  const [_toastMsg, setToastMsg] = useState("");
  const handleExport = useCallback(() => {
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `drawglow_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setToastMsg("Image exported!");
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-white select-none relative">
      <Canvas
        ref={canvasHandle}
        brushColor={brushColor}
        brushSize={brushSize}
        glow={glow}
        mirror={mirror}
        symmetryCount={symmetryCount}
        onStrokeStart={saveState}
      />
      {renderGuides()}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            DrawGlow
          </h1>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-zinc-900/80 backdrop-blur-md transition-all border border-zinc-800"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 backdrop-blur-md transition-all border border-zinc-800"
            onClick={clearCanvas}
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 - translate-x-1/2 z-10 pointer-events-auto">
        <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-3 rounded-2xl shadow-2xl max-w-900[vw] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  brushColor === color
                    ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                    : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    brushColor === color && glow ? `0 0 10px ${color}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pr-4 border-r border-zinc-800">
          <Palette className="w-4 h-4 text-zinc-400" />
          <input
            type="range"
            min="1"
            max="15"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 pr-4 border-r border-zinc-">
          <button
            onClick={() => setSymmetryCount(Math.max(2, symmetryCount - 2))}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center justify-center min-w-[2rem]">
            <span className="text-sm font-bold text-white">
              {symmetryCount}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Axes
            </span>
          </div>
          <button
            onClick={() => setSymmetryCount(Math.min(32, symmetryCount + 2))}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGlow(!glow)}
            className={`p-2.5 rounded-xl transition-all ${
              glow
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Toggle Neon Glow"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMirror(!mirror)}
            className={`p-2.5 rounded-xl transition-all ${
              mirror
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Toggle Mirror Reflection"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`p-2.5 rounded-xl transition-all ${
              showGuides
                ? "bg-white/20 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Toggle Guides"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`,
        }}
      />
    </div>
  );
}

export default App;
