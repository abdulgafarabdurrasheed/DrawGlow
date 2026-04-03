import { Download, Undo, Trash2, Save, Image } from "lucide-react";

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

        <div className="h-6 w-px bg-zinc-700/50 mx-2"></div>
          {user ? (
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700 hover:border-cyan-500 transition-colors"
              title={`Logout ${user.displayName}`}
            >
              <img src={user.photoURL || ''} alt="Profile" className="w-full h-full object-cover" />
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
