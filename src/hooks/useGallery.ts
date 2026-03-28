import { useState, useCallback, useEffect } from "react";
import type  { CanvasHandle } from "../components/Canvas";
import { get, set as setIdb, update } from "idb-keyval";

export interface GalleryItem {
    id: string;
    dataUrl: string;
    timestamp: number;
    symmetryCount: number;
    name: string;
}

const STORE_KEY = 'neonmandala-gallery';

export function useGallery(
    canvasHandle: React.RefObject<CanvasHandle | null>,
    symmetryCount: number,
    setToastMsg: (msg: string) => void
) {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);

    useEffect(() => {
        get<GalleryItem[]>(STORE_KEY).then((data) => {
            if (data) setGallery(data);
        }).catch((err) => {
            console.error("Failed to load DB", err);
        });
    }, []);

    const saveToGallery = useCallback(() => {
        const canvas = canvasHandle.current?.getCanvas();

        if (!canvas) return;

        const thumb = document.createElement('canvas');
        thumb.width = 200;
        thumb.height = 200;

        const tCtx = thumb.getContext('2d');
        if (!tCtx) return;
        tCtx.drawImage(canvas, 0, 0, 200, 200);

        const item: GalleryItem = {
            id: `art_${Date.now()}`,
            dataUrl: thumb.toDataURL('image/jpeg', 0.7),
            timestamp: Date.now(),
            symmetryCount,
            name: `Mandala #${gallery.length + 1}`,
        };

        const updated = [item, ...gallery].slice(0, 20);
        setGallery(updated);

        setIdb(STORE_KEY, updated).catch((err) => {
          console.error("Failed to save to DB", err);  
        });
        setToastMsg('Saved to Gallery! 📸');
    }, [gallery, symmetryCount, canvasHandle, setToastMsg]);

    const deleteFromGallery = useCallback((id: string) => {
        const updated = gallery.filter((item) => item.id !== id);
        setGallery(updated);

        setIdb(STORE_KEY, updated).catch(() => {});
    }, [gallery]);

    return { gallery, saveToGallery, deleteFromGallery };
}