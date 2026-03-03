import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LIMITS } from '../lib/constants';

interface Props {
  count: number;
  onChange: (count: number) => void;
}

export default function SymmetryControl({ count, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
      <button
        onClick={() => onChange(Math.max(LIMITS.minAxes, count - LIMITS.axesStep))}
        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
        aria-label="Decrease symmetry axes"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center justify-center min-w-[2rem]">
        <span className="text-sm font-bold text-white">{count}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Axes</span>
      </div>
      <button
        onClick={() => onChange(Math.min(LIMITS.maxAxes, count + LIMITS.axesStep))}
        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
        aria-label="Increase symmetry axes"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}