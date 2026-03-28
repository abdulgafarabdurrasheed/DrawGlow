import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BG_COLOR } from '../lib/constants';

export interface Point { x: number; y: number }

export interface Stroke {
    points: Point[];
    brushColor: string;
    brushSize: number;
    glow: boolean;
    mirror: boolean;
    symmetryCount: number;
    brushOpacity: number;
}

export interface CanvasHandle {
    getCanvas: () => HTMLCanvasElement | null;
    getContext: () => CanvasRenderingContext2D | null;
    toDataURL: () => string;
    redrawStrokes: (strokes: Stroke[]) => void;
}

interface Props {
    brushColor: string;
    brushSize: number;
    glow: boolean;
    mirror: boolean;
    symmetryCount: number;
    brushOpacity: number;
    onStrokeEnd: (stroke: Stroke) => void;
}

const Canvas = forwardRef<CanvasHandle, Props>(({ brushColor, brushSize, glow, mirror, symmetryCount, brushOpacity, onStrokeEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<Point>({ x: 0, y: 0 });
    const currentStroke = useRef<Stroke | null>(null);

    const drawStrokeSegment = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke, lastP: Point, currP: Point, cx: number, cy: number) => {
        const angleStep = (2 * Math.PI) / stroke.symmetryCount;
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < stroke.symmetryCount; i++) {
            ctx.rotate(angleStep);
            ctx.beginPath();
            ctx.moveTo(lastP.x - cx, lastP.y - cy);
            ctx.lineTo(currP.x - cx, currP.y - cy);
            ctx.stroke();

            if (stroke.mirror) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.beginPath();
                ctx.moveTo(lastP.x - cx, lastP.y - cy);
                ctx.lineTo(currP.x - cx, currP.y - cy);
                ctx.stroke();
                ctx.restore();
            }
        }
        ctx.restore();
    }, []);

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        getContext: () => canvasRef.current?.getContext('2d') ?? null,
        toDataURL: () => canvasRef.current?.toDataURL() ?? '',
        redrawStrokes: (strokes: Stroke[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            strokes.forEach(stroke => {
                if (stroke.points.length < 2) return;

                ctx.globalAlpha = stroke.brushOpacity;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = stroke.brushSize;
                ctx.strokeStyle = stroke.brushColor;
                ctx.shadowBlur = stroke.glow ? stroke.brushSize * 3 : 0;
                ctx.shadowColor = stroke.glow ? stroke.brushColor : 'transparent';

                for (let p = 1; p < stroke.points.length; p++) {
                    drawStrokeSegment(ctx, stroke, stroke.points[p - 1], stroke.points[p], cx, cy);
                }
            });
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (isDrawing.current && currentStroke.current && currentStroke.current.points.length > 1) {
            onStrokeEnd(currentStroke.current);
        }
        isDrawing.current = false;
        currentStroke.current = null;
    }, [onStrokeEnd]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing.current || !currentStroke.current) return;
        
        const currentPos = getCoordinates(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.globalAlpha = brushOpacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushColor;
        ctx.shadowBlur = glow ? brushSize * 3 : 0;
        ctx.shadowColor = glow ? brushColor : 'transparent';

        drawStrokeSegment(ctx, currentStroke.current, lastPos.current, currentPos, canvas.width / 2, canvas.height / 2);

        currentStroke.current.points.push(currentPos);
        lastPos.current = currentPos;
    }, [brushSize, brushColor, brushOpacity, getCoordinates, glow, drawStrokeSegment]);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        const startPos = getCoordinates(e);
        lastPos.current = startPos;
        
        currentStroke.current = {
            points: [startPos],
            brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount
        };
    }, [getCoordinates, brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
        />
    );
});

Canvas.displayName = 'Canvas';
export default React.memo(Canvas);
