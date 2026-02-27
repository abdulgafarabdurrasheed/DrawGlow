import { useRef } from "react";

const isDrawing = useRef(false);
const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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