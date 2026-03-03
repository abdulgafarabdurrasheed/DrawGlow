import { Zap, FlipHorizontal, Grid3X3 } from 'lucide-react';

interface Props {
  glow: boolean;
  mirror: boolean;
  showGuides: boolean;
  onToggleGlow: () => void;
  onToggleMirror: () => void;
  onToggleGuides: () => void;
}

export default function ToggleGroup({
  glow, mirror, showGuides,
  onToggleGlow, onToggleMirror, onToggleGuides
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleGlow}
        className={`p-2.5 rounded-xl transition-all ${
          glow ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Toggle Neon Glow"
        aria-label={`Neon glow: ${glow ? 'on' : 'off'}`}
        aria-pressed={glow}
      >
        <Zap className="w-5 h-5" />
      </button>
      <button
        onClick={onToggleMirror}
        className={`p-2.5 rounded-xl transition-all ${
          mirror ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Toggle Mirror Reflection"
        aria-label={`Mirror mode: ${mirror ? 'on' : 'off'}`}
        aria-pressed={mirror}
      >
        <FlipHorizontal className="w-5 h-5" />
      </button>
      <button
        onClick={onToggleGuides}
        className={`p-2.5 rounded-xl transition-all ${
          showGuides ? 'bg-white/20 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Toggle Guide Lines"
        aria-label={`Guide lines: ${showGuides ? 'on' : 'off'}`}
        aria-pressed={showGuides}
      >
        <Grid3X3 className="w-5 h-5" />
      </button>
    </div>
  );
}