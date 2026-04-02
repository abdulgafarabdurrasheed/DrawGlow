import React, { useState, useCallback } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CanvasHandle } from '../components/Canvas';

export interface GlobalArtwork {
    id: string;
    dataUrl: string;
    createdAt: number;
    author: string;
    likes: number;
}

export function useGlobalGallery(canvasHandle: React.RefObject<CanvasHandle | null>, setToastMsg: (msg: string) => void) {
    const [globalArtworks, setGlobalArtworks] = useState<GlobalArtwork[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

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
        } catch (error) {
            console.error("Error fetching global gallery:", error);
            setToastMsg("Failed to load gallery");
        } finally {
            setIsLoading(false);
        }
    }, [setToastMsg]);

  const publishArtwork = useCallback(async () => {
        const canvas = canvasHandle.current?.getCanvas();
        if (!canvas) return;

        const thumb = document.createElement('canvas')
        thumb.width = 600;
        thumb.height = 600;
        const tCtx = thumb.getContext('2d')

        if (!tCtx) return
        tCtx.drawImage(canvas, 0, 0, 600, 600);

        const dataUrl = thumb.toDataURL('image/jpeg', 0.85);
        setIsPublishing(true);
        try {
            await addDoc(collection(db, 'gallery'), {
                dataUrl,
                createdAt: Date.now(),
                author: 'Anonymous Artist',
                likes: 0,
            });
            setToastMsg("Materpiece Published")
        } catch (error) {
            console.error("Error publishing: ", error);
            setToastMsg("Failed to publish")
        } finally {
            setIsPublishing(false);
        }
  }, [canvasHandle, setToastMsg]);


  return {
    globalArtworks,
    publishArtwork,
    fetchGlobalGallery,
    isPublishing,
    isLoading
  };
}