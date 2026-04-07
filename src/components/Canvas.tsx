import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { BG_COLOR } from '../lib/constants';
import { playStrokeEnd, playStrokeStart } from '../lib/sounds';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
    playTimeLapse: () => void
    exportSVG: () => void;
    exportVideo: () => Promise<void>
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
    showGrid: boolean;
    referenceImage: string | null;
    showRefImage: boolean;
}

function catmullRomPoints(points: Point[], segments: number = 6): Point[] {
    if (points.length < 3) return points;
    const result: Point[] = [points[0]];
    
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[Math.min(i + 1, points.length - 1)];
        const p3 = points[Math.min(i + 2, points.length - 1)];
        
        for (let t = 1; t <= segments; t++) {
            const f = t / segments;
            const f2 = f * f;
            const f3 = f2 * f;
            
            const x = 0.5 * (
                (2 * p1.x) +
                (-p0.x + p2.x) * f +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3
            );
            const y = 0.5 * (
                (2 * p1.y) +
                (-p0.y + p2.y) * f +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3
            );
            result.push({ x, y });
        }
    }
    return result;
}


const Canvas = forwardRef<CanvasHandle, Props>(({ strokes, brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, brushType, activeLayerId, onStrokeEnd, showGrid, referenceImage, showRefImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<Point>({ x: 0, y: 0 });
    const currentStroke = useRef<Stroke | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    const viewport = useRef({ x: 0, y: 0, scale: 1 });
    const imgRef = useRef<HTMLImageElement | null>(null);

    const drawStrokeSegment = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke, lastP: Point, currP: Point, cx: number, cy: number) => {
        const angleStep = (2 * Math.PI) / stroke.symmetryCount;
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < stroke.symmetryCount; i++) {
            ctx.rotate(angleStep);

            const drawPath = (from: Point, to: Point) => {
                if (stroke.brushType === 'solid' || stroke.brushType === 'eraser') {
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
        ctx.globalCompositeOperation = 'source-over'; 
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
        
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        if (showGrid) {
            ctx.save();
            ctx.strokeStyle = '#27272a'
            ctx.lineWidth = 1;
            ctx.beginPath()

            let gridSize = 50 * viewport.current.scale;
            if (gridSize < 10) gridSize = 10;

            const offsetX = viewport.current.x % gridSize;
            const offsetY = viewport.current.y % gridSize;

            for (let x = offsetX; x < canvas.width; x += gridSize) {
               ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
            }
            for (let y = offsetY; y < canvas.height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();
            ctx.restore();
        }

        if (imgRef.current && showRefImage) {
            ctx.save();

            ctx.translate(viewport.current.x, viewport.current.y);
            ctx.scale(viewport.current.scale, viewport.current.scale);

                const cx  = canvas.width / 2;
                const cy = canvas.height / 2;

                const scaleX = (canvas.width * 0.8) / imgRef.current.width;
                const scaleY = (canvas.height * 0.8) / imgRef.current.height;
                const imgScale = Math.min(scaleX, scaleY, 1);

                const drawWidth = imgRef.current.width * imgScale;
                const drawHeight = imgRef.current.height * imgScale;

                const hw = drawWidth / 2;
                const hh = drawHeight / 2;

                ctx.globalAlpha = 0.25;

                ctx.drawImage(imgRef.current, cx - hw, cy - hh, drawWidth, drawHeight);
                ctx.restore();
        }

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
                if (stroke.brushType === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out'
                    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                    ctx.shadowBlur = 0
                } else {
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.strokeStyle = stroke.brushColor;
                    ctx.fillStyle = stroke.brushColor;
                    ctx.shadowBlur = stroke.glow ? stroke.brushSize * 3 : 0;
                    ctx.shadowColor = stroke.glow ? stroke.brushColor : 'transparent';
                }
            const smoothed = catmullRomPoints(stroke.points);
            for (let p = 1; p < smoothed.length; p++) {
                drawStrokeSegment(ctx, stroke, smoothed[p - 1], smoothed[p], cx, cy);
            }
        });
        
        if (currentStroke.current && currentStroke.current.points.length > 0) {
            const tempStroke = currentStroke.current;
            ctx.globalAlpha = tempStroke.brushOpacity;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = tempStroke.brushSize;
            if (tempStroke.brushType === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out'
                    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                    ctx.shadowBlur = 0
                } else {
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.strokeStyle = tempStroke.brushColor;
                    ctx.fillStyle = tempStroke.brushColor;
                    ctx.shadowBlur = tempStroke.glow ? tempStroke.brushSize * 3 : 0;
                    ctx.shadowColor = tempStroke.glow ? tempStroke.brushColor : 'transparent';
                }
            const smoothedTemp = catmullRomPoints(tempStroke.points);
            for (let p = 1; p < smoothedTemp.length; p++) {
                drawStrokeSegment(ctx, tempStroke, smoothedTemp[p - 1], smoothedTemp[p], cx, cy);
            }

        }
    }, [drawStrokeSegment, showGrid, showRefImage]);

    useEffect(() => {
        if (referenceImage) {
            const img = new Image();
            img.onload = () => {
                imgRef.current = img;
                performRedraw(strokes)
            };
            img.src = referenceImage;
        } else {
            imgRef.current = null;

            requestAnimationFrame(() => performRedraw(strokes));
        }
    }, [referenceImage, performRedraw, strokes])

    const playTimeLapse = useCallback(async () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.translate(viewport.current.x, viewport.current.y)
        ctx.scale(viewport.current.scale, viewport.current.scale);
        const cx = canvas.width / 2
        const cy = canvas.height / 2

        for (let i = 0; i < strokes.length; i++) {
            const stroke = strokes[i];
            if (stroke.points.length < 2) continue;

            ctx.globalAlpha = stroke.brushOpacity;
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = stroke.brushSize;

            if (stroke.brushType === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                ctx.shadowBlur = 0;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.brushColor;
                ctx.fillStyle = stroke.brushColor;
                ctx.shadowBlur = stroke.glow ? stroke.brushSize * 3 : 0;
                ctx.shadowColor = stroke.glow ? stroke.brushColor : 'transparent'
            }

            const smoothedTL = catmullRomPoints(stroke.points);
            for (let p = 1; p < smoothedTL.length; p++) {
                drawStrokeSegment(ctx, stroke, smoothedTL[p - 1], smoothedTL[p], cx, cy);
                if (p % 6 === 0) await new Promise(r => requestAnimationFrame(r));
            }

        }
    }, [strokes, drawStrokeSegment]);

    const exportSVG = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" style="background-color: ${BG_COLOR}">\n`;
        strokes.forEach((stroke) => {
            if (stroke.points.length < 2) return;
            if (stroke.brushType === 'eraser') return

            const smoothed = catmullRomPoints(stroke.points);
            let d = `M ${smoothed[0].x - cx} ${smoothed[0].y - cy}`;
            for (let p = 1; p < smoothed.length; p++) {
                d += ` L ${smoothed[p].x - cx} ${smoothed[p].y - cy}`;
            }

            const angleStep = 360 / stroke.symmetryCount;

            for (let i = 0; i < stroke.symmetryCount; i++) {
                const angle = i * angleStep;
                svgStr += `  <g transform="translate(${cx}, ${cy}) rotate(${angle})">\n`;
                svgStr += `    <path d="${d}" stroke="${stroke.brushColor}" fill="none" stroke-width="${stroke.brushSize}" stroke-opacity="${stroke.brushOpacity}" stroke-linecap="round" stroke-linejoin="round" />\n`;
                svgStr += `  </g>\n`;
                if (stroke.mirror) {
                    svgStr += `  <g transform="translate(${cx}, ${cy}) rotate(${angle}) scale(-1, 1)">\n`;
                    svgStr += `    <path d="${d}" stroke="${stroke.brushColor}" fill="none" stroke-width="${stroke.brushSize}" stroke-opacity="${stroke.brushOpacity}" stroke-linecap="round" stroke-linejoin="round" />\n`;
                    svgStr += `  </g>\n`;
                }
            }
        });

        svgStr += `</svg>`;
        const blob = new Blob([svgStr], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a");
        link.download = `drawglow_vector_${Date.now()}.svg`;

        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }, [strokes])

    const exportVideo = useCallback(async () => {
        const canvas = canvasRef.current
        if (!canvas) return;

        const stream = canvas.captureStream(60);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        return new Promise<void>((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a');
                a.href = url;
                a.download = `drawglow_timelapse_${Date.now()}.webm`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
                resolve();
            };

            recorder.start();
            playTimeLapse().then(() => {
                recorder.stop();
            });
        });
    }, [playTimeLapse])

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        getContext: () => canvasRef.current?.getContext('2d') ?? null,
        toDataURL: () => canvasRef.current?.toDataURL() ?? '',
        redrawStrokes: performRedraw,
        playTimeLapse,
        exportSVG,
        exportVideo
    }));

    useEffect(() => {
        performRedraw(strokes);
    }, [strokes, performRedraw, showGrid, showRefImage]);
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
                setZoomLevel(newScale);
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

    const stopDrawing = useCallback(() => {
        if (isDrawing.current && currentStroke.current && currentStroke.current.points.length > 1) {
            onStrokeEnd(currentStroke.current);
            playStrokeEnd();
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
        
        if (brushType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 0;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
            ctx.fillStyle = brushColor;
            ctx.shadowBlur = glow ? brushSize * 3 : 0;
            ctx.shadowColor = glow ? brushColor : 'transparent';
        }

        drawStrokeSegment(ctx, currentStroke.current, lastPos.current, currentPos, canvas.width / 2, canvas.height / 2);

        ctx.restore();

        currentStroke.current.points.push(currentPos);
        lastPos.current = currentPos;
    }, [brushSize, brushType, brushColor, brushOpacity, getCoordinates, glow, drawStrokeSegment]);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        playStrokeStart()
        const startPos = getCoordinates(e);
        lastPos.current = startPos;
        
        currentStroke.current = {
            points: [startPos],
            brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, brushType, layerId:activeLayerId
        };
    }, [getCoordinates, brushType, brushColor, brushSize, brushOpacity, glow, mirror, symmetryCount, activeLayerId]);

    useEffect(() => {
        const handleGlobalUp = () => stopDrawing();

        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);

        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [stopDrawing]);

    const handleZoomUI = (direction: 'in' | 'out' | 'reset' ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let newScale = viewport.current.scale;
        if (direction === 'in') newScale *= 1.25
        if (direction === 'out') newScale /= 1.25
        if (direction === 'reset') {
            viewport.current = { x: 0, y: 0, scale: 1 };
            newScale = 1
        }

        newScale = Math.max(0.1, Math.min(newScale, 15))

        if (direction !== 'reset') {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            viewport.current.x = centerX - (centerX - viewport.current.x) * (newScale / viewport.current.scale);
            viewport.current.y = centerY - (centerY - viewport.current.y) * (newScale / viewport.current.scale)
        }

        viewport.current.scale = newScale
        setZoomLevel(newScale);
        requestAnimationFrame(() => performRedraw(strokes));
    };

       return (
        <div className="absolute inset-0">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchMove={draw}
            />

            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
                <button 
                  onClick={() => handleZoomUI('reset')} 
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center justify-center shadow-lg transition-colors"
                  title="Reset View"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                <div className="flex flex-col bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg overflow-hidden">
                    <button 
                      onClick={() => handleZoomUI('in')}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-8 flex items-center justify-center text-[10px] font-bold text-zinc-500 bg-black/20 select-none">
                      {Math.round(zoomLevel * 100)}%
                    </div>
                    <button 
                      onClick={() => handleZoomUI('out')}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

Canvas.displayName = 'Canvas';
export default React.memo(Canvas); 