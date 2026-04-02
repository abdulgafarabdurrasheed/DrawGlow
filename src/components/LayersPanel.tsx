import type { Layer } from '../App';
import { useState } from 'react';

interface Props {
  layers: Layer[];
  activeLayerId: string;
  setLayers: (l: Layer[]) => void;
  setActiveLayerId: (id: string) => void;
}

export default function LayersPanel({ layers, activeLayerId, setLayers, setActiveLayerId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const addLayer = () => {
    const newLayer = { id: `layer-${Date.now()}`, name: `Layer ${layers.length + 1}`, visible: true };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
  };

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

    return (
    <div className="absolute top-20 right-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl shadow-black/50 w-48 z-10 pointer-events-auto transition-all">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-700">
        <h3 
          className="text-white text-xs font-bold tracking-widest text-zinc-400 cursor-pointer flex-1 flex items-center gap-2 hover:text-white transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          LAYERS {isExpanded ? '▼' : '▶'}
        </h3>
        <button onClick={addLayer} className="text-zinc-400 hover:text-white text-lg font-bold transition-colors">+</button>
      </div>
      
      {isExpanded && (
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto scrollbar-hide">
          {layers.map((layer) => (
            <div
              key={layer.id} 
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${activeLayerId === layer.id ? 'bg-zinc-800 border-l-2 border-cyan-500' : 'hover:bg-zinc-900 border-l-2 border-transparent'}`}
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
      )}
    </div>
  );
}  
