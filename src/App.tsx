import React, { useState, useRef, useCallback } from "react";
import { BG_COLOR, DEFAULTS, LIMITS } from "./lib/constants";
import Canvas, { type CanvasHandle } from "./components/Canvas";
import TopBar from "./components/TopBar";
import ToolPalette from "./components/ToolPalette";
import Toast from "./components/Toast";

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
      {renderGuides()}
      <TopBar
        undoDisabled={undoStack.length === 0}
        onUndo={undo}
        onClear={clearCanvas}
        onExport={handleExport}
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

      <style
        dangerouslySetInnerHTML={{
          __html: `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`,
        }}
      />
    </div>
  );
}

export default App;
