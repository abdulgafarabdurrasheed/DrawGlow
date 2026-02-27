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

    return (
        <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-white select-none relative">
            <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none" style={{ touchAction: 'none' }}></canvas>
        </div>
    );
}

export default App
