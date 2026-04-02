import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BG_COLOR } from '../lib/constants';

export interface Point { x: number; y: number }

export interface Stroke {
    points: Point[];
    brushColor: string;
    brushSize: number;
    brushOpacity: number;
    glow: boolean;
    mirror: boolean;
    symmetryCount: number;
    brushType: string;
    layerId: string;
}

export interface CanvasHandle {
    getCanvas: () => HTMLCanvasElement | null;
    getContext: () => CanvasRenderingContext2D | null;
    toDataURL: () => string;
    redrawStrokes: (strokes: Stroke[]) => void;
}

interface Props {
    strokes: Stroke[];
    brushColor: string;
    brushSize: number;
    brushOpacity: number;
    glow: boolean;
    mirror: boolean;
    symmetryCount: number;
    brushType: string;
    activeLayerId: string;
    onStrokeEnd: (stroke: Stroke) => void;
}

const Canvas = forwardRef<CanvasHandle, Props>(({ strokes, brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, brushType, activeLayerId, onStrokeEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<Point>({ x: 0, y: 0 });
    const currentStroke = useRef<Stroke | null>(null);
    
    const viewport = useRef({ x: 0, y: 0, scale: 1 });

    const drawStrokeSegment = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke, lastP: Point, currP: Point, cx: number, cy: number) => {
        const angleStep = (2 * Math.PI) / stroke.symmetryCount;
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < stroke.symmetryCount; i++) {
            ctx.rotate(angleStep);

            const drawPath = (from: Point, to: Point) => {
                if (stroke.brushType === 'solid') {
                    ctx.lineWidth = stroke.brushSize;
                    ctx.beginPath();
                    ctx.moveTo(from.x - cx, from.y - cy);
                    ctx.lineTo(to.x - cx, to.y - cy);
                    ctx.stroke();
                } else if (stroke.brushType === 'particles') {
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const steps = Math.max(1, Math.floor(dist / (stroke.brushSize * 0.5)));
                    
                    for (let s=0; s<steps; s++) {
                        const px = from.x + (dx * s / steps) - cx;
                        const py = from.y + (dy * s / steps) - cy;
                        const sx = (Math.random() - 0.5) * stroke.brushSize * 5;
                        const sy = (Math.random() - 0.5) * stroke.brushSize * 5;

                        ctx.beginPath();
                        ctx.arc(px + sx, py + sy, stroke.brushSize * (Math.random() * 0.5 + 0.2), 0, Math.PI * 2)
                        ctx.fill();
                    }
                }
                else if (stroke.brushType === 'pulse') {
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    const pulseThickness = stroke.brushSize + Math.min(dist * 0.8, stroke.brushSize * 4)
                    ctx.lineWidth = pulseThickness;
                    ctx.beginPath();
                    ctx.moveTo(from.x - cx, from.y - cy);
                    ctx.lineTo(to.x - cx, to.y - cy);
                    ctx.stroke();
                }
            };
            drawPath(lastP, currP);

            if (stroke.mirror) {
                ctx.save();
                ctx.scale(-1, 1);
                drawPath(lastP, currP);
                ctx.restore();
            }
        }
        ctx.restore();
    }, []);

    const performRedraw = useCallback((localStrokes: Stroke[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(viewport.current.x, viewport.current.y);
        ctx.scale(viewport.current.scale, viewport.current.scale);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        localStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            ctx.globalAlpha = stroke.brushOpacity;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = stroke.brushSize;
            ctx.strokeStyle = stroke.brushColor;
            ctx.fillStyle = stroke.brushColor;
            ctx.shadowBlur = stroke.glow ? stroke.brushSize * 3 : 0;
            ctx.shadowColor = stroke.glow ? stroke.brushColor : 'transparent';

            for (let p = 1; p < stroke.points.length; p++) {
                drawStrokeSegment(ctx, stroke, stroke.points[p - 1], stroke.points[p], cx, cy);
            }
        });
        
        if (currentStroke.current && currentStroke.current.points.length > 0) {
            const tempStroke = currentStroke.current;
            ctx.globalAlpha = tempStroke.brushOpacity;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = tempStroke.brushSize;
            ctx.strokeStyle = tempStroke.brushColor;
            ctx.shadowBlur = tempStroke.glow ? tempStroke.brushSize * 3 : 0;
            ctx.shadowColor = tempStroke.glow ? tempStroke.brushColor : 'transparent';
            
            for (let p = 1; p < tempStroke.points.length; p++) {
                drawStrokeSegment(ctx, tempStroke, tempStroke.points[p - 1], tempStroke.points[p], cx, cy);
            }
        }
    }, [drawStrokeSegment]);

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        getContext: () => canvasRef.current?.getContext('2d') ?? null,
        toDataURL: () => canvasRef.current?.toDataURL() ?? '',
        redrawStrokes: performRedraw
    }));

    useEffect(() => {
        performRedraw(strokes);
    }, [strokes, performRedraw]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const isZoom = e.ctrlKey || e.metaKey;

            if (isZoom) {
                const zoomDelta = e.deltaY * -0.005;
                const oldScale = viewport.current.scale;
                let newScale = oldScale + zoomDelta;
                newScale = Math.max(0.1, Math.min(newScale, 15));

                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                viewport.current.x = mouseX - (mouseX - viewport.current.x) * (newScale / oldScale);
                viewport.current.y = mouseY - (mouseY - viewport.current.y) * (newScale / oldScale);
                viewport.current.scale = newScale;
            } else {
                viewport.current.x -= e.deltaX;
                viewport.current.y -= e.deltaY;
            }
            requestAnimationFrame(() => performRedraw(strokes));
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [performRedraw, strokes]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        performRedraw(strokes);
    }, [performRedraw, strokes]);

    const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const rawX = clientX - rect.left;
        const rawY = clientY - rect.top;
        
        return { 
            x: (rawX - viewport.current.x) / viewport.current.scale, 
            y: (rawY - viewport.current.y) / viewport.current.scale 
        };
    }, []);

    const stopDrawing = useCallback((e: any) => {
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

        ctx.save();
        ctx.translate(viewport.current.x, viewport.current.y);
        ctx.scale(viewport.current.scale, viewport.current.scale);

        ctx.globalAlpha = brushOpacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
        ctx.shadowBlur = glow ? brushSize * 3 : 0;
        ctx.shadowColor = glow ? brushColor : 'transparent';

        drawStrokeSegment(ctx, currentStroke.current, lastPos.current, currentPos, canvas.width / 2, canvas.height / 2);

        ctx.restore();

        currentStroke.current.points.push(currentPos);
        lastPos.current = currentPos;
    }, [brushSize, brushType, brushColor, brushOpacity, getCoordinates, glow, drawStrokeSegment, activeLayerId]);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        const startPos = getCoordinates(e);
        lastPos.current = startPos;
        
        currentStroke.current = {
            points: [startPos],
            brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, brushType, layerId:activeLayerId
        };
    }, [getCoordinates, brushType, brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, activeLayerId]);

    useEffect(() => {
        const handleGlobalUp = (e: MouseEvent | TouchEvent) => stopDrawing(e);

        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);

        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [stopDrawing]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchMove={draw}
        />
    );
});

Canvas.displayName = 'Canvas';
export default React.memo(Canvas);
