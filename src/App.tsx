import React, { useState, useRef, useCallback } from 'react'
import { COLORS, BG_COLOR, DEFAULTS } from './lib/constants'

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [symmetryCount, setSymmetryCount] = useState(DEFAULTS.symmetryCount)
    const [brushColor, setBrushColor] = useState(DEFAULTS.brushColor)
    const [brushSize, setBrushSize] = useState(DEFAULTS.brushSize);
    const [glow, setGlow] = useState(DEFAULTS.glow)
    const [mirror, setMirror] = useState(DEFAULTS.mirror)
    const [showGuides, setShowGuides] = useState(DEFAULTS.showGuides)
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [])

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        initCanvas();
    }, [initCanvas]);

    const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY: e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        lastPos.current = getCoordinates(e);
    }, [getCoordinates]);

    const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = false;
    }, [])

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing.current) return;
        const currentPos = getCoordinates(e);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushColor;
        ctx.shadowBlur = 0;

        if (glow) {
            ctx.shadowBlur = brushSize * 3;
            ctx.shadowColor = brushColor;
        } else {
            ctx.shadowBlur = 0;
        }

        const angleStep = (2 * Math.PI) / symmetryCount;
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < symmetryCount; i++) {
            ctx.rotate(angleStep);
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x - cx, lastPos.current.y - cy);
            ctx.lineTo(currentPos.x - cx, currentPos.y - cy);
            ctx.stroke();

            if (mirror) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.beginPath();
                ctx.moveTo(lastPos.current.x - cx, lastPos.current.y - cy);
                ctx.lineTo(currentPos.x - cx, currentPos.y - cy);
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
        lastPos.current = currentPos;
    }, [brushSize, brushColor, getCoordinates])

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setUndoStack(prev => [...prev, canvas.toDataURL()]);
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        saveState();
        isDrawing.current = true;
        lastPos.current = getCoordinates(e);
    }, [getCoordinates, saveState]);

    const undo = useCallback(() => {
        if (undoStack.length === 0) return;

        const lastState = undoStack[undoStack.length - 1];
        setUndoStack(prev => prev.slice(0, -1));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = lastState;
    }, [undoStack]);
    
    return (
        <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-white select-none relative">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                onMouseMove={draw}
                onTouchMove={draw}
            />
        </div>
    );
}

export default App;
