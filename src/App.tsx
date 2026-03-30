import { useState, useRef, useCallback, useEffect } from "react";
import { DEFAULTS, type BrushType } from "./lib/constants";
import Canvas, { type CanvasHandle } from "./components/Canvas";
import TopBar from "./components/TopBar";
import ToolPalette from "./components/ToolPalette";
import Toast from "./components/Toast";
import GuidesOverlay from "./components/GuidesOverlay";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useGallery } from "./hooks/useGallery";
import { useShortcuts } from "./hooks/useShortcuts";
import LayersPanel from "./components/LayersPanel";
import { useMemo } from "react";

export interface Layer { id: string; name: string; visible: boolean; }


function App() {
  const canvasHandle = useRef<CanvasHandle>(null);
  const [symmetryCount, setSymmetryCount] = useState<number>(DEFAULTS.symmetryCount);
  const [brushColor, setBrushColor] = useState<string>(DEFAULTS.brushColor);
  const [brushSize, setBrushSize] = useState<number>(DEFAULTS.brushSize);
  const [glow, setGlow] = useState<boolean>(DEFAULTS.glow);
  const [mirror, setMirror] = useState<boolean>(DEFAULTS.mirror);
  const [showGuides, setShowGuides] = useState<boolean>(DEFAULTS.showGuides);
  const [showGallery, setShowGallery] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false)
  const [brushOpacity, setBrushOpacity] = useState<number>(DEFAULTS.brushOpacity || 1);
  const [brushType, setBrushType] = useState<BrushType>(DEFAULTS.brushType);
  const [layers, setLayers] = useState<Layer[]>([{ id: 'layer-1', name: 'Background', visible: true }]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const { undoStack, undo, clearCanvas, addStroke } = useUndoRedo(canvasHandle);
  const { gallery, saveToGallery, deleteFromGallery } = useGallery(canvasHandle, symmetryCount, setToastMsg)

  const visibleStrokes = useMemo(() => {
    const layerMap = new Map(layers.map((l, i) => [l.id, { index: i, visible: l.visible }]));
    
    const filtered = undoStack.filter(s => {
        const l = layerMap.get(s.layerId || 'layer-1');
        return l ? l.visible : true;
    });
    return [...filtered].sort((a, b) => {
        const idxA = layerMap.get(a.layerId || 'layer-1')?.index ?? 0;
        const idxB = layerMap.get(b.layerId || 'layer-1')?.index ?? 0;
        return idxB - idxA; 
    });
  }, [undoStack, layers]);


    const handleExport = useCallback(() => {
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        setToastMsg("Export failed!");
        return;
      }

      const fileName = `drawglow_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'My Masterpiece',
          files: [file]
        }).then(() => {
          //
        }).catch(() => {
          //
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      setToastMsg("Masterpiece Exported! 🎨");
    }, 'image/png');
  }, []);


  useShortcuts({
    undo,
    handleExport,
    setShowGuides,
    setMirror,
    setGlow,
    setSymmetryCount
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
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
  
  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-white select-none relative">
      <Canvas
        ref={canvasHandle}
        brushColor={brushColor}
        brushType={brushType}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        glow={glow}
        mirror={mirror}
        symmetryCount={symmetryCount}
        strokes={visibleStrokes}
        activeLayerId={activeLayerId}
        onStrokeEnd={addStroke}
      />
      <GuidesOverlay
        symmetryCount={symmetryCount}
        mirror={mirror}
        visible={showGuides}
      />
      <LayersPanel 
        layers={layers} 
        activeLayerId={activeLayerId} 
        setLayers={setLayers} 
        setActiveLayerId={setActiveLayerId} 
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
        brushType={brushType}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        symmetryCount={symmetryCount}
        glow={glow}
        mirror={mirror}
        showGuides={showGuides}
        setBrushColor={setBrushColor}
        setBrushType={setBrushType}
        setBrushSize={setBrushSize}
        setBrushOpacity={setBrushOpacity}
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
            left: cursorPosition.x,
            top: cursorPosition.y,
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