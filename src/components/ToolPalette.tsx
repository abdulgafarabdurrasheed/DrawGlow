import { COLORS } from "../lib/constants";
import { useState } from "react";
import ColorPicker from "./ColorPicker";
import BrushSlider from "./BrushSlider";
import SymmetryControl from "./SymmetryControl";
import ToggleGroup from "./ToggleGroup";
import OpacitySlider from "./OpacitySlider";

interface Props {
  brushColor: string;
  brushSize: number;
  symmetryCount: number;
  glow: boolean;
  mirror: boolean;
  brushOpacity: number;
  brushType: string;
  showGuides: boolean;
  setBrushColor: (c: string) => void;
  setBrushSize: (s: number) => void;
  setBrushOpacity: (o: number) => void;
  setSymmetryCount: (n: number) => void;
  setGlow: (g: boolean) => void;
  setMirror: (m: boolean) => void;
  setShowGuides: (s: boolean) => void;
  setBrushType: (b: any) => void;
}

export default function ToolPalette(props: Props) {

  const [isExpanded, setIsExpanded] = useState(true); 
    if (!isExpanded) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <button 
          onClick={() => setIsExpanded(true)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white px-5 py-2.5 rounded-full font-medium shadow-xl shadow-black/50 transition-colors flex items-center gap-2"
        >
          Open Tools
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center gap-2">
      <button 
        onClick={() => setIsExpanded(false)}
        className="w-16 h-6 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors shadow-lg shadow-black/50"
      >
        ▼
      </button>
      <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl shadow-black/50 overflow-x-auto scrollbar-hide max-w-[90vw]">
        
        <ColorPicker
          colors={COLORS}
          activeColor={props.brushColor}
          glow={props.glow}
          onChange={props.setBrushColor}
        />
        <BrushSlider value={props.brushSize} onChange={props.setBrushSize} />
        <OpacitySlider value={props.brushOpacity} onChange={props.setBrushOpacity} />
        <select
          value={props.brushType}
          onChange={(e) => props.setBrushType(e.target.value)}
          className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-xl border border-zinc-700/50 outline-none cursor-pointer hover:bg-zinc-700 transition"
        >
          <option value="solid">Solid Brush</option>
          <option value="particles">Particles</option>
          <option value="pulse">Pulse Tube</option>
        </select>
        <SymmetryControl
          count={props.symmetryCount}
          onChange={props.setSymmetryCount}
        />
        <ToggleGroup
          glow={props.glow}
          mirror={props.mirror}
          showGuides={props.showGuides}
          onToggleGlow={() => props.setGlow(!props.glow)}
          onToggleMirror={() => props.setMirror(!props.mirror)}
          onToggleGuides={() => props.setShowGuides(!props.showGuides)}
        />
      </div>
    </div>
  );
}