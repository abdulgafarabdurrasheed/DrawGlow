import { COLORS } from "../lib/constants";
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
  showGuides: boolean;
  setBrushColor: (c: string) => void;
  setBrushSize: (s: number) => void;
  setBrushOpacity: (o: number) => void;
  setSymmetryCount: (n: number) => void;
  setGlow: (g: boolean) => void;
  setMirror: (m: boolean) => void;
  setShowGuides: (s: boolean) => void;
}

export default function ToolPalette(props: Props) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-3 rounded-2xl shadow-2xl max-w-[90vw] overflow-x-auto scrollbar-hide">
        <ColorPicker
          colors={COLORS}
          activeColor={props.brushColor}
          glow={props.glow}
          onChange={props.setBrushColor}
        />
        <BrushSlider value={props.brushSize} onChange={props.setBrushSize} />
        <OpacitySlider value={props.brushOpacity} onChange={props.setBrushOpacity} />
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
