import React, { useState, useRef, useCallback } from "react";
import { COLORS, BG_COLOR, DEFAULTS } from "./lib/constants";
import { Download, Undo, Trash2 } from "lucide-react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [symmetryCount, setSymmetryCount] = useState(DEFAULTS.symmetryCount);
  const [brushColor, setBrushColor] = useState(DEFAULTS.brushColor);
  const [brushSize, setBrushSize] = useState(DEFAULTS.brushSize);
  const [glow, setGlow] = useState(DEFAULTS.glow);
  const [mirror, setMirror] = useState(DEFAULTS.mirror);
  const [showGuides, setShowGuides] = useState(DEFAULTS.showGuides);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initCanvas();
  }, [initCanvas]);

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = false;
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const currentPos = getCoordinates(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = brushColor;
      ctx.shadowBlur = 0;

      if (glow) {
        ctx.shadowBlur = brushSize * 3;
        ctx.shadowColor = brushColor;
      } else {
        ctx.shadowBlur = 0;
      }

      const angleStep = (2 * Math.PI) / symmetryCount;
      ctx.save();
      ctx.translate(cx, cy);

      for (let i = 0; i < symmetryCount; i++) {
        ctx.rotate(angleStep);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x - cx, lastPos.current.y - cy);
        ctx.lineTo(currentPos.x - cx, currentPos.y - cy);
        ctx.stroke();

        if (mirror) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.beginPath();
          ctx.moveTo(lastPos.current.x - cx, lastPos.current.y - cy);
          ctx.lineTo(currentPos.x - cx, currentPos.y - cy);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
      lastPos.current = currentPos;
    },
    [brushSize, brushColor, getCoordinates],
  );

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUndoStack((prev) => [...prev, canvas.toDataURL()]);
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      saveState();
      isDrawing.current = true;
      lastPos.current = getCoordinates(e);
    },
    [getCoordinates, saveState],
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    const canvas = canvasRef.current;
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
    initCanvas();
  }, [saveState, initCanvas]);

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

  React.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [toastMsg, setToastMsg] = useState("");
  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        style={{ touchAction: "none" }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        onMouseMove={draw}
        onTouchMove={draw}
      />
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
                            ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' 
                            : 'hover:scale-110'
                        }`}
                        style={{ 
                        backgroundColor: color,
                        boxShadow: brushColor === color && glow 
                            ? `0 0 10px ${color}` 
                            : 'none'
                        }}
                    />
                ))}
            </div>
        </div>

        
      </div>

      <style dangerouslySetInnerHTML={{__html: `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}

export default App;
