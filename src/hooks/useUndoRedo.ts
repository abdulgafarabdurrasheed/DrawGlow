import { useState, useCallback } from 'react';
import type { CanvasHandle, Stroke } from '../components/Canvas';
import { BG_COLOR } from '../lib/constants';

export function useUndoRedo(canvasHandle: React.RefObject<CanvasHandle | null>) {
    const [undoStack, setUndoStack] = useState<Stroke[]>([]);

    const addStroke = useCallback((stroke: Stroke) => {
         setUndoStack((prev) => [...prev, stroke]);
    }, []);

    const undo = useCallback(() => {
        if (undoStack.length === 0) return;

        const remainingStrokes = undoStack.slice(0, -1);
        setUndoStack(remainingStrokes);

        canvasHandle.current?.redrawStrokes(remainingStrokes);
    }, [undoStack, canvasHandle]);

    const clearCanvas = useCallback(() => {
        setUndoStack([]);
        const canvas = canvasHandle.current?.getCanvas();
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [canvasHandle]);

    return { undoStack, undo, clearCanvas, addStroke };
}
