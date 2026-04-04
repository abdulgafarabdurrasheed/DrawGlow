import { useState, useCallback } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CanvasHandle } from '../components/Canvas';

interface Comment {
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface GlobalArtwork {
  id: string;
  dataUrl: string;
  createdAt: number;
  author: string;
  authorId: string;
  likes: string[];
  comments?: Comment[];
}

export function useGlobalGallery(
  canvasHandle: React.RefObject<CanvasHandle | null>,
  setToastMsg: (msg: string) => void,
  user: any
) {
  const [globalArtworks, setGlobalArtworks] = useState<GlobalArtwork[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGlobalGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const artworks: GlobalArtwork[] = [];
      querySnapshot.forEach((doc) => {
        artworks.push({ id: doc.id, ...doc.data() } as GlobalArtwork);
      });
      setGlobalArtworks(artworks);
    } catch {
      setToastMsg("Failed to load community gallery.");
    } finally {
      setIsLoading(false);
    }
  }, [setToastMsg]);

  const publishArtwork = useCallback(async () => {
    if (!user) { setToastMsg("Please login to publish!"); return; }
    const canvas = canvasHandle.current?.getCanvas();
    if (!canvas) return;
    
    const thumb = document.createElement('canvas');
    thumb.width = 600; thumb.height = 600;
    const tCtx = thumb.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(canvas, 0, 0, 600, 600);
    const dataUrl = thumb.toDataURL('image/jpeg', 0.85);

    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        dataUrl,
        createdAt: Date.now(),
        author: user.displayName || 'Anonymous Artist',
        authorId: user.uid,
        likes: [],
        comments: []
      });
      setToastMsg("Masterpiece Published to the World!");
      if (globalArtworks.length > 0) fetchGlobalGallery();
    } catch {
      setToastMsg("Failed to publish to the cloud.");
    } finally {
      setIsPublishing(false);
    }
  }, [canvasHandle, setToastMsg, user, globalArtworks.length, fetchGlobalGallery]);

  const toggleLike = useCallback(async (artworkId: string, currentLikes: string[] = []) => {
    if (!user) { setToastMsg("Please login to like artwork!"); return; }
    
    const hasLiked = currentLikes.includes(user.uid);
    const artRef = doc(db, 'gallery', artworkId);

    try {
        await updateDoc(artRef, {
            likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
        
        setGlobalArtworks(prev => prev.map(art => {
            if (art.id === artworkId) {
                const newLikes = hasLiked ? art.likes.filter((id: string) => id !== user.uid) : [...(art.likes || []), user.uid];
                return { ...art, likes: newLikes };
            }
            return art;
        }));
    } catch {
        setToastMsg("Failed to update like.");
    }
  }, [user, setToastMsg]);

  const deleteGlobalArtwork = useCallback(async (artworkId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'gallery', artworkId));
        setGlobalArtworks(prev => prev.filter(art => art.id !== artworkId));
        setToastMsg("Artwork deleted.");
    } catch {
        setToastMsg("Failed to delete.");
    }
  }, [user, setToastMsg]);

  const addComment = useCallback(async (artworkId: string, text: string) => {
    if (!user) {
      setToastMsg("Please login to comment"); return }

      if (!text.trim()) return;

      const newComment: Comment = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        text: text.trim(),
        createdAt: Date.now()
      };
      const artRef = doc(db, 'gallery', artworkId)

      try {
        await updateDoc(artRef, {
          comments: arrayUnion(newComment)
        });

        setGlobalArtworks(prev => prev.map(art => {
          if (art.id === artworkId) {
            return { ...art, comments: [...(art.comments || []), newComment] };
          }
          return art;
        }));
      } catch (e) {
        setToastMsg("Failed to post comment");
      }
  }, [user, setToastMsg]);

  return { 
    globalArtworks, publishArtwork, fetchGlobalGallery, isPublishing, isLoading,
    toggleLike, deleteGlobalArtwork, addComment
  };
}