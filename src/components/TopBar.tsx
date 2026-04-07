import { Download, Undo, Trash2, Save, Image, Play, PenTool, ImagePlus } from "lucide-react";

interface Props {
  undoDisabled: boolean;
  isPublishing: boolean;
  user?: any;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  onSave: () => void;
  onGallery: () => void;
  onPublishArtwork?: () => void;
  onOpenGlobalGallery?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  onTimeLapse?: () => void;
  onSvgExport?: () => void;
  onImageUpload?: (file: File) => void;
  showRefImage?: boolean;
  onToggleRefImage?: () => void;
}

export default function TopBar({
  undoDisabled,
  isPublishing,
  user,
  onUndo,
  onClear,
  onExport,
  onSave,
  onGallery,
  onPublishArtwork,
  onOpenGlobalGallery,
  onLogin,
  onLogout,
  onTimeLapse,
  onSvgExport,
  onImageUpload,
  showRefImage,
  onToggleRefImage,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent text-white">
          DrawGlow
        </h1>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onUndo}
          disabled={undoDisabled}
          className="p-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-zinc-900/80 transition-all border border-zinc-800"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={onClear}
          className="p-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-all border border-zinc-800"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={onSave}
          className="p-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-all border border-zinc-800"
          title="Save to Gallery"
        >
          <Save className="w-5 h-5" />
        </button>
        <button
          onClick={onGallery}
          className="p-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-all border border-zinc-800"
          title="Open Gallery"
        >
          <Image className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-zinc-700/50 mx-2"></div>
          <button
            onClick={onPublishArtwork}
            disabled={isPublishing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPublishing ? '...' : 'Done'} Publish
          </button>
          <button
            onClick={onOpenGlobalGallery}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            World Gallery
          </button>
          
        <input 
            type="file" 
            id="ref-upload" 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
            onChange={(e) => {
                if (e.target.files && e.target.files[0] && onImageUpload) {
                    onImageUpload(e.target.files[0]);
                }
                e.target.value = '';
            }} 
        />

        <label 
            htmlFor="ref-upload" 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shadow-lg shadow-black/20 cursor-pointer"
            title="Import Reference Image"
        >
            <ImagePlus className="w-5 h-5 pointer-events-none" />
        </label>

        {showRefImage !== undefined && onToggleRefImage && (
             <button
                 onClick={onToggleRefImage}
                 className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors shadow-lg shadow-black/20 ${showRefImage ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
                 title="Toggle Reference Image Visibility"
             >
                 {showRefImage ? '👁' : '⊘'}
             </button>
        )}


        <div className="h-6 w-px bg-zinc-700/50 mx-2"></div>
          {user ? (
            <button
              onClick={onLogout}
              className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden border border-zinc-700 hover:border-cyan-500 transition-colors !p-0"
              title={`Logout ${user.displayName}`}
              style={{ padding: 0 }}
            >
              <img src={user.photoURL || ''} alt="Profile" className="object-cover" style={{ width: '36px', height: '36px', maxWidth: 'none' }} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center gap-2 rounded-md transition-colors"
            >
              Login
            </button>
          )}

          <button
            onClick={onTimeLapse}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-2 border border-cyan-500 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Timelapse</span>
          </button>

        <button
          onClick={onSvgExport}
          className="px-4 py-2 rounded-md bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 font-medium flex items-center gap-2 border border-purple-500/50 transition-colors"
          title="Export Infinitely Scalable Vector"
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">Export SVG</span>
        </button>

        <button
          onClick={onExport}
          className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-2 border border-zinc-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>

      </div>
    </div>
  );
}