import type { GlobalArtwork } from "../hooks/useGlobalGallery";
import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";

interface Props {
  artworks: GlobalArtwork[];
  isLoading: boolean;
  currentUser: any;
  onRefresh: () => void;
  onClose: () => void;
  onLike: (id: string, currentLikes: string[]) => void
  onDelete: (id: string) => void
  onComment: (artworkId: string, text: string) => void
}

export default function GlobalGallery({ artworks, isLoading, currentUser, onRefresh, onClose, onLike, onDelete, onComment }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [focusedArt, setFocusedArt] = useState<GlobalArtwork | null>(null);
  const [commentText, setCommentText] = useState('');
  const displayedArtworks = activeTab === 'mine' && currentUser ? artworks.filter(art => art.authorId === currentUser.uid) : artworks;

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
              {currentUser && (
                <div className="flex bg-zinc-800 rounded-lg p-1 mr-2 border border-zinc-700">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex transition-all ${activeTab === 'all' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Everyone
                  </button>
                  <button 
                    onClick={() => setActiveTab('mine')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex transition-all ${activeTab === 'mine' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    My Artwork
                  </button>
                </div>
              )}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh Feed'}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-20">
                {displayedArtworks.map((art) => {
                   const hasLiked = currentUser && art.likes?.includes(currentUser.uid);
                   const isOwner = currentUser && art.authorId === currentUser.uid;

                   return (
                     <div key={art.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-cyan-500/50 transition-all hover:scale-[1.02]">
                      <img 
                         src={art.dataUrl} 
                         alt="Community Artwork" 
                         loading="lazy"
                         className="w-full aspect-square object-cover cursor-pointer"
                         onClick={() => setFocusedArt(art)}
                       />

                       <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex justify-between items-end">
                         
                         <div>
                           <p className="text-white text-sm font-bold tracking-wide">{art.author}</p>
                           <p className="text-zinc-400 text-xs mt-1">
                             {new Date(art.createdAt).toLocaleDateString()}
                           </p>
                         </div>

                         <div className="flex items-center gap-2">
                           {isOwner && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(art.id); }}
                               className="p-1.5 bg-black/50 text-zinc-400 hover:text-red-500 hover:bg-black rounded-lg transition-colors border border-transparent hover:border-red-500/50"
                               title="Delete your artwork"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                           <button 
                             onClick={(e) => { e.stopPropagation(); onLike(art.id, art.likes || []); }}
                             className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-black/50 border transition-colors ${hasLiked ? 'text-red-500 border-red-500/50' : 'text-zinc-400 border-transparent hover:bg-black'}`}
                           >
                             <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                             <span className="text-xs font-bold">{art.likes?.length || 0}</span>
                           </button>
                         </div>

                       </div>
                     </div>
                   );
                })}
             </div>

          )}

        {focusedArt && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">

              <div className="md:w-1/2 bg-black flex items-center justify-center p-4 min-h-[300px]">
                <img 
                  src={focusedArt.dataUrl} 
                  alt="Focused artwork" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>

              <div className="md:w-1/2 flex flex-col border-l border-zinc-800">
                
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-lg">{focusedArt.author}</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(focusedArt.createdAt).toLocaleDateString()} · {focusedArt.likes?.length || 0} likes
                    </p>
                  </div>
                  <button 
                    onClick={() => setFocusedArt(null)} 
                    className="text-zinc-400 hover:text-white text-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-[200px]">
                  {(!focusedArt.comments || focusedArt.comments.length === 0) ? (
                    <p className="text-zinc-600 text-sm text-center py-8">No comments yet. Be the first!</p>
                  ) : (
                    focusedArt.comments.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 border border-zinc-700">
                          {c.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-white text-sm font-semibold">{c.authorName}</span>
                            <span className="text-zinc-600 text-[10px]">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-zinc-300 text-sm mt-0.5 break-words">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          onComment(focusedArt.id, commentText);
                          setCommentText('');
                          setFocusedArt(prev => prev ? {
                            ...prev,
                            comments: [...(prev.comments || []), {
                              authorId: currentUser?.uid || '',
                              authorName: currentUser?.displayName || 'Anonymous',
                              text: commentText.trim(),
                              createdAt: Date.now()
                            }]
                          } : null);
                        }
                      }}
                      placeholder={currentUser ? "Write a comment..." : "Login to comment"}
                      disabled={!currentUser}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => {
                        if (commentText.trim()) {
                          onComment(focusedArt.id, commentText);
                          setCommentText('');
                          setFocusedArt(prev => prev ? {
                            ...prev,
                            comments: [...(prev.comments || []), {
                              authorId: currentUser?.uid || '',
                              authorName: currentUser?.displayName || 'Anonymous',
                              text: commentText.trim(),
                              createdAt: Date.now()
                            }]
                          } : null);
                        }
                      }}
                      disabled={!currentUser || !commentText.trim()}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-30 disabled:hover:bg-cyan-600"
                    >
                      Send
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}