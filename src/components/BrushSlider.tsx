import { Palette } from 'lucide-react';
import { LIMITS } from '../lib/constants';

interface Props {
  value: number;
  onChange: (size: number) => void;
}

export default function BrushSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 pr-4 border-r border-zinc-800">
      <Palette className="w-4 h-4 text-zinc-400" />
      <input
        type="range"
        min={LIMITS.minBrush}
        max={LIMITS.maxBrush}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-24 accent-cyan-400"
        aria-label="Brush size"
      />
    </div>
  );
}
