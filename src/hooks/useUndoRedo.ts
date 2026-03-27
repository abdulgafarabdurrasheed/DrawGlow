import { useState, useCallback } from 'react';
import type { CanvasHandle } from '../components/Canvas';
import { BG_COLOR } from '../lib/constants';

export function useUndoRedo(canvasHandle: React.RefObject<CanvasHandle | null>) {
    const [undoStack, setUndoStack] = useState<string[]>([]);

    const saveState = useCallback(() => {
        const dataUrl = canvasHandle.current?.toDataURL();

        if (dataUrl) {
            setUndoStack((prev) => [...prev, dataUrl]);
        }
    }, [canvasHandle]);

    const undo = useCallback(() => {
        if (undoStack.length === 0) return;

        const lastState = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));

        const canvas = canvasHandle.current?.getCanvas();

        if (!canvas) return
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = lastState;
    }, [undoStack, canvasHandle]);

    const clearCanvas = useCallback(() => {
        saveState();
        const canvas = canvasHandle.current?.getCanvas();
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [saveState, canvasHandle]);

    return { undoStack, undo, clearCanvas, saveState }
}