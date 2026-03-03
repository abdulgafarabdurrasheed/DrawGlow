import React, { useState, useRef, useCallback, useEffect } from "react";
import { BG_COLOR, DEFAULTS, LIMITS } from "./lib/constants";
import Canvas, { type CanvasHandle } from "./components/Canvas";
import TopBar from "./components/TopBar";
import ToolPalette from "./components/ToolPalette";
import Toast from "./components/Toast";
import GuidesOverlay from "./components/GuidesOverlay";

interface GalleryItem {
    id: string;
    dataUrl: string;
    timestamp: number;
    symmetryCount: number;
    name: string;
}

function App() {
  const canvasHandle = useRef<CanvasHandle>(null);
  const [symmetryCount, setSymmetryCount] = useState<number>(DEFAULTS.symmetryCount);
  const [brushColor, setBrushColor] = useState<string>(DEFAULTS.brushColor);
  const [brushSize, setBrushSize] = useState<number>(DEFAULTS.brushSize);
  const [glow, setGlow] = useState<boolean>(DEFAULTS.glow);
  const [mirror, setMirror] = useState<boolean>(DEFAULTS.mirror);
  const [showGuides, setShowGuides] = useState<boolean>(DEFAULTS.showGuides);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const saveState = useCallback(() => {
    const dataUrl = canvasHandle.current?.toDataURL();
    if (dataUrl) {
      setUndoStack((prev) => [...prev, dataUrl]);
    }
  }, []);

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

  const [toastMsg, setToastMsg] = useState("");
  const handleExport = useCallback(() => {
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `drawglow_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setToastMsg("Masterpiece Exported! \uD83C\uDFA8");
  }, []);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setShowCursor(true);
    };
    const handleMouseLeave = () => setShowCursor(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('neonmandala-gallery') || '[]');
    } catch {
      return [];
    }
  });

  const saveToGallery = useCallback(() => {
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;

    const thumb = document.createElement('canvas');
    thumb.width = 200;
    thumb.height = 200;
    const tCtx = thumb.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(canvas, 0, 0, 200, 200);

    const item: GalleryItem = {
      id: `art_${Date.now()}`,
      dataUrl: thumb.toDataURL('image/jpeg', 0.7),
      timestamp: Date.now(),
      symmetryCount,
      name: `Mandala #${gallery.length + 1}`,
    };

    const updated = [item, ...gallery].slice(0, 20);
    setGallery(updated);

    try {
      localStorage.setItem('neonmandala-gallery', JSON.stringify(updated));
    } catch {
      //
    }

    setToastMsg('Saved to Gallery! 📸');
  }, [gallery, symmetryCount]);

  const deleteFromGallery = useCallback((id: string) => {
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    try {
      localStorage.setItem('neonmandala-gallery', JSON.stringify(updated));
    } catch {
      // Storage error — silently fail
    }
  }, [gallery]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (ctrl && e.key === "s") {
        e.preventDefault();
        handleExport();
      }
      if (e.key === "g") {
        if (document.activeElement?.tagName !== 'INPUT') {
          setShowGuides(prev => !prev);
        }
      }
      if (e.key === 'm') {
        if (document.activeElement?.tagName !== 'INPUT') {
          setMirror(prev => !prev);
        }
      }
      if (e.key === 'n') {
        if (document.activeElement?.tagName !== 'INPUT') {
          setGlow(prev => !prev);
        }
      }
      if (e.key === '[') {
        setSymmetryCount(prev => Math.max(LIMITS.minAxes, prev - LIMITS.axesStep));
      }
      if (e.key === ']') {
        setSymmetryCount(prev => Math.min(LIMITS.maxAxes, prev + LIMITS.axesStep));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, handleExport]);

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
      <GuidesOverlay
        symmetryCount={symmetryCount}
        mirror={mirror}
        visible={showGuides}
      />
      <TopBar
        undoDisabled={undoStack.length === 0}
        onUndo={undo}
        onClear={clearCanvas}
        onExport={handleExport}
        onSave={saveToGallery}
        onGallery={() => setShowGallery(true)}
      />
      <ToolPalette
        brushColor={brushColor}
        brushSize={brushSize}
        symmetryCount={symmetryCount}
        glow={glow}
        mirror={mirror}
        showGuides={showGuides}
        setBrushColor={setBrushColor}
        setBrushSize={setBrushSize}
        setSymmetryCount={setSymmetryCount}
        setGlow={setGlow}
        setMirror={setMirror}
        setShowGuides={setShowGuides}
      />
      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />}

      {showCursor && (
        <div
          className="fixed pointer-events-none z-[999] rounded-full border border-white/30 mix-blend-screen animate-pulse"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            width: brushSize * 6 + (glow ? brushSize * 2 : 0),
            height: brushSize * 6 + (glow ? brushSize * 2 : 0),
            transform: 'translate(-50%, -50%)',
            backgroundColor: `${brushColor}33`,
            boxShadow: glow ? `0 0 ${brushSize * 3}px ${brushColor}40` : 'none',
            transition: 'width 0.15s, height 0.15s, box-shadow 0.15s',
          }} />
      )}

      {showGallery && (
        <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowGallery(false)}
      />
      <div className="w-80 bg-zinc-900 border-l border-zinc-800 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wider">Gallery</h2>
          <button
            onClick={() => setShowGallery(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {gallery.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            No saved artworks yet.<br />
            Draw something beautiful, then save it!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((item) => (
              <div key={item.id} className="group relative">
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full aspect-square rounded-lg border border-zinc-800 object-cover hover:border-cyan-500/50 transition-colors cursor-pointer"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                  <p className="text-xs text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-zinc-400">{item.symmetryCount} axes</p>
                </div>
                <button
                  onClick={() => deleteFromGallery(item.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`,
        }}
      />
    </div>
  );
}

export default App;
