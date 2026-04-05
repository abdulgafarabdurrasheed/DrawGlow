import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'Z'], action: 'Undo last stroke' },
  { keys: ['Ctrl', 'E'], action: 'Export as PNG' },
  { keys: ['G'], action: 'Toggle symmetry guides' },
  { keys: ['M'], action: 'Toggle mirror mode' },
  { keys: ['L'], action: 'Toggle glow effect' },
  { keys: ['+'], action: 'Add symmetry axis' },
  { keys: ['-'], action: 'Remove symmetry axis' },
  { keys: ['?'], action: 'Show this guide' },
];

const features = [
  { title: 'Brushes', desc: '4 brush types: Solid, Particles, Pulse, and Eraser' },
  { title: 'Symmetry', desc: 'Up to 32 radial axes with optional mirror mode' },
  { title: 'Infinite Canvas', desc: 'Scroll to pan, Ctrl+Scroll to zoom' },
  { title: 'Layers', desc: 'Non-destructive layers with visibility toggles' },
  { title: 'World Gallery', desc: 'Publish artwork, like, and comment on others' },
  { title: 'Timelapse', desc: 'Watch your creation rebuild itself at 60fps' },
  { title: 'Grid', desc: 'Toggle a precision background grid for alignment' },
];

export default function Guide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-white text-xl font-bold tracking-wide">DrawGlow Guide</h2>
            <p className="text-zinc-500 text-sm mt-1">Everything you need to know</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-zinc-400 text-xs font-bold tracking-widest mb-4">FEATURES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-zinc-400 text-xs font-bold tracking-widest mb-4">KEYBOARD SHORTCUTS</h3>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.action} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <span className="text-zinc-300 text-sm">{s.action}</span>
                  <div className="flex gap-1.5">
                    {s.keys.map((k) => (
                      <kbd key={k} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300 font-mono min-w-[28px] text-center">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
