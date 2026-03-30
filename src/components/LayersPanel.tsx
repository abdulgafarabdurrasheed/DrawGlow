import type { Layer } from '../App';

interface Props {
  layers: Layer[];
  activeLayerId: string;
  setLayers: (l: Layer[]) => void;
  setActiveLayerId: (id: string) => void;
}

export default function LayersPanel({ layers, activeLayerId, setLayers, setActiveLayerId }: Props) {
  const addLayer = () => {
    const newLayer = { id: `layer-${Date.now()}`, name: `Layer ${layers.length + 1}`, visible: true };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
  };

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  return (
    <div className="absolute top-20 right-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-3 rounded-2xl shadow-2xl w-48 z-10 pointer-events-auto">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-700">
        <h3 className="text-white text-xs font-bold tracking-widest text-zinc-400">LAYERS</h3>
        <button onClick={addLayer} className="text-zinc-400 hover:text-white text-lg font-bold transition-colors">+</button>
      </div>
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto scrollbar-hide">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${activeLayerId === layer.id ? 'bg-zinc-700/80 ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'hover:bg-zinc-800'}`}
            onClick={() => setActiveLayerId(layer.id)}
          >
            <span className="text-sm text-zinc-300 truncate font-medium">{layer.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
              className={`text-xs p-1 rounded hover:bg-zinc-700/50 transition-colors ${layer.visible ? 'text-cyan-400' : 'text-zinc-500'}`}
              title="Toggle Visibility"
            >
              {layer.visible ? '👁️' : '⊘'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
