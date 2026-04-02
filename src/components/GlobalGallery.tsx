import type { GlobalArtwork } from "../hooks/useGlobalGallery";

interface Props {
  artworks: GlobalArtwork[];
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export default function GlobalGallery({ artworks, isLoading, onRefresh, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-full flex flex-col shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
              Global Gallery
            </h2>
            <p className="text-zinc-400 text-sm mt-1">Discover mandalas created by artists worldwide.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-black rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh Feed'}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-zinc-950/50">
          {isLoading && artworks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
               <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>Downloading global masterpieces...</p>
             </div>
          ) : artworks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
               <p>The gallery is empty! Be the first to publish.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {artworks.map((art) => (
                   <div key={art.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-cyan-500/50 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                     <img 
                       src={art.dataUrl} 
                       alt="Community Artwork" 
                       loading="lazy"
                       className="w-full aspect-square object-cover"
                     />
                     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                       <p className="text-white text-sm font-medium">{art.author}</p>
                       <p className="text-zinc-400 text-xs mt-1">
                         {new Date(art.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}