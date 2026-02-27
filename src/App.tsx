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
            />
        </div>
    );
}

export default App;
